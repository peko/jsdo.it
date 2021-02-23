// forked from akm2's "Noise Abstraction" http://jsdo.it/akm2/ncsw
/**
 * SimplexNoise class,
 * Point class,
 * extend, random
 * @see http://jsdo.it/akm2/2e21
 */

var PERTICLE_NUM = 750;
var STEP = 7;
var Z_INC = 0.00135;
var H = 256;

var canvas;
var canvasWidth;
var canvasHeight;
var context;
var perticles = [];
var simplexNoise = new Akm2.SimplexNoise();
var mouse = new Akm2.Point();
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
    
    context.globalCompositeOperation = 'lighter';
    context.lineWidth = 1;
    context.lineCap = context.lineJoin = 'round';
}


function click() {
    simplexNoise.seed(new Date().getTime());
}

function loop() {
    context.save();
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = 'hsla(' + H + ', 100%, 5%, 0.2)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();
    
    var p, latest, angle;
    
    context.beginPath();
    context.strokeStyle = 'hsla(' + H + ', 100%, 70%, 0.3)';
    for (var i = 0, len = perticles.length; i < len; i++) {
    	p = perticles[i];
    	latest = p.latest;
	
    	context.moveTo(latest.x, latest.y);
    	context.lineTo(p.x, p.y);
    }
    context.stroke();
    
    context.save();
    context.beginPath();
    context.shadowBlur = 30;
    context.shadowColor = 'hsla(' + H + ', 100%, 50%, 0.075)';
    for (i = 0; i < len; i++) {
	p = perticles[i];
	
	context.moveTo(p.x + STEP, p.y);
        context.arc(p.x, p.y, STEP, 0, Math.PI * 2, false);
	
        p.latest.set(p);
	
        angle = Math.PI * 8 * simplexNoise.noise(p.x / canvasWidth * 1.75, p.y / canvasHeight * 1.75, zoff);
        p.offset(Math.cos(angle) * STEP, Math.sin(angle) * STEP);
    	
    	if (p.x < 0 || p.x > canvasWidth || p.y < 0 || p.y > canvasHeight) {
    	    p.reborn(Akm2.randUniform(canvasWidth), Akm2.randUniform(canvasHeight));
    	}
    }
    context.fill();
    context.restore();
    
    zoff += Z_INC;
}


/**
 * Perticle
 */
function Perticle() {
    Akm2.Point.call(this);
    this.latest = new Akm2.Point();
    this.reborn();
}

Perticle.prototype = Akm2.extend(new Akm2.Point(), {
    reborn: function(x, y) {
        this.set(x, y);
        this.latest.set(this);
        this.age = 0;
    }
});

// Init
window.addEventListener ? window.addEventListener('load', init, false) : window.load = init;
