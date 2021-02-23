// forked from peko's "Particle Triangulation with Velocity Map" http://jsdo.it/peko/mVB7
// forked from akm2's "Particle Triangulation" http://jsdo.it/akm2/cu5u
// Configs
var PARTICLE_NUM = 50;　// 開始時パーティクル数
var PARTICLE_MAX_NUM = 300;　// 最大パーティクル数
var PARTICLE_DEF_SPEED_MAX = 3; // パーティクルの最大初速
var PARTICLE_DEF_SPEED_MIN = 1; // パーティクルの最小初速
var PARTICLE_RADIUS = 2; // パーティクルの基本半径
var PARTICLE_OUTER_WIDTH = 3; // パーティクルの外枠の太さ
var PARTICLE_RANGE = 20; // パーティクル同士が干渉する距離
var STROKE_RANGE = 60; // パーティクル間に線が引かれる距離
var PARTICLE_CLICK_ADD_NUM = 5; // クリックで追加するパーティクル数
var BACKGROUND_COLOR = '#DDD'; // 背景色
var PARTICLE_COLOR   = '#222'; // パーティクルと線の色

var colors = ["#CE0071","#A62169","#960052","#E33293","#E359A5",
              "#FFAB00","#CD9728","#B97C00","#FFBE38","#FFCC64",
              "#123EAB","#27438A","#08297C","#3F68D0","#5F7FD0",
              "#9BED00","#8ABF25","#71AC00","#B3F535","#C2F560"];

var chr;

// Constants
var PARTICLE_RANGE_SQ = PARTICLE_RANGE * PARTICLE_RANGE;
var STROKE_RANGE_SQ = STROKE_RANGE * STROKE_RANGE;

// Vars
var canvas, context;
var screenWidth, screenHeight;
var delaunay;
var particles = [];

var fw = 128;
var fh = 128;
var field;

/**
 * requestAnimationFrame
 */
var requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function createContext(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    return canvas.getContext("2d");
}

function createField(W, H, iter) {

    var chars = "☆★☹☺☼♌♈♉♊♋♌♍♎♏♐♑♒♓☮☯♬♫♪♩♡♥✈✩";
    var ctx = createContext(W, H);
    chr = chars.charAt(Math.floor(Math.random()*chars.length));
    ctx.fillStyle = "rgba(127, 127, 127, 1)";
    ctx.fillRect(0, 0, W, H);
    
    ctx.font = "normal normal " + H/1.2+ "px arial";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    var tw = ctx.measureText(chr).width;
    ctx.fillText(chr, (W-tw)/2, H/1.2);
	
    
	var img = ctx.getImageData(0,0, W, H);
   
    for (var x=0; x<W; x++) {
        for (var y=0; y<H; y++) {
        	var dx = W/2 - x; 
            var dy = H/2 - y; 
            var ll = Math.sqrt(dx*dx+dy*dy) / W * 2;
            img.data[(x+y*W)*4  ] = 127;//+dx / ll / 2;
            img.data[(x+y*W)*4+1] = 127;//+dy / ll / 2;
            img.data[(x+y*W)*4+2] = 127;
            img.data[(x+y*W)*4+3] = 255;
            
        }
    }
   
   var ref = ctx.getImageData(0,0, W, H);
   for(var i=0; i<iter; i++)  {
       
        for (var p=W+1; p<W*H-W-1; p++) {
            img.data[p*4  ] += (ref.data[(p+1)*4]-ref.data[(p-1)*4+2]);
            img.data[p*4+1] += (ref.data[(p+W)*4]-ref.data[(p-W)*4+2]);
        }
        
        for (var p=W+1; p<W*H-W-1; p++) {
            img.data[p*4  ] = (
                             img.data[(p+1  )*4] + img.data[(p-1  )*4] +
                             img.data[(p+W  )*4] + img.data[(p-W  )*4] +
                             img.data[(p+1+W)*4] + img.data[(p-1-W)*4] +
                             img.data[(p+1-W)*4] + img.data[(p-1+W)*4])/8;
            
            img.data[p*4+1] = ( 
                             img.data[(p+1  )*4+1] + img.data[(p-1  )*4+1] +
                             img.data[(p+W  )*4+1] + img.data[(p-W  )*4+1] +
                             img.data[(p+1+W)*4+1] + img.data[(p-1-W)*4+1] +
                             img.data[(p+1-W)*4+1] + img.data[(p-1+W)*4+1])/8;
            
            img.data[p*4+2] = (
                             img.data[(p+2  )*4+2] + img.data[(p-1  )*4+2] +
                             img.data[(p+W  )*4+2] + img.data[(p-W  )*4+2] +
                             img.data[(p+1+W)*4+2] + img.data[(p-1-W)*4+2] +
                             img.data[(p+1-W)*4+2] + img.data[(p-1+W)*4+2])/8;
            
        }      
    }
    
    return img;
}

/**
 * Init
 */
function init() {
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    
    canvas = document.getElementById('c');
    
    window.addEventListener('resize', resize, false);
    resize(null);
    
    delaunay = new Delaunay(screenWidth, screenHeight);
    field = createField(fw, fh, 10);
    
    var i;
    
    for (i = 0; i < PARTICLE_NUM; i++) {
        addParticle(Math.random() * screenWidth, Math.random() * screenHeight);
    }
    
    document.addEventListener('click', click, false);
    requestAnimationFrame(loop);
}

/**
 * Resize event handler
 */
function resize(e) {
    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    context.lineWidth = 0.3;
    context.fillStyle = context.strokeStyle = PARTICLE_COLOR;
    context.lineCap = context.lineJoin = 'round';
    
    if (delaunay) {
        delaunay.width = screenWidth;
        delaunay.height = screenHeight;
    }
}

/**
 * Mouse click event handler
 */
function click(e) {
    if (e.shiftKey) {
        for (var i = 0; i < PARTICLE_CLICK_ADD_NUM; i++) {
            addParticle(e.clientX, e.clientY);
        } 
	}else {
       field = createField(fw, fh, 10);
        for (var i = 0; i < particles.length; i++) {
            var pa = particles[i];
            var dx = pa.x - screenWidth /2;
            var dy = pa.y - screenHeight/2;
            var ln = dx*dx+dy*dy;
            pa.vx += -dx*0.1+dy*0.2;
            pa.vy += -dy*0.1-dx*0.2;
            
        }
    }
}

/**
 * Animation loop
 */
function loop() {
    
    var w = screenWidth;
    var h = screenHeight;
    var ctx = context;
    
    ctx.save();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, w, h);
    //if (field) ctx.putImageData(field, 0, 0);
    
    if(chr) {
        ctx.font = "normal normal 64px arial";
        ctx.fillStyle = "rgba(128, 128, 128, 0.15)";
        ctx.fillText(chr, 10, 10+50);
        ctx.font = "normal normal 32px arial";
        ctx.fillText(particles.length, 72, 48);
        
    }
    ctx.restore();
    
    // 三角形をクリア
    delaunay.clear();
    
    var i, ilen, pa;
    var j, pb;
    var dx, dy, distSq, ax, ay;
    
    // パーティクルの処理
    for (ilen = particles.length, i = 0; i < ilen; i++) {
        pa = particles[i];
      	
		var fp = Math.floor(pa.x / w * fw) * 4 +      // field x
            	 Math.floor(pa.y / h * fh) * 4 * fw ; // field y
        if (fp>0 && fp<fw*fh*4) {
            pa.vx -= (127 - field.data[fp  ])/256; // R chanel
            pa.vy -= (127 - field.data[fp+1])/256; // G chanel
        }
        pa.vx *= 0.96;
        pa.vy *= 0.96;
        
        if (Math.random()>0.9) {
            pb = particles[Math.floor(particles.length*Math.random())];
            dx = pb.x-pa.x;
            dy = pb.y-pa.y;
            distSq = dx*dx+dy*dy;
            if (distSq > PARTICLE_RANGE_SQ) {
               	ax = dx * 0.001;
                ay = dy * 0.001;
                pa.vx += ax;
                pa.vy += ay;
                pb.vx -= ax;
                pb.vy -= ay;
            }
        }
          
        for (j = 0; j < ilen; j++) {
            if (i === j) continue;
            
            pb = particles[j];
            
            dx = pa.x - pb.x;
            dy = pa.y - pb.y;
            distSq = dx * dx + dy * dy;
            if (distSq < PARTICLE_RANGE_SQ) {
                ax = dx * 0.02;
                ay = dy * 0.02;
                pa.vx += ax;
                pa.vy += ay;
                pb.vx -= ax;
                pb.vy -= ay;
            }
        }
        
        pa.x += pa.vx;
        pa.y += pa.vy;
        
        // 反対側に出現
        if (pa.x < 0) pa.x = w;
        if (pa.x > w) pa.x = 0;
        if (pa.y < 0) pa.y = h;
        if (pa.y > h) pa.y = 0;
      
    }
    
    // 三角形分割して三角形を取得
    var triangles = delaunay.multipleInsert(particles).getTriangles();
    
    var t, edges, edge;
    var polygon = [];
    var k, klen;
    
    // 重複しない辺を取得
    for (ilen = triangles.length, i = 0; i < ilen; i++) {
        t = triangles[i];
        
        // 四隅に接する三角形 (いずれかのノードの識別子が null -> 三角形の識別子が null) の場合は描画をスキップ
        if (t.id === null) continue;
        
        edges = t.edges;
        
        edgesLoop: for (j = 0; j < 3; j++) {
            edge = edges[j];
            
            // 比較して重複があれば edgesLoop をスキップ
            for (klen = polygon.length, k = 0; k < klen; k++) {
                if (edge.eq(polygon[k])) continue edgesLoop;
            }
            
            // 重複がなければ採用
            polygon.push(edge);
        }
    }
    
    // 線を描画
    for (ilen = polygon.length, i = 0; i < ilen; i++) {
        edge = polygon[i];
        p0 = edge.nodes[0];
        p1 = edge.nodes[1];
        
        // 辺の長さが STROKE_RANGE 以下の場合距離に応じたアルファで線を描画する
        dx = p0.x - p1.x;
        dy = p0.y - p1.y;
        distSq = dx * dx + dy * dy;
        if (distSq < STROKE_RANGE_SQ) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.closePath();
            ctx.save();
            ctx.globalAlpha = 1 - distSq / STROKE_RANGE_SQ;
            ctx.stroke();
            ctx.restore();
        }
    }
    
    var p;
    var radius;
    
    // パーティクルの外枠を描画
    
    for (ilen = particles.length, i = 0; i < ilen; i++) {
        p = particles[i];
       	ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2, false);
        ctx.fillStyle = p.cl;
        ctx.fill();
    }
    
    requestAnimationFrame(loop);
}

/**
 * Add particle
 */
function addParticle(x, y) {
    if (particles.length >= PARTICLE_MAX_NUM) {
        particles.shift();
        addParticle(x, y);
        return;
    }
    var p = new Particle(x, y);
    var l = (PARTICLE_DEF_SPEED_MAX - PARTICLE_DEF_SPEED_MIN) * Math.random() + PARTICLE_DEF_SPEED_MIN;
    var a = Math.PI * 2 * Math.random();
    p.vx = l * Math.cos(a);
    p.vy = l * Math.sin(a);
    particles.push(p);
}


//-----------------------------
// CLASS
//-----------------------------

/**
 * Delaunay
 */
var Delaunay = (function() {
    
    /**
     * Node
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} id
     */
    function Node(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = !isNaN(id) && isFinite(id) ? id : null;
    }
    
    Node.prototype = {
        eq: function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return (dx < 0 ? -dx : dx) < 0.0001 && (dy < 0 ? -dy : dy) < 0.0001;
        },
        
        toString: function() {
            return '(x: ' + this.x + ', y: ' + this.y + ')';
        }
    };

    /**
     * Edge
     * 
     * @param {Node} p0
     * @param {Node} p1
     */
    function Edge(p0, p1) {
        this.nodes = [p0, p1];
    }
    
    Edge.prototype = {
        eq: function(edge) {
            var na = this.nodes, nb = edge.nodes;
            var na0 = na[0], na1 = na[1], nb0 = nb[0], nb1 = nb[1];
            return (na0.eq(nb0) && na1.eq(nb1)) || (na0.eq(nb1) && na1.eq(nb0));
        }
    };
    
    /**
     * Triangle
     * 
     * @param {Node} p0
     * @param {Node} p1
     * @param {Node} p2
     */
    function Triangle(p0, p1, p2) {
        this.nodes = [p0, p1, p2];
        this.edges = [new Edge(p0, p1), new Edge(p1, p2), new Edge(p2, p0)];
        this._createId();
        this._createCircumscribedCircle();
    }

    Triangle.prototype = {
        id: null, // ノードの組み合わせによる識別子
        _circle: null, // 外接円
        
        /**
         * ノードの組み合わせによる識別子を作成する
         * 識別子の設定されていないノードがある場合 id は null
         */
        _createId: function() {
            var nodes = this.nodes;
            var id0 = nodes[0].id;
            var id1 = nodes[1].id;
            var id2 = nodes[2].id;
            if (id0 !== null && id1 !== null && id2 !== null) {
                this.id = [id0, id1, id2].sort().join('_');
            }
        },
        
        /**
         * この三角形の外接円を作成する
         */
        _createCircumscribedCircle: function() {
            var nodes = this.nodes;
            var p0 = nodes[0];
            var p1 = nodes[1];
            var p2 = nodes[2];

            var ax = p1.x - p0.x, ay = p1.y - p0.y;
            var bx = p2.x - p0.x, by = p2.y - p0.y;
            var c = 2 * (ax * by - ay * bx);

            var t = (p1.x * p1.x - p0.x * p0.x + p1.y * p1.y - p0.y * p0.y);
            var u = (p2.x * p2.x - p0.x * p0.x + p2.y * p2.y - p0.y * p0.y);
            
            if (!this._circle) this._circle = {};

            var circle = this._circle;
            circle.x = ((p2.y - p0.y) * t + (p0.y - p1.y) * u) / c;
            circle.y = ((p0.x - p2.x) * t + (p1.x - p0.x) * u) / c;

            var dx = p0.x - circle.x;
            var dy = p0.y - circle.y;
            circle.radiusSq = dx * dx + dy * dy;
        },
        
        /**
         * 座標がこの外接円に含まれるか示す
         */
        circleContains: function(p) {
            var circle = this._circle;
            var dx = circle.x - p.x;
            var dy = circle.y - p.y;
            var distSq = dx * dx + dy * dy;
            
            return distSq < circle.radiusSq;
        }
    };
    
    
    /**
     * Delaunay
     * 
     * @param {Number} width
     * @param {Number} height
     */
    function Delaunay(width, height) {
        this.width = width;
        this.height = height;
        
        this._triangles = null;
        
        this.clear();
    }

    Delaunay.prototype = {
        clear: function() {
            var p0 = new Node(0, 0);
            var p1 = new Node(this.width, 0);
            var p2 = new Node(this.width, this.height);
            var p3 = new Node(0, this.height);
            
            this._triangles = [
                new Triangle(p0, p1, p2),
                new Triangle(p0, p2, p3)
            ];
            
            return this;
        },
        
        multipleInsert: function(m) {
            for (var i = 0, len = m.length; i < len; i++) {
                this.insert(m[i]);
            }
            
            return this;
        },
        
        insert: function(p) {
            var triangles = this._triangles;
            var t;
            var temps = [];
            var edges = [];
            
            var i, ilen;

            for (ilen = triangles.length, i = 0; i < ilen; i++) {
                t = triangles[i];
                
                // 座標が三角形の外接円に含まれるか調べる
                if (t.circleContains(p)) {
                    // 含まれる場合三角形の辺を保存
                    edges.push(t.edges[0], t.edges[1], t.edges[2]);
                } else {
                    // 含まれない場合は持ち越し
                    temps.push(t);
                }
            }
            
            var edge;
            var polygon = [];
            var j, jlen;
            var isDuplicate;

            // 辺の重複をチェック, 重複する場合は削除する
            edgesLoop: for (ilen = edges.length, i = 0; i < ilen; i++) {
                edge = edges[i];
                
                // 辺を比較して重複していれば削除
                for (jlen = polygon.length, j = 0; j < jlen; j++) {
                    if (edge.eq(polygon[j])) {
                        polygon.splice(j, 1);
                        continue edgesLoop;
                    }
                }
                
                polygon.push(edge);
            }
            
            for (ilen = polygon.length, i = 0; i < ilen; i++) {
                edge = polygon[i];
                temps.push(new Triangle(edge.nodes[0], edge.nodes[1], p));
            }
            
            this._triangles = temps;
            
            return this;
        },
        
        getTriangles: function() {
            return this._triangles.slice();
        }
    };
    
    Delaunay.Node = Node;
    
    return Delaunay;
    
})();


/**
 * Particle
 * 
 * @param {Number} x
 * @param {Number} y
 * @super Delaunay.Node
 */
var Particle = (function(Node) {
    
    // 生成順に数値の ID を付与する
    var currentId = 0;
    function getId() { return currentId++; }
    
    function Particle(x, y) {
        Node.call(this, x, y, getId());
        this.vx = 0;
        this.vy = 0;
        this.cl = colors[Math.random()*colors.length | 0];
    }

    Particle.prototype = new Node();

    return Particle;
    
})(Delaunay.Node);


// Init
window.addEventListener('load', init, false);
