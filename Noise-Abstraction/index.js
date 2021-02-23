/**
 * PerlinNoise class,
 * Point class,
 * Color class,
 * extend, random
 * @see http://jsdo.it/akm2/fhMC
 */

var PERTICLE_NUM = 500;
var STEP = 3;
var Z_INC = 0.001;
var S = 100; // Saturate
var L = 50; // Lightness

var canvas;
var canvasWidth;
var canvasHeight;
var context;
var perticles = [];
var center = new Point();
var perlinNoise = new PerlinNoise();
var zoff = 0;

function init() {
    canvas = document.getElementById('c');
    
    document.addEventListener('resize', resize);
    resize();
    
    for (var i = 0; i < PERTICLE_NUM; i++) {
        perticles[i] = new Perticle();
    }
    
    document.addEventListener('click', click, false);
    
    setInterval(loop, 1000 / 60);
}

function resize() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    
    context.lineWidth = 0.3;
    context.lineCap = context.lineJoin = 'round';
    
    center.set(canvasWidth / 2, canvasHeight / 2);
}

function click() {
    context.save();
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();
    
    perlinNoise.seed(new Date().getTime());
}

function loop() {
    var p, latest, color, angle;
    
    for (var i = 0, len = perticles.length; i < len; i++) {
    	p = perticles[i];
    	latest = p.latest;
    	color = p.color;
    	
    	context.beginPath();
    	context.strokeStyle = color.toString();
    	context.moveTo(latest.x, latest.y);
    	context.lineTo(p.x, p.y);
    	context.stroke();
    	
    	latest.set(p);
	
        angle = Math.PI * 6 * perlinNoise.noise(p.x / canvasWidth * 1.75, p.y / canvasHeight * 1.75, zoff);
        p.offset(Math.cos(angle) * STEP, Math.sin(angle) * STEP);
    	
    	if (color.a < 1) color.a += 0.005;
    	
    	if (p.x < 0 || p.x > canvasWidth || p.y < 0 || p.y > canvasHeight) {
    	    p.reborn();
    	}
    }
    
    zoff += Z_INC;
}


/**
 * Perticle
 */
function Perticle() {
    Point.call(this);
    this.latest = new Point();
    this.color = new Color.HSLA(0, S, L, 0);
    this.reborn();
}

Perticle.prototype = extend({}, Point.prototype, {
    reborn: function() {
        this.set(random(canvasWidth), random(canvasHeight));
        this.latest.set(this);
        this.age = 0;
        this.color.h = center.subtract(this).angle() * 180 / Math.PI;
        this.color.a = 0;
    }
});

// Init
window.addEventListener ? window.addEventListener('load', init, false) : window.load = init;
