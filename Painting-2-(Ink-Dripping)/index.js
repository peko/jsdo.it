// forked from akm2's "Painting" http://jsdo.it/akm2/9ZMq
// forked from akm2's "Shodou" http://jsdo.it/akm2/9ClT

var EX_URL = 'http://jsrun.it/assets/j/y/0/8/jy08l.png';

var DEFAULT_BRUSH_SIZE = 30; // 筆のデフォルトサイズ
var MAX_BRUSH_SIZE = 50; // 筆のサイズの最大値
var MIN_BRUSH_SIZE = 5; // 筆のサイズ最小値
var INK_AMOUNT = 6; // インクの量, 少ないほどかすれやくなる
var SPLASH_RANGE = 75; // 飛沫が飛ぶ最大範囲
var SPLASH_INK_SIZE = 10; // 飛沫の最大サイズ

var canvas, context;
var canvasWidth, canvasHeight;

var mouse = { x: 0, y: 0 };
var isMouseDown = false;
var brush;
var $display, $brushSize, $up, $down;

function init() {
    canvas = document.getElementById('c');

    window.addEventListener('resize', resize, false);
    resize();

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    $display   = document.getElementById('display');
    $brushSize = document.getElementById('brush-size');
    $brushSize.innerHTML = DEFAULT_BRUSH_SIZE;
    $up        = document.getElementById('up');
    $down      = document.getElementById('down');
    
    brush = new Brush(canvasWidth / 2, canvasHeight / 2, DEFAULT_BRUSH_SIZE, INK_AMOUNT, SPLASH_RANGE, SPLASH_INK_SIZE);
    
    var exsample = new Image();
    exsample.onload = function() {
        context.drawImage(exsample, 0, 0);
        
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('dblclick', dobuleClick, false);
        document.addEventListener('mousemove', mouseMove, false);
        document.addEventListener('mouseup', mouseUp, false);
        document.addEventListener('keydown', keyDown, false);
        
        $up.addEventListener('click', brushSizeChange, false);
        $down.addEventListener('click', brushSizeChange, false);

        setInterval(loop, 1000 / 60);
    }
    exsample.src = EX_URL;
}

function resize(e) {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
}

function mouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function mouseDown(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    brush.startStroke();
}

function mouseUp(e) {
    brush.endStroke();
}

function dobuleClick(e) {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    brush.removeDrop();
}

function keyDown(e) {
    if (e.keyCode === 80) { // p key
        // Convert to image
        var img = new Image();
        img.src = canvas.toDataURL('image/png');
        img.style.position = 'absolute';
        img.onload = function() {
            // Remove event listener
            document.removeEventListener('mousemove', mouseMove, false);
            canvas.removeEventListener('mousedown', mouseDown, false);
            document.removeEventListener('mouseup', mouseUp, false);
            canvas.removeEventListener('dblclick', dobuleClick, false);
            document.removeEventListener('keydown', keyDown, false);
            
            canvas.style.display = 'none';
            document.body.appendChild(img);
            $display.innerHTML = 'Converted to image from canvas.';
        };
    }
}

function brushSizeChange(e) {
    if (e.target.id === 'up') {
        brush.size++;
    } else if (e.target.id === 'down') {
        brush.size--;
    }
    
    $brushSize.innerHTML = brush.size;
}

function loop() {
    brush.render(context, mouse.x, mouse.y);
}


(function(window) {    
    /**
     * Brush
     */
    function Brush(x, y, size, inkAmount, splashRange, splashInkSize) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.inkAmount = inkAmount;
        this.splashRange = splashRange;
        this.splashInkSize = splashInkSize;
        
        this.color = {
            h: 0,
            s: 80,
            l: 50,
            a: 1,
            toString: function() {
                return 'hsla(' + this.h + ', ' + this.s + '%, ' + this.l + '%, ' + this.a + ')';
            }
        };
        
        this.resetTip();
        
        this._drops = [];
    }

    Brush.prototype = {
        isStroke: false,
        strokeId: null,
        _latest: null,
        _strokeRenderCount: 0,
        _dropCount: 0,
        _hairs: null,
        _latestStrokeLength: 0,
        
        startStroke: function() {
            this.resetTip();
            this.strokeId = new Date().getTime();
            this._dropCount = random(6, 3) | 0;
            this.isStroke = true;
        },
        
        endStroke: function() {
            this.isStroke = false;
            this._strokeRenderCount = 0;
            this._dropCount = 0;
            this.strokeId = null;
        },
        
        resetTip: function() {
            var hairs = this._hairs = [];
            var inkAmount = this.inkAmount;
            var hairNum = this.size * 2;
            
            var range = this.size / 2;
            var rx, ry, c0, x0, y0;
            var c = random(Math.PI * 2), cv, sv, x, y;
            
            for (var i = 0, r; i < hairNum; i++) {
                rx = random(range);
                ry = rx / 2;
                c0 = random(Math.PI * 2);
                x0 = rx * Math.sin(c0);
                y0 = ry * Math.cos(c0);
                cv = Math.cos(c);
                sv = Math.sin(c);
                x = this.x + x0 * cv - y0 * sv;
                y = this.y + x0 * sv + y0 * cv;
                hairs[i] = new Hair(x, y, 10, inkAmount);
            }
            
            this.color.h += 140;
        },
        
        render: function(ctx, mouseX, mouseY) {
            this._strokeRenderCount++;
            if (this._strokeRenderCount % 120 === 0 && this._dropCount < 10) {
                this._dropCount++;
            }
            
            if (!this._latest) {
                this._latest = { x: mouseX, y: mouseY };
            } else {
                this._latest.x = this.x;
                this._latest.y = this.y;
            }
            this.x = mouseX;
            this.y = mouseY;
            
            var dx = this.x - this._latest.x;
            var dy = this.y - this._latest.y;
            var dist = this._latestStrokeLength = Math.sqrt(dx * dx + dy * dy);
            
            var hairs = this._hairs;
            var i, len;
            
            for (i = 0, len = hairs.length; i < len; i++) {
                hairs[i].update(dx, dy, dist);
            }
            
            if (this.isStroke) {
                var color = this.color.toString();
                
                for (i = 0, len = hairs.length; i < len; i++) {
                    hairs[i].draw(ctx, color);
                }

                if (dist > 30) {
                    this.drawSplash(ctx, this.splashRange, this.splashInkSize);
                } else if (dist && dist < 10 && random() < 0.085 && this._dropCount) {
                    this._drops.push(new Drop(this.x, this.y, random(this.size * 0.25, this.size * 0.1), color, this.strokeId));
                    this._dropCount--;
                }
            }
            
            var drops = this._drops, drop;
            for (i = 0, len = drops.length; i < len; i++) {
                drop = drops[i];
                drop.update(this);
                drop.draw(ctx);
                if (drop.life < 0) {
                    drops.splice(i, 1);
                    len--;
                    i--;
                }
            }
        },
        
        removeDrop: function() {
            this._drops = [];
        },
        
        drawSplash: function(ctx, range, maxSize) {
            var num = random(12, 0);
            var c, r, x, y;
            
            ctx.save();
            for (var i = 0; i < num; i++) {
                r = random(range, 1);
                c = random(Math.PI * 2);
                x = this.x + r * Math.sin(c);
                y = this.y + r * Math.cos(c);
                dot(ctx, x, y, this.color.toString(), random(maxSize, 0));
            }
            ctx.restore();
        }
    };


    /**
     * Hair
     */
    function Hair(x, y, lineWidth, inkAmount) {
        this.x = x || 0;
        this.y = y || 0;
        this.lineWidth = lineWidth;
        this.inkAmount = inkAmount;
        
        this._currentLineWidth = this.lineWidth;
        this._latest = { x: this.x, y: this.y };
    }

    Hair.prototype = {
        update: function(strokeX, strokeY, strokeLength) {
            this._latest.x = this.x;
            this._latest.y = this.y;
            this.x += strokeX;
            this.y += strokeY;

            var per = clamp(this.inkAmount / strokeLength, 1, 0);
            this._currentLineWidth = this.lineWidth * per;
        },

        draw: function(ctx, color) {
            ctx.save();
            ctx.lineCap = 'round';
            line(ctx, this._latest, this, color, this._currentLineWidth);
            ctx.restore();
        }
    };
    
    
    /**
     * Drop
     */
    function Drop(x, y, amount, color, strokeId) {
        this.x = x || 0;
        this.y = y || 0;
        this.amount = random(amount, amount * 0.5);
        this.life = this.amount * 1.5;
        this.color = color;
        this.strokeId = strokeId;
        
        this._latest = { x: this.x, y: this.y };
    }
    
    Drop.prototype = {
        _xrate: 0,
        
        update: function(brush) {
            var dx = brush.x - this.x;
            var dy = brush.y - this.y;
            if (brush.size * 0.3 > Math.sqrt(dx * dx + dy * dy) && brush.strokeId !== this.strokeId) {
                this.life = 0;
                return;
            }
            
            this._latest.x = this.x;
            this._latest.y = this.y;
            this.y += random(this.life * 0.5);
            this.x += this.life * this._xrate;
            this.life -= random(0.05, 0.01);
            
            if (random() < 0.03) {
                this._xrate += random(0.03, - 0.03);
            } else if (random() < 0.05) {
                this._xrate *= 0.01;
            }
        },
        
        draw: function(ctx) {
            ctx.save();
            ctx.lineCap = ctx.lineJoin = 'round';
            line(ctx, this._latest, this, this.color, this.amount + this.life * 0.3);
            ctx.restore();
        }
    };
    
    
    // Draw helpers
    
    function line(ctx, p1, p2, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
    
    function dot(ctx, x, y, color, size) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2, false);
        ctx.fill();
    }
    
    window.Brush = Brush;
    
})(window);


// Helpers

function clamp(n, max, min) {
    if (typeof min !== 'number') min = 0;
    return n > max ? max : n < min ? min : n;
}

function random(max, min) {
    if (typeof max !== 'number') {
        return Math.random();
    } else if (typeof min !== 'number') {
        min = 0;
    }
    return Math.random() * (max - min) + min;
}

// Init
window.addEventListener('load', init, false);
