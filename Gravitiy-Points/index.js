/**
 * Use Point class
 * @see http://jsdo.it/akm2/fhMC
 */

var FPS = 60,
    PARTICLE_RADIUS = 1,
    PREF_PARTICLE_NUM = 50,
    USER_ADD_PERTICLE_NUM = 10,
    G_POINT_RADIUS = 10,
    G_POINT_RADIUS_LIMITS = 65;
    
var context,
    mousePoint = new Point(),
    attractGravityPoint = true;
    gravities = [];
    particles = [];

function init() {
    var c = document.getElementById('c');
    c.width  = innerWidth;
    c.height = innerHeight;
    context = c.getContext('2d');
    
    addParticle(PREF_PARTICLE_NUM);
    
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('mouseup', mouseUp, false);
    document.addEventListener('dblclick', doubleClick, false);
    document.addEventListener('keydown', keyDown, false);
    
    setInterval(loop, 1000 / FPS);
}

function mouseMove(e) {
    mousePoint.x = e.clientX;
    mousePoint.y = e.clientY;
    
    var i, g, hit = false;
    for (i = gravities.length - 1; i >= 0; i--) {
        g = gravities[i];
        // 重力点がマウスと重なっているかドラッグ中ならマウスオーバーフラグを立てて以降の全てのフラグ (背面にあるオブジェクトのフラグ) を false にする
        if ((!hit && g.hitTest(mousePoint)) || g.dragging) {
            g.isMouseOver = true;
            hit = true;
        } else {
            g.isMouseOver = false;
        }
    }
    
    document.body.style.cursor = hit ? 'pointer' : 'default';
}

function mouseDown(e) {
    var i, g;
    for (i = gravities.length - 1; i >= 0; i--) {
        g = gravities[i];
        if (g.isMouseOver) {
            g.startDrag(mousePoint);
            return;
        }
    }
    gravities.push(new GravityPoint(e.clientX, e.clientY, G_POINT_RADIUS, {
        particles: particles,
        gravities: gravities
    }));
}

function mouseUp(e) {
    var i, len, g;
    for (i = 0, len = gravities.length; i < len; i++) {
        g = gravities[i];
        if (g.dragging) {
            g.endDrag();
            break;
        }
    }
}

function doubleClick(e) {
    var i, g;
    for (i = gravities.length - 1; i >= 0; i--) {
        g = gravities[i];
        if (g.isMouseOver) {
            g.collapse();
            break;
        }
    }
}

function keyDown(e) {
    if (e.keyCode === 77) attractGravityPoint = !attractGravityPoint; // m key
    if (e.keyCode === 80) addParticle(USER_ADD_PERTICLE_NUM); // p key
    if (e.keyCode === 68) removeParticle(USER_ADD_PERTICLE_NUM); // d key
}


/**
 * Loop
 */
function loop() {
    context.fillStyle = 'rgba(1, 32, 36, 0.5)';
    context.fillRect(0, 0, innerWidth, innerHeight);
    
    var i, len, g;
    
    // Gravity Point
    for (i = 0, len = gravities.length; i < len; i++) {
        g = gravities[i];
        // Drag
        if (g.dragging) g.drag(mousePoint);
        // Update
        g.update(context);
        // Remove Destroyed
        if (gravities[i].destroyed) {
            gravities.splice(i, 1);
            len--;
            i--;
        }
    }
    
    // Particle
    for (i = 0, len = particles.length; i < len; i++) {
        particles[i].update(context);
    }
}

function addParticle(num) {
    for (var i = 0; i < num; i++) {
        var p = new Particle(
            Math.floor(Math.random() * innerWidth - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
            Math.floor(Math.random() * innerHeight - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
            PARTICLE_RADIUS
        );
        p.addSpeed(new Point(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1));
        particles.push(p);
    }
}

function removeParticle(num) {
    if (particles.length < num) num = particles.length;
    for (var i = 0; i < num; i++) {
        particles.pop();
    }
}


/**
 * GravityPoint
 */
function GravityPoint(x, y, radius, targets) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius; // 実際の半径
    this.currentRadius = radius * 0.5; // 描画されている半径, 追加時の効果のため半分の値を代入
    this.targets = extend({ particles: [], gravities: [] }, targets);
    
    this.gravity = 0.05;
    this.isMouseOver = false;
    this.dragging = false;
    this.destroyed = false;
    
    this._speed = new Point();
    this._rd = 0; // 半径のイージング用
    this._dragDistance = null; // ドラッグ開始時のマウスポインタと中心座標の距離を座標値で示すオブジェクト
    this._collapsing = false;
}

GravityPoint.prototype = {
    
    hitTest: function(p) {
        return Point.distance(this, p) < this.radius;
    },
    
    startDrag: function(dragStartPoint) {
        this._dragDistance = Point.subtract(dragStartPoint, this);
        this.dragging = true;
    },
    
    drag: function(dragToPoint) {
        this.x = dragToPoint.x - this._dragDistance.x;
        this.y = dragToPoint.y - this._dragDistance.y;
    },
    
    endDrag: function() {
        this._dragDistance = null;
        this.dragging = false;
    },
    
    addSpeed: function(d) {
        this._speed = this._speed.add(d);
    },
    
    collapse: function(e) {
        this.currentRadius *= 1.75;
        this._collapsing = true;
    },
    
    update: function(ctx) {
        if (this.destroyed) return;
        
        var i, len, target, s;
        
        // Particle に重力を加算
        for (i = 0, len = this.targets.particles.length; i < len; i++) {
            target = this.targets.particles[i];
            
            s = Point.subtract(this, target);
            s.normalize(this.gravity);
            target.addSpeed(s);
        }
        
        // エフェクト用に半径をイージング
        this._rd = (this._rd + (this.radius - this.currentRadius) * 0.07) * 0.95;
        this.currentRadius += this._rd;
        if (this.currentRadius < 0) this.currentRadius = 0;
        
        // 収縮して崩壊
        if (this._collapsing) {
            this.radius *= 0.75;
            if (this.currentRadius < 1) this.destroyed = true;
            this.draw(ctx);
            return;
        }
        
        var absorp, area, targetArea;
        
        // 他の重力点への干渉
        for (i = 0, len = this.targets.gravities.length; i < len; i++) {
            target = this.targets.gravities[i];
            
            if (target === this || target.destroyed) continue;
            
            // 他の重力点との融合, 小さいほうを吸収するので半径の大きい重力点側で加算処理を行う
            // ドラッグ中の場合は大きさに関わらずそちらを優先する
            if (
                (this.currentRadius >= target.radius || this.dragging) &&
                Point.distance(this, target) < (this.currentRadius + target.radius) * 0.85
            ) {
                target.destroyed = true;
                this.gravity += target.gravity;
                
                absorp = Point.subtract(target, this).scale(target.radius / this.radius * 0.5);
                this.addSpeed(absorp);
                
                // 吸収する重力点の面積を加算する, 吸収時のエフェクトとして吸収される側の面積を大きくして算出した半径 (currentRadius) から実半径 (radius) に収縮させる
                area = Math.pow(this.radius, 2) * Math.PI;
                targetArea = Math.pow(target.radius, 2) * Math.PI;
                this.currentRadius = Math.sqrt((area + targetArea * 3) / Math.PI);
                this.radius = Math.sqrt((area + targetArea) / Math.PI);
            }
            
            s = Point.subtract(this, target);
            s.normalize(this.gravity);
            target.addSpeed(s);
        }
        
        if (attractGravityPoint && !this.dragging) {
            this.x += this._speed.x;
            this.y += this._speed.y;
        }
        
        this._speed = new Point();
        
        if (this.currentRadius > G_POINT_RADIUS_LIMITS) this.collapse();
        
        this.draw(ctx);
    },
    
    draw: function(ctx) {
        var r, grd;
        
        grd = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 5);
        grd.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2, false);
        ctx.fill();
        
        r = Math.random() * this.currentRadius * 0.35 + this.currentRadius * 0.65;
        
        grd = ctx.createRadialGradient(this.x, this.y, r, this.x, this.y, this.currentRadius);
        grd.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grd.addColorStop(1, Math.random() < 0.2 ? 'rgba(255, 196, 0, 0.15)' : 'rgba(103, 181, 191, 0.75)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
        ctx.fill();
    }
};


/**
 * Particle
 */
function Particle(x, y, radius) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius;
    this._latestX = this._latestY = 0;
    this._speed = new Point();
}

Particle.prototype = {
    
    addSpeed: function(d) {
        this._speed = this._speed.add(d);
    },
    
    update: function(ctx) {
        if (this._speed.length() > 12) this._speed.normalize(12);
        
        this._latestX = this.x;
        this._latestY = this.y;
        this.x += this._speed.x;
        this.y += this._speed.y;
        
        this.draw(ctx);
    },
    
    draw: function(ctx) {
        ctx.fillStyle = ctx.strokeStyle = 'white';
        ctx.lineWidth = this.radius * 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this._latestX, this._latestY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
};


// Init
window.onload = init;
