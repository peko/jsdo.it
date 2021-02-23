// #! jsx

import 'js/web.jsx';
import 'timer.jsx';

class Config {
    static const SCREEN_WIDTH = 465;
    static const SCREEN_HEIGHT = 465;
    static const PARTICLE_NUM = 30000;
    // ノイズを作成するサイズ, 大きいほど詳細
    static const NOISE_WIDTH = 16;
    static const NOISE_HEIGHT = 16;
}

class _Main {
    
	static function main(args:string[]):void {
	    var document = dom.window.document;
	    
        var screenWidth = Config.SCREEN_WIDTH;
        var screenHeight = Config.SCREEN_HEIGHT;
        
		var canvas = dom.id('c') as HTMLCanvasElement;
        canvas.width = screenWidth;
        canvas.height = screenHeight;
		var context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillRect(0, 0, screenWidth, screenHeight);
        var imageData = context.getImageData(0, 0, screenWidth, screenHeight);
        
        // パーティクルを生成
        var particles = []:Particle[];
        for (var i = 0, len = Config.PARTICLE_NUM; i < len; i++) {
            particles.push(new Particle(
                Math.random() * screenWidth,
                Math.random() * screenHeight
            ));
        }
        
        // マップの初期化と生成
        NoiseMap.initialize(Config.NOISE_WIDTH, Config.NOISE_HEIGHT);
        NoiseMap.generate();
        var noiseDisplay = false; // 確認用にノイズ参照用の canvas を表示する
        
        var mouseX = screenWidth / 2;
        var mouseY = screenHeight / 2;
        
        // Mouse move event handler
        document.addEventListener('mousemove', function(e:Event):void {
            var me = e as MouseEvent;
            mouseX = me.clientX;
            mouseY = me.clientY;
            
            var sw = Config.SCREEN_WIDTH, sh = Config.SCREEN_HEIGHT;
            if (mouseX < 0) {
                mouseX = 0;
            } else if (mouseX > sw) {
                mouseX = sw;
            }
            if (mouseY < 0) {
                mouseY = 0;
            } else if (mouseY > sh) {
                mouseY = sh;
            }
        }, false);
        
        // Click event handler
        document.addEventListener('click', function(e:Event):void {
            NoiseMap.generate();
        }, false);
        
        // Key down event handler
        document.addEventListener('keydown', function(e:Event):void {
            var ke = e as KeyboardEvent;
            if (ke.keyCode == 78) { // n key
                noiseDisplay = !noiseDisplay;
            }
        }, false);
        
        // フレームレート表示を初期化
        FPS.initialize();
        
		Timer.setInterval(function():void {
		    // fillRect を使用せず, 全てのピクセルを走査して色の値を半分に
            var data = imageData.data;
            for (var i = 0, len = data.length; i < len; i += 4) {
              data[i]     >>= 1;
              data[i + 1] >>= 1;
              data[i + 2] >>= 1;
            }
            
            var sw = Config.SCREEN_WIDTH;
		    var sh = Config.SCREEN_HEIGHT;
            
            // マウス位置によってマップの該当ピクセル位置を変更
            var off = ((mouseY >> 1) << 2) * sw + ((mouseX >> 1) << 2);
            
            var noiseData = NoiseMap.data;
            var p:Particle, px:number, py:number, ps:number;
            var vx:number, vy:number;
            var ch0:number, ch1:number, ch2:number;
            var j:int, k:int;
            
            for (var i = 0, len = particles.length; i < len; i++) {
                p = particles[i];
                px = p.x;
                py = p.y;
                ps = p.scale;
                
                // マップから値をとって速度に反映させる
                k = ((py >> 1) << 2) * sw + ((px >> 1) << 2) + off;
                vx = p.vx * 0.98 + (noiseData[k]     - 128) * ps;
                vy = p.vy * 0.98 + (noiseData[k + 1] - 128) * ps;
                
                px += vx;
                py += vy;
                if (px < 0) {
                    px += sw;
                } else if (px > sw) {
                    px -= sw;
                }
                if (py < 0) {
                    py += sh;
                } else if (py > sh) {
                    py -= sh;
                }
                
                j = ((px | 0) + (py | 0) * sw) << 2;
                // 数値の整形を Uint8ClampedArray に任せてみる
                data[j]     += 21;
                data[j + 1] += 75;
                data[j + 2] += 66;
                
                p.vx = vx;
                p.vy = vy;
                p.x = px;
                p.y = py;
            }
            
            if (!noiseDisplay) {
                context.putImageData(imageData, 0, 0);
            } else {
                // 確認用にノイズ参照用のキャンバスを表示
                context.drawImage(NoiseMap.canvas, 0, 0, sw, sh);
            }
            
            // フレームレートチェック
            FPS.countFrame();
            
		}, 1000 / 60);
	}
	
	static function loop():void {
	    
	}
}


/*
 * Particle
 */
class Particle {
    
    var x:number = 0;
    var y:number = 0;
    var vx:number = 0;
    var vy:number = 0;
    var scale:number = 0;
    
    function constructor() {}
    
    function constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
        this.scale = Math.random() * 0.004 + 0.004;
    }
}


/*
 * NoiseMap
 * 
 * ノイズでフォースマップを作成する
 * ノイズ生成は Simplex Noise
 * 
 * @see SimplexNoise
 */
class NoiseMap {
    
    // マップのピクセルデータ
    static var data:Uint8ClampedArray;
    // マップを描画した canvas, 確認用
    static var canvas:HTMLCanvasElement;
    
    // 試しに Singleton っぽく
    static var instance:NoiseMap;
    static function initialize(width:number, height:number):void {
        if (!NoiseMap.instance) NoiseMap.instance = new NoiseMap(width, height);
    }
    
    /**
     * マップを生成してピクセルデータを返す
     * 
     * @return Uint8ClampedArray
     * @static
     */
    static function generate():Uint8ClampedArray {
        return NoiseMap.instance.generate();
    }
    
    var noiseCanvas:HTMLCanvasElement; // ノイズ描画用キャンバス
    var mapCanvas:HTMLCanvasElement; // マップ用キャンバス
    var simplexNoiseX:SimplexNoise; // SimplexNoise x 座標用
    var simplexNoiseY:SimplexNoise; // SimplexNoise y 座標用
    
    function constructor(width:number, height:number) {
        if (NoiseMap.instance) throw new Error('既にインスタンスが作成されています');
        NoiseMap.instance = this;
        
        this.noiseCanvas = dom.window.document.createElement('canvas') as HTMLCanvasElement;
        this.noiseCanvas.width  = width;
        this.noiseCanvas.height = height;
        
        this.mapCanvas = dom.window.document.createElement('canvas') as HTMLCanvasElement;
        this.mapCanvas.width  = Config.SCREEN_WIDTH;
        this.mapCanvas.height = Config.SCREEN_HEIGHT;
        
        this.simplexNoiseX = new SimplexNoise();
        this.simplexNoiseY = new SimplexNoise();
        
        NoiseMap.canvas = this.mapCanvas;
    }
    
    /**
     * マップを生成してピクセルデータを返す
     * 
     * @return Uint8ClampedArray
     */
    function generate():Uint8ClampedArray {
        // ノイズ描画用のキャンバスの準備
		var noiseCanvasWidth  = this.noiseCanvas.width;
		var noiseCanvasHeight = this.noiseCanvas.height;
		var noiseContext      = this.noiseCanvas.getContext('2d') as CanvasRenderingContext2D;
        var noiseImageData    = noiseContext.getImageData(0, 0, noiseCanvasWidth, noiseCanvasHeight);
        var noiseData         = noiseImageData.data;
        
        // シードを変更
        var time = new Date().getTime();
        this.simplexNoiseX.seed(time);
        this.simplexNoiseY.seed(Math.floor(Math.random() * time));
        
        for(var y = 0, x:int, i:int; y < noiseCanvasHeight; y++) {
            for(x = 0; x < noiseCanvasWidth; x++) {
                i = (x + y * noiseCanvasWidth) * 4;
                noiseData[i]     = this.simplexNoiseX.noise(x, y) * 255;
                noiseData[i + 1] = this.simplexNoiseY.noise(x, y) * 255;
                noiseData[i + 3] = 255;
            }
        }
        
        noiseContext.putImageData(noiseImageData, 0, 0);
        
        // マップ用キャンバスに引き延ばして描画
		var mapCanvasWidth  = this.mapCanvas.width;
		var mapCanvasHeight = this.mapCanvas.height;
		var mapContext      = this.mapCanvas.getContext('2d') as CanvasRenderingContext2D;
        mapContext.drawImage(this.noiseCanvas, 0, 0, mapCanvasWidth, mapCanvasHeight);
        
        return NoiseMap.data = mapContext.getImageData(0, 0, mapCanvasWidth, mapCanvasHeight).data;
    }
}



/*
 * FPS
 */
class FPS {
    
    static var instance:FPS;
    
    static function initialize():void {
        if (!FPS.instance) FPS.instance = new FPS();
    }
    
    static function countFrame():void {
        FPS.instance.countFrame();
    }
    
    var count:int = 0;
    var last:number = 0;
    var view:HTMLElement;
    
    function constructor() {
        if (FPS.instance) throw new Error('既にインスタンスが作成されています');
        FPS.instance = this;
        
        this.last = new Date().getTime();
        
        var view = dom.window.document.createElement('div') as HTMLElement;
        view.id = 'fps';
        view.style.color = 'rgb(70, 255, 220)';
        view.style.fontSize = '10px';
        view.style.position = 'absolute';
        view.style.top = '5px';
        view.style.left = '5px';
        view.innerHTML = 'FPS';
        dom.window.document.body.appendChild(view);
        this.view = view;
    }
    
    function countFrame():void {
        this.count++;
        if (this.count == 60) {
            var now = new Date().getTime();
            this.view.innerHTML = 'FPS ' + (1000 / ((now - this.last) / this.count)).toFixed(2);
            this.count = 0;
            this.last = now;
        }
    }
}



/*
 * SimplexNoise
 * 
 * @see http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
 */
class SimplexNoise {
    // 全部の配列に型を指定しないと以下のエラー
    // no function with matching arguments
    // n0 = t0 * t0 * this._dot2d(GRAD3[gi0], x0, y0);
    static const GRAD3 = [
        [1, 1, 0]:int[], [-1, 1, 0]:int[], [1, -1, 0]:int[], [-1, -1, 0]:int[],  
        [1, 0, 1]:int[], [-1, 0, 1]:int[], [1, 0, -1]:int[], [-1, 0, -1]:int[],  
        [0, 1, 1]:int[], [0, -1, 1]:int[], [0, 1, -1]:int[], [0, -1, -1]:int[]
    ]:int[][];
    
    var octaves = 4;
    var fallout = 0.5;
    
    var _perm:int[];
    
    function constructor() {
        this.seed(new Date().getTime());
    }
    
    function constructor(seed:number) {
        this.seed(seed);
    }
    
    function seed(seed:number):void {
        // cannot assign a member function
        // var random = new Alea(seed).random;
        var gen = new Alea(seed);

        var i = 0;
        var p:int[] = []:int[];
        for (; i < 256; i++) {
            p[i] = Math.floor(gen.random() * 256);
        }

        var perm:int[] = []:int[];
        for (i = 0; i < 512; i++) {
            perm[i] = p[i & 255];
        }
        
        this._perm = perm;
    }
    
    function noise(x:number):number {
        return this._noise(function(f:number):number { return this.noise2d(x * f, 0); });
    }
    
    function noise(x:number, y:number):number {
        return this._noise(function(f:number):number { return this.noise2d(x * f, y * f); });
    }
    
    function noise(x:number, y:number, z:number):number {
        return this._noise(function(f:number):number { return this.noise3d(x * f, y * f, z * f); });
    }
    
    function _noise(generator:(number) -> number):number {
        var octaves = this.octaves;
        var fallout = this.fallout;
        var amplitude = 1;
        var frequency = 1;
        var noise = 0;
    
        for (var i = 0; i < octaves; ++i) {
            amplitude *= fallout;
            noise += amplitude * (1 + generator(frequency)) * 0.5;
            frequency *= 2;
        }
        
        return noise;
    }
    
    function noise2d(x:number, y:number):number {
        var GRAD3 = SimplexNoise.GRAD3;
        var perm = this._perm;
        
        var n0 = 0, n1 = 0, n2 = 0;

        var F2 = 0.5 * (Math.sqrt(3) - 1); 
        var s = (x + y) * F2;
        var i = Math.floor(x + s); var j = Math.floor(y + s);

        var G2 = (3 - Math.sqrt(3)) / 6;
        var t = (i + j) * G2; 
        var X0 = i - t;  var Y0 = j - t; 
        var x0 = x - X0; var y0 = y - Y0;

        var i1 = 0, j1 = 0;
        if (x0 > y0) {
            i1 = 1; j1 = 0; 
        } else {
            i1 = 0; j1 = 1;
        }

        var x1 = x0 - i1 + G2;    var y1 = y0 - j1 + G2; 
        var x2 = x0 - 1 + 2 * G2; var y2 = y0 - 1 + 2 * G2;

        var ii = i & 255; var jj = j & 255;
        var gi0 = perm[ii + perm[jj]] % 12; 
        var gi1 = perm[ii + i1 + perm[jj + j1]] % 12; 
        var gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

        var t0 = 0.5 - x0 * x0 - y0 * y0; 
        if (t0 < 0) {
            n0 = 0; 
        } else { 
            t0 *= t0;
            n0 = t0 * t0 * this._dot2d(GRAD3[gi0], x0, y0);
        }

        var t1 = 0.5 - x1 * x1 - y1 * y1; 
        if (t1 < 0) {
            n1 = 0; 
        } else { 
            t1 *= t1; 
            n1 = t1 * t1 * this._dot2d(GRAD3[gi1], x1, y1); 
        }

        var t2 = 0.5 - x2 * x2 - y2 * y2; 
        if (t2 < 0) {
            n2 = 0; 
        } else { 
            t2 *= t2; 
            n2 = t2 * t2 * this._dot2d(GRAD3[gi2], x2, y2); 
        }

        return 70 * (n0 + n1 + n2);
    }

    function noise3d(x:number, y:number, z:number):number {
        var GRAD3 = SimplexNoise.GRAD3;
        var perm = this._perm;
        
        var n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    
        var F3 = 1 / 3;
        var s = (x + y + z) * F3;
        var i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    
        var G3 = 1 / 6;
        var t = (i + j + k) * G3; 
        var X0 = i - t;  var Y0 = j - t;  var Z0 = k - t;
        var x0 = x - X0; var y0 = y - Y0; var z0 = z - Z0;
    
        var i1:number, j1:number, k1:number;
        var i2:number, j2:number, k2:number;
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0;
                i2 = 1; j2 = 1; k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0;
                i2 = 1; j2 = 0; k2 = 1;
            } else {
                i1 = 0; j1 = 0; k1 = 1;
                i2 = 1; j2 = 0; k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0; j1 = 0; k1 = 1;
                i2 = 0; j2 = 1; k2 = 1;
            } else if (x0 < z0) {
                i1 = 0; j1 = 1; k1 = 0;
                i2 = 0; j2 = 1; k2 = 1;
            } else {
                i1 = 0; j1 = 1; k1 = 0;
                i2 = 1; j2 = 1; k2 = 0;
            }
        }
    
        var x1 = x0 - i1 + G3;     var y1 = y0 - j1 + G3;     var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2 * G3; var y2 = y0 - j2 + 2 * G3; var z2 = z0 - k2 + 2 * G3;
        var x3 = x0 - 1 + 3 * G3;  var y3 = y0 - 1 + 3 * G3;  var z3 = z0 - 1 + 3 * G3;
    
        var ii = i & 255; var jj = j & 255; var kk = k & 255;
        var gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
        var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
        var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
        var gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;
    
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this._dot3d(GRAD3[gi0], x0, y0, z0);
        }
    
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this._dot3d(GRAD3[gi1], x1, y1, z1);
        }
    
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this._dot3d(GRAD3[gi2], x2, y2, z2);
        }
    
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * this._dot3d(GRAD3[gi3], x3, y3, z3);
        }
    
        return 32 * (n0 + n1 + n2 + n3);
    }
    
    // Helpers
    
    function _dot2d(g:int[], x:number, y:number):number {
        return g[0] * x + g[1] * y;
    }

    function _dot3d(g:int[], x:number, y:number, z:number):number {
        return g[0] * x + g[1] * y + g[2] * z;
    }
}

/*
 * Alea
 * 
 * @see http://baagoe.com/en/RandomMusings/javascript/
 */
class Alea {
    
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;
    
    // 可変長引数できない？
    
    function constructor() {
        this._init([new Date().getTime()]:number[]);
    }
    
    function constructor(seed:number) {
        this._init([seed]:number[]);
    }
    
    function constructor(seeds:number[]) {
        this._init(seeds);
    }
    
    function _init(seeds:number[]):void {
        
        // Mash function
        var n = 0xefc8249d;
        var mash = function(data:string):number {
            for (var i = 0, len = data.length, h:number; i < len; i++) {
                n += data.charCodeAt(i);
                h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000;
            }
            return (n >>> 0) * 2.3283064365386963e-10;
        };
        
        var s0 = mash(' ');
        var s1 = mash(' ');
        var s2 = mash(' ');
        for (var i = 0, len = seeds.length, seed:string; i < len; i++) {
            seed = seeds[i] as string;
            s0 -= mash(seed);
            if (s0 < 0) s0 += 1;
            s1 -= mash(seed);
            if (s1 < 0) s1 += 1;
            s2 -= mash(seed);
            if (s2 < 0) s2 += 1;
        }
        
        this.s0 = s0;
        this.s1 = s1;
        this.s2 = s2;
    }
    
    function random():number {
        var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10;
        this.s0 = this.s1;
        this.s1 = this.s2;
        return this.s2 = t - (this.c = t | 0);
    }
    
    function uint32():int {
        return this.random() * 0x100000000;
    }
    
    function fract53():number {
        return this.random() + (this.random() * 0x200000 | 0) * 1.1102230246251565e-16;
    }
}
