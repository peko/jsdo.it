// forked from akm2's "Noise Arts" http://jsdo.it/akm2/iWuH
// forked from akm2's "Noise Abstraction" http://jsdo.it/akm2/ncsw
/**
 * SimplexNoise class,
 * Point class
 * @see http://jsdo.it/akm2/2e21
 */

var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 465;
var IMAGE_URL = [
    'http://jsrun.it/assets/s/M/6/G/sM6GB.jpg',
    'http://jsrun.it/assets/z/x/d/q/zxdqc.jpg',
    'http://jsrun.it/assets/9/e/5/u/9e5un.jpg'
];
var IMAGE_NUM = IMAGE_URL.length;
var PERTICLE_NUM = 1000;
var STEP_MAX = 15; // ステップの最大値と最小値, 小さいほど詳細
var STEP_MIN = 5;
var Z_INC = 0.0035;
var C_INC = 0.175;

var canvas;
var context;
var perticles = [];
var simplexNoise = new Akm2.SimplexNoise();
var zoff = 0;
var currentImageIndex;
var lightnessMaps = [];
var time;
var color1;
var color2;
var rot1;
var rot2;

function init() {
    canvas = document.getElementById('c');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    context = canvas.getContext('2d');
    
    context.lineWidth = 0.3;
    context.lineCap = context.lineJoin = 'round';
    
    for (var i = 0; i < PERTICLE_NUM; i++) {
        perticles[i] = new Perticle();
    }
    
    currentImageIndex = Akm2.randInt(IMAGE_NUM - 1);
    
    loadImages(IMAGE_URL, function(images) {
        for (var i = 0, len = images.length; i < len; i++) {
            lightnessMaps.push(new LightnessMap(images[i]));
        }
        
        document.addEventListener('click', click, false);
        time = new Date().getTime();
        setInterval(loop, 1000 / 60);
    });
    
    rondomizeColor();
}

function loadImages(url, callback) {
    var num = url.length;
    var count = 0;
    var img, imgs = [];
    
    for (var i = 0; i < num; i++) {
        img = new Image();
        img.addEventListener('load', function(e) {
            count++;
            imgs.push(e.target);
            if (num === count) callback(imgs);
        }, false);
        img.src = url[i] + '?' + new Date().getTime();
    }
}

function click() {
    rondomizeColor();
    currentImageIndex = (currentImageIndex + 1) % IMAGE_NUM;
    time = new Date().getTime();
    simplexNoise.seed(new Date().getTime());
}

function loop() {
    var sw = SCREEN_WIDTH;
    var sh = SCREEN_HEIGHT;
    var mix = Color.mix;
    var p, px, py, latest, j, angle;
    var data = lightnessMaps[currentImageIndex].data;
    var rgb = [];
    var ANGLE_RANGE = Math.PI * 6;
    var TO_RATE_SW = 1 / sw;
    var TO_RATE_SH = 1 / sh;
    
    for (var i = 0, len = perticles.length; i < len; i++) {    	
    	p = perticles[i];
        px = p.x;
        py = p.y;
    	latest = p.latest;
    	
    	if (px >= 0 && px <= sw && py >= 0 && py <= sh) {
    	    j = (px | 0) + (py | 0) * sw;
    	    c = mix(color1, color2, data[j]);
        	context.beginPath();
        	rgb[0] = (c >> 16) & 0xFF;
        	rgb[1] = (c >> 8) & 0xFF
        	rgb[2] = c & 0xFF;
        	context.strokeStyle = 'rgba(' + rgb.join(',') + ', 0.35)';
        	context.moveTo(latest.x, latest.y);
        	context.lineTo(px, py);
        	context.stroke();
    	}
    	
    	latest.set(p);
    	
    	angle = ANGLE_RANGE * simplexNoise.noise(px * TO_RATE_SW * 0.75, py * TO_RATE_SH * 0.75, zoff);
        p.add(Akm2.Point.polar(p.step, angle));
    	
    	if (px < -10 || px > sw + 10 || py < 0 - 10 || py > sh + 10) {
    	    p.reborn();
    	}
    }
    
    zoff += Z_INC;
    
    rot1 = (rot1 + C_INC) % 360;
    rot2 = (rot2 + C_INC) % 360;
    color1 = Color.cycle(rot1);
    color2 = Color.cycle(rot2);
    
    var now = new Date().getTime();
    if (now - time > 60000) {
        currentImageIndex = (currentImageIndex + 1) % IMAGE_NUM;
        time = now;
    }
}

function rondomizeColor() {
    rot1 = 360 * Math.random();
    rot2 = (rot1 + 180) % 360;
    color1 = Color.cycle(rot1);
    color2 = Color.cycle(rot2);
}


/**
 * Color helper
 */
var Color = {
    // RGB -> HSL の変換を彩度 100, 明度 50 に固定して角度から RGB を取得する
    cycle: function(deg) {
        var r = this._hueToRgb(deg + 120) * 0xFF | 0;
        var g = this._hueToRgb(deg)       * 0xFF | 0;
        var b = this._hueToRgb(deg - 120) * 0xFF | 0;
        return 255 << 24 | (r << 16) | (g << 8) | b;
    },
    
    _hueToRgb: function(h) {
        if (h < 0)   h += 360;
        if (h > 360) h -= 360;
        if (h < 60)  return h / 360 * 6;
        if (h < 180) return 1;
        if (h < 240) return (2 / 3 - h / 360) * 6;
        return 0;
    },
    
    // 2 色の混合色を返す
    // @see http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html#mix-instance_method
    mix: function(c1, c2, w2) {
        var r1 = c1 >> 16 & 0xFF, g1 = c1 >> 8 & 0xFF, b1 = c1 & 0xFF;
        var r2 = c2 >> 16 & 0xFF, g2 = c2 >> 8 & 0xFF, b2 = c2 & 0xFF;

        var w1 = 1 - w2;

        var r = (r1 * w1 + r2 * w2 + 1) & 0xFF;
        var g = (g1 * w1 + g2 * w2 + 1) & 0xFF;
        var b = (b1 * w1 + b2 * w2 + 1) & 0xFF;

        return 255 << 24 | (r << 16) | (g << 8) | b;
    }
};


/**
 * Perticle　class
 */
function Perticle() {
    Akm2.Point.call(this);
    this.latest = new Akm2.Point();
    this.reborn();
}

Perticle.prototype = Akm2.extend(new Akm2.Point(), {
    reborn: function() {
        this.set(Akm2.randUniform(SCREEN_WIDTH), Akm2.randUniform(SCREEN_HEIGHT));
        this.latest.set(this);
        this.step = Akm2.randUniform(STEP_MAX, STEP_MIN);
    }
});


/**
 * LightnessMap class
 */
function LightnessMap(image) {
    var c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.width;
    var ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
    var data = ctx.getImageData(0, 0, image.width, image.width).data;
    
    var i, len = image.width * image.height;
    var lightness = new Float32Array(len);
    var j, r, g, b, max, min;
    var TO_RATE = 1 / 255;
    
    for (i = 0; i < len; i++) {
        j = i * 4;
        r = data[j];
        g = data[j + 1];
        b = data[j + 2];
        max = (max = r > g ? r : g) > b ? max : b;
        min = (min = r < g ? r : g) < b ? max : b;
        lightness[i] = 1 - (max + min) * 0.5 * TO_RATE;
    }
    
    this.data = lightness;
}

// Init
window.addEventListener('load', init, false);
