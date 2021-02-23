var JSX = {};
(function () {

/**
 * copies the implementations from source interface to target
 */
function $__jsx_merge_interface(target, source) {
	for (var k in source.prototype)
		if (source.prototype.hasOwnProperty(k))
			target.prototype[k] = source.prototype[k];
}

/**
 * defers the initialization of the property
 */
function $__jsx_lazy_init(obj, prop, func) {
	function reset(obj, prop, value) {
		delete obj[prop];
		obj[prop] = value;
		return value;
	}

	Object.defineProperty(obj, prop, {
		get: function () {
			return reset(obj, prop, func());
		},
		set: function (v) {
			reset(obj, prop, v);
		},
		enumerable: true,
		configurable: true
	});
}

/**
 * sideeffect().a /= b
 */
function $__jsx_div_assign(obj, prop, divisor) {
	return obj[prop] = (obj[prop] / divisor) | 0;
}

/*
 * global functions called by JSX
 * (enamed so that they do not conflict with local variable names)
 */
var $__jsx_parseInt = parseInt;
var $__jsx_parseFloat = parseFloat;
var $__jsx_isNaN = isNaN;
var $__jsx_isFinite = isFinite;

var $__jsx_encodeURIComponent = encodeURIComponent;
var $__jsx_decodeURIComponent = decodeURIComponent;
var $__jsx_encodeURI = encodeURI;
var $__jsx_decodeURI = decodeURI;

var $__jsx_ObjectToString = Object.prototype.toString;
var $__jsx_ObjectHasOwnProperty = Object.prototype.hasOwnProperty;

/*
 * profiler object, initialized afterwards
 */
function $__jsx_profiler() {
}

/*
 * public interface to JSX code
 */
JSX.require = function (path) {
	var m = $__jsx_classMap[path];
	return m !== undefined ? m : null;
};

JSX.profilerIsRunning = function () {
	return $__jsx_profiler.getResults != null;
};

JSX.getProfileResults = function () {
	return ($__jsx_profiler.getResults || function () { return {}; })();
};

JSX.postProfileResults = function (url) {
	if ($__jsx_profiler.postResults == null)
		throw new Error("profiler has not been turned on");
	return $__jsx_profiler.postResults(url);
};
/**
 * class Config extends Object
 * @constructor
 */
function Config() {
}

Config.prototype = new Object;
/**
 * @constructor
 */
function Config$() {
};

Config$.prototype = new Config;

/**
 * class _Main extends Object
 * @constructor
 */
function _Main() {
}

_Main.prototype = new Object;
/**
 * @constructor
 */
function _Main$() {
};

_Main$.prototype = new _Main;

/**
 * @param {Array.<undefined|!string>} args
 */
_Main.main$AS = function (args) {
	/** @type {HTMLDocument} */
	var document;
	/** @type {!number} */
	var screenWidth;
	/** @type {!number} */
	var screenHeight;
	/** @type {HTMLCanvasElement} */
	var canvas;
	/** @type {CanvasRenderingContext2D} */
	var context;
	/** @type {ImageData} */
	var imageData;
	/** @type {Array.<undefined|Particle>} */
	var particles;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var len;
	/** @type {!boolean} */
	var noiseDisplay;
	/** @type {!number} */
	var mouseX;
	/** @type {!number} */
	var mouseY;
	document = dom.window.document;
	screenWidth = Config.SCREEN_WIDTH;
	screenHeight = Config.SCREEN_HEIGHT;
	canvas = (function (o) { return o instanceof HTMLCanvasElement ? o : null; })(dom$id$S('c'));
	canvas.width = (screenWidth | 0);
	canvas.height = (screenHeight | 0);
	context = (function (o) { return o instanceof CanvasRenderingContext2D ? o : null; })(canvas.getContext('2d'));
	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.fillRect(0, 0, screenWidth, screenHeight);
	imageData = context.getImageData(0, 0, screenWidth, screenHeight);
	particles = [  ];
	for ((i = 0, len = Config.PARTICLE_NUM); i < len; i++) {
		particles.push(new Particle$NN(Math.random() * screenWidth, Math.random() * screenHeight));
	}
	NoiseMap$initialize$NN(Config.NOISE_WIDTH, Config.NOISE_HEIGHT);
	NoiseMap$generate$();
	noiseDisplay = false;
	mouseX = screenWidth / 2;
	mouseY = screenHeight / 2;
	document.addEventListener('mousemove', (function (e) {
		/** @type {MouseEvent} */
		var me;
		/** @type {!number} */
		var sw;
		/** @type {!number} */
		var sh;
		me = (function (o) { return o instanceof MouseEvent ? o : null; })(e);
		mouseX = me.clientX;
		mouseY = me.clientY;
		(sw = Config.SCREEN_WIDTH, sh = Config.SCREEN_HEIGHT);
		if (mouseX < 0) {
			mouseX = 0;
		} else {
			if (mouseX > sw) {
				mouseX = sw;
			}
		}
		if (mouseY < 0) {
			mouseY = 0;
		} else {
			if (mouseY > sh) {
				mouseY = sh;
			}
		}
	}), false);
	document.addEventListener('click', (function (e) {
		NoiseMap$generate$();
	}), false);
	document.addEventListener('keydown', (function (e) {
		/** @type {KeyboardEvent} */
		var ke;
		ke = (function (o) { return o instanceof KeyboardEvent ? o : null; })(e);
		if (ke.keyCode === 78) {
			noiseDisplay = ! noiseDisplay;
		}
	}), false);
	FPS$initialize$();
	Timer$setInterval$F$V$I((function () {
		/** @type {Uint8ClampedArray} */
		var data;
		/** @type {!number} */
		var i;
		/** @type {!number} */
		var len;
		/** @type {!number} */
		var sw;
		/** @type {!number} */
		var sh;
		/** @type {!number} */
		var off;
		/** @type {Uint8ClampedArray} */
		var noiseData;
		/** @type {Particle} */
		var p;
		/** @type {!number} */
		var px;
		/** @type {!number} */
		var py;
		/** @type {!number} */
		var ps;
		/** @type {!number} */
		var vx;
		/** @type {!number} */
		var vy;
		/** @type {!number} */
		var ch0;
		/** @type {!number} */
		var ch1;
		/** @type {!number} */
		var ch2;
		/** @type {!number} */
		var j;
		/** @type {!number} */
		var k;
		data = imageData.data;
		for ((i = 0, len = data.length); i < len; i += 4) {
			data[i] >>= 1;
			data[i + 1] >>= 1;
			data[i + 2] >>= 1;
		}
		sw = Config.SCREEN_WIDTH;
		sh = Config.SCREEN_HEIGHT;
		off = (mouseY >> 1 << 2) * sw + (mouseX >> 1 << 2);
		noiseData = NoiseMap.data;
		for ((i = 0, len = particles.length); i < len; i++) {
			p = particles[i];
			px = p.x;
			py = p.y;
			ps = p.scale;
			k = ((py >> 1 << 2) * sw + (px >> 1 << 2) + off | 0);
			vx = p.vx * 0.98 + ((function (v) {
				if (! (v != null)) {
					debugger;
					throw new Error("[/tmp/ZTs_0V8cm5.jsx:112] null access");
				}
				return v;
			}(noiseData[k])) - 128) * ps;
			vy = p.vy * 0.98 + ((function (v) {
				if (! (v != null)) {
					debugger;
					throw new Error("[/tmp/ZTs_0V8cm5.jsx:113] null access");
				}
				return v;
			}(noiseData[k + 1])) - 128) * ps;
			px += vx;
			py += vy;
			if (px < 0) {
				px += sw;
			} else {
				if (px > sw) {
					px -= sw;
				}
			}
			if (py < 0) {
				py += sh;
			} else {
				if (py > sh) {
					py -= sh;
				}
			}
			j = (px | 0) + (py | 0) * sw << 2;
			data[j] += 21;
			data[j + 1] += 75;
			data[j + 2] += 66;
			p.vx = vx;
			p.vy = vy;
			p.x = px;
			p.y = py;
		}
		if (! noiseDisplay) {
			context.putImageData(imageData, 0, 0);
		} else {
			context.drawImage(NoiseMap.canvas, 0, 0, sw, sh);
		}
		FPS$countFrame$();
	}), 1000 / 60);
};

var _Main$main$AS = _Main.main$AS;

/**
 */
_Main.loop$ = function () {
};

var _Main$loop$ = _Main.loop$;

/**
 * class Particle extends Object
 * @constructor
 */
function Particle() {
}

Particle.prototype = new Object;
/**
 * @constructor
 */
function Particle$() {
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	this.scale = 0;
};

Particle$.prototype = new Particle;

/**
 * @constructor
 * @param {!number} x
 * @param {!number} y
 */
function Particle$NN(x, y) {
	this.vx = 0;
	this.vy = 0;
	this.x = x;
	this.y = y;
	this.scale = Math.random() * 0.004 + 0.004;
};

Particle$NN.prototype = new Particle;

/**
 * class NoiseMap extends Object
 * @constructor
 */
function NoiseMap() {
}

NoiseMap.prototype = new Object;
/**
 * @constructor
 * @param {!number} width
 * @param {!number} height
 */
function NoiseMap$NN(width, height) {
	this.noiseCanvas = null;
	this.mapCanvas = null;
	this.simplexNoiseX = null;
	this.simplexNoiseY = null;
	if (NoiseMap.instance) {
		throw new Error('既にインスタンスが作成されています');
	}
	NoiseMap.instance = this;
	this.noiseCanvas = (function (o) { return o instanceof HTMLCanvasElement ? o : null; })(dom.window.document.createElement('canvas'));
	this.noiseCanvas.width = (width | 0);
	this.noiseCanvas.height = (height | 0);
	this.mapCanvas = (function (o) { return o instanceof HTMLCanvasElement ? o : null; })(dom.window.document.createElement('canvas'));
	this.mapCanvas.width = (Config.SCREEN_WIDTH | 0);
	this.mapCanvas.height = (Config.SCREEN_HEIGHT | 0);
	this.simplexNoiseX = new SimplexNoise$();
	this.simplexNoiseY = new SimplexNoise$();
	NoiseMap.canvas = this.mapCanvas;
};

NoiseMap$NN.prototype = new NoiseMap;

/**
 * @param {!number} width
 * @param {!number} height
 */
NoiseMap.initialize$NN = function (width, height) {
	if (! NoiseMap.instance) {
		NoiseMap.instance = new NoiseMap$NN(width, height);
	}
};

var NoiseMap$initialize$NN = NoiseMap.initialize$NN;

/**
 * @return {Uint8ClampedArray}
 */
NoiseMap.generate$ = function () {
	return NoiseMap.instance.generate$();
};

var NoiseMap$generate$ = NoiseMap.generate$;

/**
 * @return {Uint8ClampedArray}
 */
NoiseMap.prototype.generate$ = function () {
	/** @type {!number} */
	var noiseCanvasWidth;
	/** @type {!number} */
	var noiseCanvasHeight;
	/** @type {CanvasRenderingContext2D} */
	var noiseContext;
	/** @type {ImageData} */
	var noiseImageData;
	/** @type {Uint8ClampedArray} */
	var noiseData;
	/** @type {!number} */
	var time;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var mapCanvasWidth;
	/** @type {!number} */
	var mapCanvasHeight;
	/** @type {CanvasRenderingContext2D} */
	var mapContext;
	noiseCanvasWidth = this.noiseCanvas.width;
	noiseCanvasHeight = this.noiseCanvas.height;
	noiseContext = (function (o) { return o instanceof CanvasRenderingContext2D ? o : null; })(this.noiseCanvas.getContext('2d'));
	noiseImageData = noiseContext.getImageData(0, 0, noiseCanvasWidth, noiseCanvasHeight);
	noiseData = noiseImageData.data;
	time = new Date().getTime();
	this.simplexNoiseX.seed$N(time);
	this.simplexNoiseY.seed$N(Math.floor(Math.random() * time));
	for (y = 0; y < noiseCanvasHeight; y++) {
		for (x = 0; x < noiseCanvasWidth; x++) {
			i = ((x + y * noiseCanvasWidth) * 4 | 0);
			noiseData[i] = (this.simplexNoiseX.noise$NN(x, y) * 255 | 0);
			noiseData[i + 1] = (this.simplexNoiseY.noise$NN(x, y) * 255 | 0);
			noiseData[i + 3] = 255;
		}
	}
	noiseContext.putImageData(noiseImageData, 0, 0);
	mapCanvasWidth = this.mapCanvas.width;
	mapCanvasHeight = this.mapCanvas.height;
	mapContext = (function (o) { return o instanceof CanvasRenderingContext2D ? o : null; })(this.mapCanvas.getContext('2d'));
	mapContext.drawImage(this.noiseCanvas, 0, 0, mapCanvasWidth, mapCanvasHeight);
	return NoiseMap.data = mapContext.getImageData(0, 0, mapCanvasWidth, mapCanvasHeight).data;
};

/**
 * class FPS extends Object
 * @constructor
 */
function FPS() {
}

FPS.prototype = new Object;
/**
 * @constructor
 */
function FPS$() {
	/** @type {HTMLElement} */
	var view;
	this.count = 0;
	this.last = 0;
	this.view = null;
	if (FPS.instance) {
		throw new Error('既にインスタンスが作成されています');
	}
	FPS.instance = this;
	this.last = new Date().getTime();
	view = (function (o) { return o instanceof HTMLElement ? o : null; })(dom.window.document.createElement('div'));
	view.id = 'fps';
	view.style.color = 'rgb(70, 255, 220)';
	view.style.fontSize = '10px';
	view.style.position = 'absolute';
	view.style.top = '5px';
	view.style.left = '5px';
	view.innerHTML = 'FPS';
	dom.window.document.body.appendChild(view);
	this.view = view;
};

FPS$.prototype = new FPS;

/**
 */
FPS.initialize$ = function () {
	if (! FPS.instance) {
		FPS.instance = new FPS$();
	}
};

var FPS$initialize$ = FPS.initialize$;

/**
 */
FPS.countFrame$ = function () {
	FPS.instance.countFrame$();
};

var FPS$countFrame$ = FPS.countFrame$;

/**
 */
FPS.prototype.countFrame$ = function () {
	/** @type {!number} */
	var now;
	this.count++;
	if (this.count === 60) {
		now = new Date().getTime();
		this.view.innerHTML = 'FPS ' + (1000 / ((now - this.last) / this.count)).toFixed(2);
		this.count = 0;
		this.last = now;
	}
};

/**
 * class SimplexNoise extends Object
 * @constructor
 */
function SimplexNoise() {
}

SimplexNoise.prototype = new Object;
/**
 * @constructor
 */
function SimplexNoise$() {
	this.octaves = 4;
	this.fallout = 0.5;
	this._perm = null;
	this.seed$N(new Date().getTime());
};

SimplexNoise$.prototype = new SimplexNoise;

/**
 * @constructor
 * @param {!number} seed
 */
function SimplexNoise$N(seed) {
	this.octaves = 4;
	this.fallout = 0.5;
	this._perm = null;
	this.seed$N(seed);
};

SimplexNoise$N.prototype = new SimplexNoise;

/**
 * @param {!number} seed
 */
SimplexNoise.prototype.seed$N = function (seed) {
	/** @type {Alea} */
	var gen;
	/** @type {!number} */
	var i;
	/** @type {Array.<undefined|!number>} */
	var p;
	/** @type {Array.<undefined|!number>} */
	var perm;
	gen = new Alea$N(seed);
	i = 0;
	p = [  ];
	for (; i < 256; i++) {
		p[i] = (Math.floor(gen.random$() * 256) | 0);
	}
	perm = [  ];
	for (i = 0; i < 512; i++) {
		perm[i] = p[i & 255];
	}
	this._perm = perm;
};

/**
 * @param {!number} x
 * @return {!number}
 */
SimplexNoise.prototype.noise$N = function (x) {
	var $this = this;
	return this._noise$F$NN$((function (f) {
		return $this.noise2d$NN(x * f, 0);
	}));
};

/**
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
SimplexNoise.prototype.noise$NN = function (x, y) {
	var $this = this;
	return this._noise$F$NN$((function (f) {
		return $this.noise2d$NN(x * f, y * f);
	}));
};

/**
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {!number}
 */
SimplexNoise.prototype.noise$NNN = function (x, y, z) {
	var $this = this;
	return this._noise$F$NN$((function (f) {
		return $this.noise3d$NNN(x * f, y * f, z * f);
	}));
};

/**
 * @return {!number}
 */
SimplexNoise.prototype._noise$F$NN$ = function (generator) {
	/** @type {!number} */
	var octaves;
	/** @type {!number} */
	var fallout;
	/** @type {!number} */
	var amplitude;
	/** @type {!number} */
	var frequency;
	/** @type {!number} */
	var noise;
	/** @type {!number} */
	var i;
	octaves = this.octaves;
	fallout = this.fallout;
	amplitude = 1;
	frequency = 1;
	noise = 0;
	for (i = 0; i < octaves; ++ i) {
		amplitude *= fallout;
		noise += amplitude * (1 + generator(frequency)) * 0.5;
		frequency *= 2;
	}
	return noise;
};

/**
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
SimplexNoise.prototype.noise2d$NN = function (x, y) {
	/** @type {Array.<undefined|Array.<undefined|!number>>} */
	var GRAD3;
	/** @type {Array.<undefined|!number>} */
	var perm;
	/** @type {!number} */
	var n0;
	/** @type {!number} */
	var n1;
	/** @type {!number} */
	var n2;
	/** @type {!number} */
	var F2;
	/** @type {!number} */
	var s;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var j;
	/** @type {!number} */
	var G2;
	/** @type {!number} */
	var t;
	/** @type {!number} */
	var X0;
	/** @type {!number} */
	var Y0;
	/** @type {!number} */
	var x0;
	/** @type {!number} */
	var y0;
	/** @type {!number} */
	var i1;
	/** @type {!number} */
	var j1;
	/** @type {!number} */
	var x1;
	/** @type {!number} */
	var y1;
	/** @type {!number} */
	var x2;
	/** @type {!number} */
	var y2;
	/** @type {!number} */
	var ii;
	/** @type {!number} */
	var jj;
	/** @type {!number} */
	var gi0;
	/** @type {!number} */
	var gi1;
	/** @type {!number} */
	var gi2;
	/** @type {!number} */
	var t0;
	/** @type {!number} */
	var t1;
	/** @type {!number} */
	var t2;
	GRAD3 = SimplexNoise.GRAD3;
	perm = this._perm;
	(n0 = 0, n1 = 0, n2 = 0);
	F2 = 0.5 * (Math.sqrt(3) - 1);
	s = (x + y) * F2;
	i = Math.floor(x + s);
	j = Math.floor(y + s);
	G2 = (3 - Math.sqrt(3)) / 6;
	t = (i + j) * G2;
	X0 = i - t;
	Y0 = j - t;
	x0 = x - X0;
	y0 = y - Y0;
	(i1 = 0, j1 = 0);
	if (x0 > y0) {
		i1 = 1;
		j1 = 0;
	} else {
		i1 = 0;
		j1 = 1;
	}
	x1 = x0 - i1 + G2;
	y1 = y0 - j1 + G2;
	x2 = x0 - 1 + 2 * G2;
	y2 = y0 - 1 + 2 * G2;
	ii = i & 255;
	jj = j & 255;
	gi0 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:426] null access");
		}
		return v;
	}(perm[ii + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:426] null access");
		}
		return v;
	}(perm[jj]))])) % 12;
	gi1 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:427] null access");
		}
		return v;
	}(perm[ii + i1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:427] null access");
		}
		return v;
	}(perm[jj + j1]))])) % 12;
	gi2 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:428] null access");
		}
		return v;
	}(perm[ii + 1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:428] null access");
		}
		return v;
	}(perm[jj + 1]))])) % 12;
	t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 < 0) {
		n0 = 0;
	} else {
		t0 *= t0;
		n0 = t0 * t0 * this._dot2d$AINN(GRAD3[gi0], x0, y0);
	}
	t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 < 0) {
		n1 = 0;
	} else {
		t1 *= t1;
		n1 = t1 * t1 * this._dot2d$AINN(GRAD3[gi1], x1, y1);
	}
	t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 < 0) {
		n2 = 0;
	} else {
		t2 *= t2;
		n2 = t2 * t2 * this._dot2d$AINN(GRAD3[gi2], x2, y2);
	}
	return 70 * (n0 + n1 + n2);
};

/**
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {!number}
 */
SimplexNoise.prototype.noise3d$NNN = function (x, y, z) {
	/** @type {Array.<undefined|Array.<undefined|!number>>} */
	var GRAD3;
	/** @type {Array.<undefined|!number>} */
	var perm;
	/** @type {!number} */
	var n0;
	/** @type {!number} */
	var n1;
	/** @type {!number} */
	var n2;
	/** @type {!number} */
	var n3;
	/** @type {!number} */
	var F3;
	/** @type {!number} */
	var s;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var j;
	/** @type {!number} */
	var k;
	/** @type {!number} */
	var G3;
	/** @type {!number} */
	var t;
	/** @type {!number} */
	var X0;
	/** @type {!number} */
	var Y0;
	/** @type {!number} */
	var Z0;
	/** @type {!number} */
	var x0;
	/** @type {!number} */
	var y0;
	/** @type {!number} */
	var z0;
	/** @type {!number} */
	var i1;
	/** @type {!number} */
	var j1;
	/** @type {!number} */
	var k1;
	/** @type {!number} */
	var i2;
	/** @type {!number} */
	var j2;
	/** @type {!number} */
	var k2;
	/** @type {!number} */
	var x1;
	/** @type {!number} */
	var y1;
	/** @type {!number} */
	var z1;
	/** @type {!number} */
	var x2;
	/** @type {!number} */
	var y2;
	/** @type {!number} */
	var z2;
	/** @type {!number} */
	var x3;
	/** @type {!number} */
	var y3;
	/** @type {!number} */
	var z3;
	/** @type {!number} */
	var ii;
	/** @type {!number} */
	var jj;
	/** @type {!number} */
	var kk;
	/** @type {!number} */
	var gi0;
	/** @type {!number} */
	var gi1;
	/** @type {!number} */
	var gi2;
	/** @type {!number} */
	var gi3;
	/** @type {!number} */
	var t0;
	/** @type {!number} */
	var t1;
	/** @type {!number} */
	var t2;
	/** @type {!number} */
	var t3;
	GRAD3 = SimplexNoise.GRAD3;
	perm = this._perm;
	(n0 = 0, n1 = 0, n2 = 0, n3 = 0);
	F3 = 1 / 3;
	s = (x + y + z) * F3;
	(i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s));
	G3 = 1 / 6;
	t = (i + j + k) * G3;
	X0 = i - t;
	Y0 = j - t;
	Z0 = k - t;
	x0 = x - X0;
	y0 = y - Y0;
	z0 = z - Z0;
	if (x0 >= y0) {
		if (y0 >= z0) {
			i1 = 1;
			j1 = 0;
			k1 = 0;
			i2 = 1;
			j2 = 1;
			k2 = 0;
		} else {
			if (x0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} else {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			}
		}
	} else {
		if (y0 < z0) {
			i1 = 0;
			j1 = 0;
			k1 = 1;
			i2 = 0;
			j2 = 1;
			k2 = 1;
		} else {
			if (x0 < z0) {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} else {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			}
		}
	}
	x1 = x0 - i1 + G3;
	y1 = y0 - j1 + G3;
	z1 = z0 - k1 + G3;
	x2 = x0 - i2 + 2 * G3;
	y2 = y0 - j2 + 2 * G3;
	z2 = z0 - k2 + 2 * G3;
	x3 = x0 - 1 + 3 * G3;
	y3 = y0 - 1 + 3 * G3;
	z3 = z0 - 1 + 3 * G3;
	ii = i & 255;
	jj = j & 255;
	kk = k & 255;
	gi0 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:503] null access");
		}
		return v;
	}(perm[ii + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:503] null access");
		}
		return v;
	}(perm[jj + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:503] null access");
		}
		return v;
	}(perm[kk]))]))])) % 12;
	gi1 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:504] null access");
		}
		return v;
	}(perm[ii + i1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:504] null access");
		}
		return v;
	}(perm[jj + j1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:504] null access");
		}
		return v;
	}(perm[kk + k1]))]))])) % 12;
	gi2 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:505] null access");
		}
		return v;
	}(perm[ii + i2 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:505] null access");
		}
		return v;
	}(perm[jj + j2 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:505] null access");
		}
		return v;
	}(perm[kk + k2]))]))])) % 12;
	gi3 = (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:506] null access");
		}
		return v;
	}(perm[ii + 1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:506] null access");
		}
		return v;
	}(perm[jj + 1 + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:506] null access");
		}
		return v;
	}(perm[kk + 1]))]))])) % 12;
	t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
	if (t0 < 0) {
		n0 = 0;
	} else {
		t0 *= t0;
		n0 = t0 * t0 * this._dot3d$AINNN(GRAD3[gi0], x0, y0, z0);
	}
	t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
	if (t1 < 0) {
		n1 = 0;
	} else {
		t1 *= t1;
		n1 = t1 * t1 * this._dot3d$AINNN(GRAD3[gi1], x1, y1, z1);
	}
	t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
	if (t2 < 0) {
		n2 = 0;
	} else {
		t2 *= t2;
		n2 = t2 * t2 * this._dot3d$AINNN(GRAD3[gi2], x2, y2, z2);
	}
	t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
	if (t3 < 0) {
		n3 = 0;
	} else {
		t3 *= t3;
		n3 = t3 * t3 * this._dot3d$AINNN(GRAD3[gi3], x3, y3, z3);
	}
	return 32 * (n0 + n1 + n2 + n3);
};

/**
 * @param {Array.<undefined|!number>} g
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
SimplexNoise.prototype._dot2d$AINN = function (g, x, y) {
	return (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:546] null access");
		}
		return v;
	}(g[0])) * x + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:546] null access");
		}
		return v;
	}(g[1])) * y;
};

/**
 * @param {Array.<undefined|!number>} g
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {!number}
 */
SimplexNoise.prototype._dot3d$AINNN = function (g, x, y, z) {
	return (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:550] null access");
		}
		return v;
	}(g[0])) * x + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:550] null access");
		}
		return v;
	}(g[1])) * y + (function (v) {
		if (! (v != null)) {
			debugger;
			throw new Error("[/tmp/ZTs_0V8cm5.jsx:550] null access");
		}
		return v;
	}(g[2])) * z;
};

/**
 * class Alea extends Object
 * @constructor
 */
function Alea() {
}

Alea.prototype = new Object;
/**
 * @constructor
 */
function Alea$() {
	this.s0 = 0;
	this.s1 = 0;
	this.s2 = 0;
	this.c = 1;
	this._init$AN([ new Date().getTime() ]);
};

Alea$.prototype = new Alea;

/**
 * @constructor
 * @param {!number} seed
 */
function Alea$N(seed) {
	this.s0 = 0;
	this.s1 = 0;
	this.s2 = 0;
	this.c = 1;
	this._init$AN([ seed ]);
};

Alea$N.prototype = new Alea;

/**
 * @constructor
 * @param {Array.<undefined|!number>} seeds
 */
function Alea$AN(seeds) {
	this.s0 = 0;
	this.s1 = 0;
	this.s2 = 0;
	this.c = 1;
	this._init$AN(seeds);
};

Alea$AN.prototype = new Alea;

/**
 * @param {Array.<undefined|!number>} seeds
 */
Alea.prototype._init$AN = function (seeds) {
	var $this = this;
	/** @type {!number} */
	var n;
	var mash;
	/** @type {!number} */
	var s0;
	/** @type {!number} */
	var s1;
	/** @type {!number} */
	var s2;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var len;
	/** @type {!string} */
	var seed;
	n = 0xefc8249d;
	mash = (function (data) {
		/** @type {!number} */
		var i;
		/** @type {!number} */
		var len;
		/** @type {!number} */
		var h;
		for ((i = 0, len = data.length); i < len; i++) {
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
	});
	s0 = mash(' ');
	s1 = mash(' ');
	s2 = mash(' ');
	for ((i = 0, len = seeds.length); i < len; i++) {
		seed = (function (v) {
			if (! (v != null)) {
				debugger;
				throw new Error("[/tmp/ZTs_0V8cm5.jsx:602] null access");
			}
			return v;
		}(seeds[i])) + "";
		s0 -= mash(seed);
		if (s0 < 0) {
			s0 += 1;
		}
		s1 -= mash(seed);
		if (s1 < 0) {
			s1 += 1;
		}
		s2 -= mash(seed);
		if (s2 < 0) {
			s2 += 1;
		}
	}
	this.s0 = s0;
	this.s1 = s1;
	this.s2 = s2;
};

/**
 * @return {!number}
 */
Alea.prototype.random$ = function () {
	/** @type {!number} */
	var t;
	t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10;
	this.s0 = this.s1;
	this.s1 = this.s2;
	return this.s2 = t - (this.c = t | 0);
};

/**
 * @return {!number}
 */
Alea.prototype.uint32$ = function () {
	return (this.random$() * 0x100000000 | 0);
};

/**
 * @return {!number}
 */
Alea.prototype.fract53$ = function () {
	return this.random$() + (this.random$() * 0x200000 | 0) * 1.1102230246251565e-16;
};

/**
 * class dom extends Object
 * @constructor
 */
function dom() {
}

dom.prototype = new Object;
/**
 * @constructor
 */
function dom$() {
};

dom$.prototype = new dom;

/**
 * @param {!string} id
 * @return {HTMLElement}
 */
dom.id$S = function (id) {
	return (function (o) { return o instanceof HTMLElement ? o : null; })(dom.window.document.getElementById(id));
};

var dom$id$S = dom.id$S;

/**
 * @param {!string} id
 * @return {HTMLElement}
 */
dom.getElementById$S = function (id) {
	return (function (o) { return o instanceof HTMLElement ? o : null; })(dom.window.document.getElementById(id));
};

var dom$getElementById$S = dom.getElementById$S;

/**
 * @param {!string} tag
 * @return {HTMLElement}
 */
dom.createElement$S = function (tag) {
	return (function (v) {
		if (! (v == null || v instanceof HTMLElement)) {
			debugger;
			throw new Error("[/usr/local/JSX/lib/js/js/web.jsx:30] detected invalid cast, value is not an instance of the designated type or null");
		}
		return v;
	}(dom.window.document.createElement(tag)));
};

var dom$createElement$S = dom.createElement$S;

/**
 * class TimerHandle extends Object
 * @constructor
 */
function TimerHandle() {
}

TimerHandle.prototype = new Object;
/**
 * @constructor
 */
function TimerHandle$() {
};

TimerHandle$.prototype = new TimerHandle;

/**
 * class Timer extends Object
 * @constructor
 */
function Timer() {
}

Timer.prototype = new Object;
/**
 * @constructor
 */
function Timer$() {
};

Timer$.prototype = new Timer;

/**
 * @param {!number} milliseconds
 * @return {TimerHandle}
 */
Timer.setTimeout$F$V$I = function (listener, milliseconds) {
	var setTimeout;
	setTimeout = (function (o) { return typeof(o) === "function" ? o : null; })(js.global.setTimeout);
	return setTimeout(listener, milliseconds);
};

var Timer$setTimeout$F$V$I = Timer.setTimeout$F$V$I;

/**
 * @param {TimerHandle} timerID
 */
Timer.clearTimeout$LTimerHandle$ = function (timerID) {
	var clearTimeout;
	clearTimeout = (function (o) { return typeof(o) === "function" ? o : null; })(js.global.clearTimeout);
	clearTimeout(timerID);
};

var Timer$clearTimeout$LTimerHandle$ = Timer.clearTimeout$LTimerHandle$;

/**
 * @param {!number} milliseconds
 * @return {TimerHandle}
 */
Timer.setInterval$F$V$I = function (listener, milliseconds) {
	var setInterval;
	setInterval = (function (o) { return typeof(o) === "function" ? o : null; })(js.global.setInterval);
	return setInterval(listener, milliseconds);
};

var Timer$setInterval$F$V$I = Timer.setInterval$F$V$I;

/**
 * @param {TimerHandle} timerID
 */
Timer.clearInterval$LTimerHandle$ = function (timerID) {
	var clearInterval;
	clearInterval = (function (o) { return typeof(o) === "function" ? o : null; })(js.global.clearInterval);
	clearInterval(timerID);
};

var Timer$clearInterval$LTimerHandle$ = Timer.clearInterval$LTimerHandle$;

/**
 * class js extends Object
 * @constructor
 */
function js() {
}

js.prototype = new Object;
/**
 * @constructor
 */
function js$() {
};

js$.prototype = new js;

Config.SCREEN_WIDTH = 465;
Config.SCREEN_HEIGHT = 465;
Config.PARTICLE_NUM = 30000;
Config.NOISE_WIDTH = 16;
Config.NOISE_HEIGHT = 16;
NoiseMap.data = null;
NoiseMap.canvas = null;
NoiseMap.instance = null;
FPS.instance = null;
$__jsx_lazy_init(SimplexNoise, "GRAD3", function () {
	return [ [ 1, 1, 0 ], [ - 1, 1, 0 ], [ 1, - 1, 0 ], [ - 1, - 1, 0 ], [ 1, 0, 1 ], [ - 1, 0, 1 ], [ 1, 0, - 1 ], [ - 1, 0, - 1 ], [ 0, 1, 1 ], [ 0, - 1, 1 ], [ 0, 1, - 1 ], [ 0, - 1, - 1 ] ];
});
$__jsx_lazy_init(dom, "window", function () {
	return js.global.window;
});
js.global = (function () { return this; })();

var $__jsx_classMap = {
	"/tmp/ZTs_0V8cm5.jsx": {
		Config: Config,
		Config$: Config$,
		_Main: _Main,
		_Main$: _Main$,
		Particle: Particle,
		Particle$: Particle$,
		Particle$NN: Particle$NN,
		NoiseMap: NoiseMap,
		NoiseMap$NN: NoiseMap$NN,
		FPS: FPS,
		FPS$: FPS$,
		SimplexNoise: SimplexNoise,
		SimplexNoise$: SimplexNoise$,
		SimplexNoise$N: SimplexNoise$N,
		Alea: Alea,
		Alea$: Alea$,
		Alea$N: Alea$N,
		Alea$AN: Alea$AN
	},
	"system:lib/js/js/web.jsx": {
		dom: dom,
		dom$: dom$
	},
	"system:lib/js/timer.jsx": {
		TimerHandle: TimerHandle,
		TimerHandle$: TimerHandle$,
		Timer: Timer,
		Timer$: Timer$
	},
	"system:lib/js/js.jsx": {
		js: js,
		js$: js$
	}
};


/**
 * launches _Main.main(:string[]):void invoked by jsx --run|--executable
 */
JSX.runMain = function (sourceFile, args) {
	var module = JSX.require(sourceFile);

	if (! module._Main) {
		throw new Error("entry point _Main not found in " + sourceFile);
	}
	if (! module._Main.main$AS) {
		throw new Error("entry point _Main.main(:string[]):void not found in " + sourceFile);
	}
	module._Main.main$AS(args);
};

/**
 * launches _Test#test*():void invoked by jsx --test
 */
JSX.runTests = function (sourceFile, tests) {
	var module = JSX.require(sourceFile);
	var testClass = module._Test$;

	if (!testClass) return; // skip if there's no test class

	if(tests.length === 0) {
		var p = testClass.prototype;
		for (var m in p) {
			if (p[m] instanceof Function
				&& /^test.*[$]$/.test(m)) {
				tests.push(m);
			}
		}
	}

	var test = new testClass();

	if (test.beforeClass$AS != null)
		test.beforeClass$AS(tests);

	for (var i = 0; i < tests.length; ++i) {
		(function (m) {
			test.run$SF$V$(m, function() { test[m](); });
		}(tests[i]));
	}

	if (test.afterClass$ != null)
		test.afterClass$();
};
/**
 * call a function on load/DOMContentLoaded
 */
function $__jsx_onload (event) {
	window.removeEventListener("load", $__jsx_onload);
	document.removeEventListener("DOMContentLoaded", $__jsx_onload);
	JSX.runMain("/tmp/ZTs_0V8cm5.jsx", [])
}

window.addEventListener("load", $__jsx_onload);
document.addEventListener("DOMContentLoaded", $__jsx_onload);

})();
