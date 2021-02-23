var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 465;
var PARTICLE_NUM = 5000;
var PIXEL_NUM = SCREEN_WIDTH * SCREEN_HEIGHT;
var MAX_SPEED = 8;
var IMAGE_URL = [
    'http://jsrun.it/assets/5/x/s/X/5xsXM.jpg',
    'http://jsrun.it/assets/3/2/O/9/32O9Y.jpg',
    'http://jsrun.it/assets/4/S/d/z/4SdzE.jpg'
];
var IMAGE_NUM = IMAGE_URL.length;

var canvas;
var context;
var imageData;
var imageMaps = [];
var time;

/**
 * Pixels
 */
var Pixels = {
    current: new Int32Array(PIXEL_NUM),
    prev:    new Int32Array(PIXEL_NUM),
    temp:    new Int32Array(PIXEL_NUM),
    
    init: function(pixelNum) {
        var current = this.current = new Int32Array(pixelNum);
        var prev    = this.prev    = new Int32Array(pixelNum);
        var temp    = this.temp    = new Int32Array(pixelNum);
        for (var i = 0; i < pixelNum; i++) {
            current[i] = prev[i] = temp[i] = -16777216;
        }
    }
};

function init() {
    canvas = document.getElementById('c');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    context = canvas.getContext('2d');
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    imageData = context.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // Pixels color
    Pixels.init(PIXEL_NUM);
    Particles.init(PARTICLE_NUM);
    
    currentImageIndex = Akm2.randInt(IMAGE_NUM - 1);
    
    var images = [];
    for (var i = 0; i < IMAGE_NUM; i++) {
        images[i] = loadImage(IMAGE_URL[i], loadComplete);
    }
    
    var count = 0;
    function loadComplete() {
        count++;
        if (count === IMAGE_NUM) {
            for (var i = 0, len = images.length; i < len; i++) {
                imageMaps.push(new ImageMap(images[i], SCREEN_WIDTH, SCREEN_HEIGHT));
            }
            
            document.addEventListener('click', function() {
                changeImageMap();
                time = new Date().getTime();
            }, false);
            time = new Date().getTime();
            setInterval(loop, 1000 / 60);
        }
    }
}

function loadImage(url, callback) {
    var image = new Image();
    image.addEventListener('load', callback, false);
    image.src = url + '?' + new Date().getTime();
    return image;
}

function loop() {
    var w = SCREEN_WIDTH, h = SCREEN_HEIGHT;
    
    var currentPixels = Pixels.current;
    var prevPixels    = Pixels.prev;
    var tempPixels    = Pixels.temp;
    
    var x, y, ox, oy, bx, by;
    var c, r, g, b;
    
    // Blur effects
    // @see http://www.openprocessing.org/sketch/1163
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            r = g = b = 0;
            for(oy = -1; oy <= 1; oy++) {
                for(ox = -1; ox <= 1; ox++) {
                    bx = x + ox;
                    by = y - oy;
                    if (bx >= 0 && by >= 0 && bx < w && by < h) {
                        c = prevPixels[bx + by * w];     
                        r += (c >> 16) & 0xFF;
                        g += (c >> 8)  & 0xFF;
                        b += (c)       & 0xFF;
                    }
                }
            }
            r *= 0.1111111;
            g *= 0.1111111;
            b *= 0.1111111;

            tempPixels[x + y * w] = (255 << 24) | (r << 16) | (g << 8) | b;
        }
    }

    var pixelNum = PIXEL_NUM;
    var i, len;

    // Copy pixels
    for (i = 0; i < pixelNum; i++) {
        currentPixels[i] = tempPixels[i];
    }
    
    var data = imageData.data;
    
    var particleData    = Particles.data;
    var particlePropNum = Particles.PROP_NUM;
    
    var currentImageMap = imageMaps[currentImageIndex];
    var colorData       = currentImageMap.colorData;
    var lightnessData   = currentImageMap.lightnessData;
    
    var speed = MAX_SPEED;
    
    var px, py, vx, vy, l, lv;
    var j, k, r1, g1, b1, r2, g2, b2;
    
    for (i = 0, len = particleData.length; i < len; i += particlePropNum) {
        px = particleData[i];
        py = particleData[i + 1];
        vx = particleData[i + 2];
        vy = particleData[i + 3];
        
        l = lightnessData[(px | 0) + (py | 0) * w];
        lv = l * l;
        px += vx * lv;
        py += vy * lv;
        
        if (px < 0) {
            px = -px;
            vx *= -1;
        } else if (w <= px) {
            px = w - (px - w);
            vx *= -1;
        }
        if (py < 0) {
            py = -py;
            vy *= -1;
        } else if (h <= py) {
            py = h - (py - h);
            vy *= -1;
        }
        
        c = particleData[i + 4];
        r1 = (c >> 16) & 0xFF;
        g1 = (c >> 8)  & 0xFF;
        b1 = (c)       & 0xFF;
        
        j = (px | 0) + (py | 0) * w;
        k = j << 2;
        r2 = colorData[k];
        g2 = colorData[k + 1];
        b2 = colorData[k + 2];
        
        r = ((r2 - r1) * 0.035 + r1) & 0xFF;
        g = ((g2 - g1) * 0.035 + g1) & 0xFF;
        b = ((b2 - b1) * 0.035 + b1) & 0xFF;
        
        c = particleData[i + 4] = (255 << 24) | (r << 16) | (g << 8) | b;
        currentPixels[j] = c;
        
        particleData[i]     = px;
        particleData[i + 1] = py;
        particleData[i + 2] = vx;
        particleData[i + 3] = vy;
    }
    
    for (i = 0; i < pixelNum; i++) {
        c = currentPixels[i];
        j = i * 4;
        data[j]     = c >> 16 & 0xFF;
        data[j + 1] = c >> 8  & 0xFF;
        data[j + 2] = c       & 0xFF;
    }
    
    // Copy pixels
    for (i = 0; i < pixelNum; i++) {
        prevPixels[i] = currentPixels[i];
    }
    
    context.putImageData(imageData, 0, 0);
    
    var now = new Date().getTime();
    if (now - time > 60000) {
        changeImageMap();
        time = now;
    }
}

function changeImageMap() {
    currentImageIndex = (currentImageIndex + 1) % IMAGE_NUM;
}


/**
 * Particles
 */
var Particles = {
    PROP_NUM: 5, // x, y, vx, vy
    
    num: 0,
    data: null,
    
    init: function(num) {
        var propNum = this.PROP_NUM;
        var data = new Float32Array(num * propNum);
        
        for (var i = 0, len = data.length; i < len; i += propNum) {
            data[i]     = Math.random() * SCREEN_WIDTH; // x
            data[i + 1] = Math.random() * SCREEN_HEIGHT; // y
            data[i + 2] = Math.random() * MAX_SPEED * 2 - MAX_SPEED; // vx
            data[i + 3] = Math.random() * MAX_SPEED * 2 - MAX_SPEED; // vy
            data[i + 4] = -16777216; // color
        }
        
        this.num = num;
        this.data = data;
    }
};

/**
 * ImageMap
 */
function ImageMap(image, width, height) {
    if (image instanceof Image) this.init(image, width, height);
}

ImageMap.prototype = {
    colorData: null,
    lightnessData: null,
    
    init: function(image, width, height) {
        var c = document.createElement('canvas');
        c.width  = width;
        c.height = height;
        var ctx = c.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        var data = ctx.getImageData(0, 0, width, height).data;
        
        var len = data.length;
        var lightnessData = window.Float32Array ? new Float32Array(len) : [];
        
        var i, j, r, g, b, max, min, l;
        var toRatio = 1 / 255;
        
        for (i = 0; i < len; i++) {
            j = i * 4;
            r = data[j];
            g = data[j + 1];
            b = data[j + 2];
            max = (max = r > g ? r : g) > b ? max : b;
            min = (min = r < g ? r : g) < b ? max : b;
            l = (max + min) * 0.5 * toRatio;
            l -= (0.5 - l) * (0.5 - l);
            if (l > 1) l = 1; if (l < 0) l = 0;
            
            lightnessData[i] = 1 - l * 0.98;
        }
        
        this.colorData = data;
        this.lightnessData = lightnessData;
    }
};

window.addEventListener('load', init, false);
