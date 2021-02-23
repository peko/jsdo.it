/**
 * Using PerlinNoise class
 * Using Point class
 * @see http://jsdo.it/akm2/fhMC
 */

PerlinNoise.useClassic = true;

var BACKGROUND_COLOR = '#0b5693';

var canvas;
var canvasWidth;
var canvasHeight;
var context;
var mouse = new Point();
var lightning;
var points;

function init() {
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    
    canvas = document.getElementById('c');
    context = canvas.getContext('2d');
    
    window.addEventListener('resize', resize, false);
    resize();
    
    points = [
        new LightningPoint(50, canvasHeight / 2),
        new LightningPoint(415, canvasHeight / 2)
    ];
    
    lightning = new Lightning(Point.create(points[0]), Point.create(points[1]));
    lightning.childNum(3);
    
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('mouseup', mouseUp, false);
    document.addEventListener('keydown', keyDown, false);
    
    setInterval(loop, 1000 / 60);
}

function resize() {
    canvas.width = canvasWidth = window.innerWidth;
    canvas.height = canvasHeight = window.innerHeight;
}

function mouseMove(e) {
    mouse.set(e.clientX, e.clientY);
    
    for (var i = 0, hit = false, p; i < 2; i++) {
        p = points[i];
        if ((!hit && p.hitTest(mouse)) || p.dragging) {
            hit = true;
        }
    }
    
    document.body.style.cursor = hit ? 'pointer' : 'default';
}

function mouseDown(e) {
    for (var i = 0, p; i < 2; i++) {
        p = points[i];
        if (p.hitTest(mouse)) {
            p.startDrag();
            return;
        }
    }
}

function mouseUp(e) {
    for (var i = 0, p; i < 2; i++) {
        p = points[i];
        if (p.dragging) p.endDrag();
    }
}

function keyDown(e) {
    if (e.keyCode === 67) {
        var childNum = lightning.childNum();
        lightning.childNum(childNum < 10 ? childNum + 1 : 0);
    }
}

function loop() {
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    
    for (var i = 0, p; i < 2; i++) {
        p = points[i];
        
        if (p.dragging) p.drag(mouse);
        p.update(points);
        p.draw(context);
    }
    
    lightning.start(points[0]);
    lightning.end(points[1]);
    lightning.step(Math.ceil(lightning.length() / 7.5));
    lightning.update();
    lightning.draw(context);
}


/**
 * LightningPoint
 */
function LightningPoint(x, y) {
    var self = this;
    
    self.x = x || 0;
    self.y = y || 0;
    self.v = new Point(Math.random() - 0.5, Math.random() - 0.5).normalize(1);
    self.radius = 5;
    self.dragging = false;
    
    var targetRadius = this.radius;
    var currentRadius = this.radius;
    var latestDrag = null;
    
    self.update = function(points) {
        currentRadius = self.radius * 0.5 + self.radius * 0.5 * Math.random();
        self.radius += (targetRadius - self.radius) * 0.1;
        
        if (self.dragging) return;
        
        for (var i = 0, len = points.length, p, d; i < len; i++) {
            p = points[i];
            if (p !== this) {
                d = Point.distance(self, p);
                if (d < 200) {
                    self.v = self.v.add(Point.subtract(self, p).normalize(0.03));
                } else if (d > 450) {
                    self.v = self.v.add(Point.subtract(p, self).normalize(0.015));
                }
            }
        }
        
        if (self.v.length() > 3) self.v.normalize(3);
        
        self.x += self.v.x;
        self.y += self.v.y;
        
        if (self.x < 0) {
            self.x = 0;
            if (self.v.x < 0) self.v.x *= -1;
            
        } else if (self.x > canvasWidth) {
            self.x = canvasWidth;
            if (self.v.x > 0) self.v.x *= -1;
        }
        
        if (self.y < 0) {
            self.y = 0;
            if (self.v.y < 0) self.v.y *= -1;
            
        } else if (self.y > canvasHeight) {
            self.y = canvasHeight;
            if (self.v.y > 0) self.v.y *= -1;
        }
    };
    
    self.hitTest = function(p) {
        if (Point.distance(this, p) < 30) {
            self.radius = targetRadius * 2.5;
            return true;
        }
        return false;
    };
    
    self.startDrag = function() {
        self.dragging = true;
        self.v.set(0, 0);
        latestDrag = Point.create(self);
    };
    
    self.drag = function(p) {
        latestDrag.set(self);
        self.x = p.x;
        self.y = p.y;
    };
    
    self.endDrag = function() {
        self.v = Point.subtract(self, latestDrag);
        self.dragging = false;
    };
    
    self.draw = function(ctx) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(self.x, self.y, currentRadius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };
}



/**
 * Lightning
 */
function Lightning(startPoint, endPoint, stepNum) {
    var self = this;
        
    var start = startPoint || new Point();
    var end = endPoint || new Point();
    var step = stepNum || 45;
    var length = start.distance(end);
    
    var perlinNoise = new PerlinNoise(Math.floor(Math.random() * 1000) + 1);
    perlinNoise.octaves(6);
    //perlinNoise.fallout(0.5);
    
    var off = 0;
    var points;
    var children = [];
    
    // case by child
    var parent = null;
    var startStep = 0;
    var endStep = 0;
    var timer;
    
    // speed
    self.speed = 0.02;
    
    // line width
    self.lineWidth = 3;
    
    // blur size and color
    self.blur = 50;
    self.blurColor = 'rgba(255, 255, 255, 0.75)';
    
    self.start = function(x, y) {
        if (!arguments.length) return start.clone();
        start.set(x, y);
    };
    
    self.end = function(x, y) {
        if (!arguments.length) return end.clone();
        end.set(x, y);
    };
    
    self.step = function(n) {
        if (!arguments.length) return step;
        step = Math.floor(n);
    };
    
    self.length = function() {
        return start.distance(end);
    };
    
    self.point = function(index) {
        return points[index];
    };
    
    self.childNum = function(num) {
        if (arguments.length === 0) return children.length;
        
        if (children.length > num) {
            children.splice(num, children.length - num);
            
        } else {
            for (var i = children.length, child; i < num; i++) {
                child = new Lightning();
                child.speed = 0.03;
                child.lineWidth = 1.5;
                child.setAsChild(self);
                children.push(child);
            }
        }
    };
    
    self.setAsChild = function(lightning) {
        if (!(lightning instanceof Lightning)) return;
        
        parent = lightning;
    
        timer = new Timer(Math.floor(Math.random() * 1500) + 1);
        timer.onTimer = function() {
            this.delay = Math.floor(Math.random() * 1500) + 1;
            self.getStepsFromParent();
        };
        timer.start();
    };
    
    self.getStepsFromParent = function() {
        if (!parent) return;
        var parentStep = parent.step();
        startStep = Math.floor(Math.random() * (parentStep - 2));
        endStep = startStep + Math.floor(Math.random() * (parentStep - startStep - 2)) + 2;
    };
    
    self.update = function() {
        if (parent) {
        if (endStep > parent.step()) {
                this.getStepsFromParent();
            }
        
            start.set(parent.point(startStep));
            end.set(parent.point(endStep));
        }
        
        var length = self.length();
        var normal = end.subtract(start).normalize(length / step);
        var rad = normal.angle();
        var sin = Math.sin(rad);
        var cos = Math.cos(rad);
        var i, len;
        
        points = [];
        off += self.speed;
        
        for (i = 0, len = step + 1; i < len; i++) {
            var na = length * perlinNoise.noise(i / 50 - off) * 1.5;
            var ax = sin * na;
            var ay = cos * na;
            
            var nb = length * perlinNoise.noise(i / 50 + off) * 1.5;
            var bx = sin * nb;
            var by = cos * nb;
            
            var m = Math.sin((Math.PI * (i / (len - 1))));
            
            var x = start.x + normal.x * i + (ax - bx) * m;
            var y = start.y + normal.y * i - (ay - by) * m;
            
            points.push(new Point(x, y));
        }
        
        // Update children
        for (i = 0, len = children.length; i < len; i++) {
            children[i].update();
        }
    };
    
    self.draw = function(ctx) {
        var i, len, p;
    
        // Blur
        if (self.blur) {
            var d;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = self.blur;
            ctx.shadowColor = self.blurColor;
            ctx.beginPath();
            for (i = 0, len = points.length; i < len; i++) {
                p = points[i];
                d = len > 1 ? p.distance(points[i === len - 1 ? i - 1 : i + 1]) : 0;
                ctx.moveTo(p.x + d, p.y);
                ctx.arc(p.x, p.y, d, 0, Math.PI * 2, false);
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        
        ctx.save();
        ctx.lineWidth = Math.random() * self.lineWidth + 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        for (i = 0, len = points.length; i < len; i++) {
            p = points[i];
            ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y);
        }
        ctx.stroke();
        ctx.restore();
        
        // Draw children
        for (i = 0, len = children.length; i < len; i++) {
            children[i].draw(ctx);
        }
    };
}

// Init
window.onload = function() {
    init();
};
