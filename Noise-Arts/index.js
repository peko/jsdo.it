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
var PERTICLE_NUM = 3000;
var STEP_MAX = 30; // ステップの最大値と最小値, 小さいほど詳細
var STEP_MIN = 5;
var Z_INC = 0.0035;

var canvas;
var context;
var perticles = [];
var simplexNoise = new Akm2.SimplexNoise();
var zoff = 0;
var images = [];
var loadCount = 0;
var currentImageIndex;
var time;

function init() {
    canvas = document.getElementById('c');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    context = canvas.getContext('2d');
    
    context.lineCap = context.lineJoin = 'round';
    
    for (var i = 0; i < PERTICLE_NUM; i++) {
        perticles[i] = new Perticle();
    }
    
    currentImageIndex = Akm2.randInt(IMAGE_NUM - 1);
    
    for (i = 0; i < IMAGE_NUM; i++) {
        loadImage(IMAGE_URL[i]);
    }
}

function loadImage(url) {
    var image = new Image();
    images.push(image);
    image.addEventListener('load', imageLoadComplete, false);
    image.src = url + '?' + new Date().getTime();
}

function imageLoadComplete(e) {
    loadCount++;
    
    if (loadCount === IMAGE_NUM) {
        ImageMap.init(SCREEN_WIDTH, SCREEN_HEIGHT, images[currentImageIndex]);
        ImageMap.generate();
        
        document.addEventListener('click', click, false);
        
        time = new Date().getTime();
        
        setInterval(loop, 1000 / 60);
    }
}

function click() {
    changeMap();
    time = new Date().getTime();
    simplexNoise.seed(new Date().getTime());
}

function loop() {
    var sw = SCREEN_WIDTH;
    var sh = SCREEN_HEIGHT;
    var wrate = 1 / sw;
    var hrate = 1 / sh;
    var p, px, py, latest, j, angle;
    var data = ImageMap.data;
    
    for (var i = 0, len = perticles.length; i < len; i++) {    	
    	p = perticles[i];
        px = p.x;
        py = p.y;
    	latest = p.latest;
    	
    	if (px >= 0 && px <= sw && py >= 0 && py <= sh) {
    	    j = ((px | 0) + (py | 0) * sw) * 4;
            context.lineWidth = p.lineWidth;
        	context.beginPath();
        	context.strokeStyle = 'rgba(' + data[j] + ', ' + data[j + 1] + ', ' + data[j + 2] + ', 0.075)';
        	context.moveTo(latest.x, latest.y);
        	context.lineTo(px, py);
        	context.stroke();
    	}
    	
    	latest.set(p);
    	
    	angle = Math.PI * 6 * simplexNoise.noise(px * wrate * 0.75, py * hrate * 0.75, zoff);
        p.add(Akm2.Point.polar(p.step, angle));
    	
    	if (px < -10 || px > sw + 10 || py < 0 - 10 || py > sh + 10) {
    	    p.reborn();
    	}
    }
    
    zoff += Z_INC;
    
    var now = new Date().getTime();
    if (now - time > 60000) {
        changeMap();
        time = now;
    }
}

function changeMap() {
    currentImageIndex = (currentImageIndex + 1) % IMAGE_NUM;
    ImageMap.image = images[currentImageIndex];
    ImageMap.generate();
}


/**
 * Perticle
 */
function Perticle(hue) {
    Akm2.Point.call(this);
    this.latest = new Akm2.Point();
    this.reborn();
}

Perticle.prototype = Akm2.extend(new Akm2.Point(), {
    reborn: function() {
        this.set(Akm2.randUniform(SCREEN_WIDTH), Akm2.randUniform(SCREEN_HEIGHT));
        this.latest.set(this);
        this.step = Akm2.randUniform(STEP_MAX, STEP_MIN);
        this.lineWidth = Math.random();
    }
});


/**
 * ImageMap
 */
var ImageMap = {
    _map: null,
    _ctx: null,
    
    data: null, // Pixel data
    image: null,
    
    init: function(width, height, image) {
        this._map = document.createElement('canvas');
        this._map.width = width;
        this._map.height = height;
        this._ctx = this._map.getContext('2d');
        
        this.image = image;
    },
    
    generate: function() {
        var ctx = this._ctx;
        ctx.drawImage(this.image, 0, 0);
        return this.data = ctx.getImageData(0, 0, this._map.width, this._map.height).data;
    }
};

// Init
window.addEventListener('load', init, false);
