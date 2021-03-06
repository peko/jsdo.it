// Generated by CoffeeScript 1.3.3

/*
	HYPO-ALERGIC TANGENSOID
*/


(function() {
  var H, Tangensoid, W, createContext, ctx, cvs, i, img, mainloop, r2g, tangensoids, tc;

  Tangensoid = (function() {

    Tangensoid.prototype.target = null;

    Tangensoid.prototype.vx = 0;

    Tangensoid.prototype.vy = 0;

    Tangensoid.prototype.a = 0;

    Tangensoid.prototype.va = 0;

    Tangensoid.prototype.ox = 0;

    Tangensoid.prototype.oy = 0;

    Tangensoid.prototype.speed = 3;

    Tangensoid.prototype.orbiting = false;

    function Tangensoid(x, y, r, c) {
      this.x = x;
      this.y = y;
      this.r = r != null ? r : Math.random() * 20 + 10;
      this.c = c != null ? c : "#404040";
    }

    Tangensoid.prototype.draw = function() {
      var p;
      p = (Math.ceil(this.x) + Math.ceil(this.y) * W) * 4;
      if ((0 < p && p < W * H * 4)) {
        img.data[p + 3] = 200;
      }
      ctx.strokeStyle = "rgba(40,40,40,0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      if (this.target) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.closePath();
        ctx.stroke();
      }
      if (this.orbiting) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.orbitingTarget.x, this.orbitingTarget.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.oy * 30, this.y + this.ox * 30);
        ctx.strokeStyle = "rgba(255,  0 ,  0, 0.5)";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx * 30, this.y + this.vy * 30);
        ctx.strokeStyle = "rgba(  0, 0, 255, 0.5)";
        ctx.stroke();
      }
    };

    Tangensoid.prototype.getRandomTarget = function() {
      return tangentosoids[Math.random() * tangensoids.length | 0];
    };

    Tangensoid.prototype.setTarget = function() {
      this.target = tangensoids[1 + tc++ % (tangensoids.length - 1)];
    };

    Tangensoid.prototype.move = function() {
      var a, b, dx, dy, ln;
      if (!this.target) {
        return;
      }
      if (!this.orbiting) {
        dx = this.target.x - this.x;
        dy = this.target.y - this.y;
        ln = Math.sqrt(dx * dx + dy * dy);
        a = Math.atan2(dy, dx);
        b = Math.asin((this.target.r + this.r) / ln);
        this.vx = Math.cos(a + b);
        this.vy = Math.sin(a + b);
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
        if (ln <= this.target.r + this.r + 0.5) {
          this.a = Math.atan2(dy, dx) + Math.PI * 2;
          this.orbiting = true;
          this.orbitingTarget = this.target;
          this.ox = this.vy;
          this.oy = -this.vx;
          this.setTarget();
        }
      } else {
        this.a -= this.speed / (this.orbitingTarget.r + this.r);
        this.ox = Math.cos(this.a);
        this.oy = Math.sin(this.a);
        this.x = this.orbitingTarget.x - this.ox * (this.orbitingTarget.r + this.r);
        this.y = this.orbitingTarget.y - this.oy * (this.orbitingTarget.r + this.r);
        dx = this.target.x - this.x;
        dy = this.target.y - this.y;
        ln = Math.sqrt(dx * dx + dy * dy);
        a = Math.atan2(dy, dx);
        b = Math.asin((this.target.r + this.r) / ln);
        this.vx = Math.cos(a + b);
        this.vy = Math.sin(a + b);
        if ((this.vx + this.oy) * (this.vx + this.oy) + (this.vy - this.ox) * (this.vy - this.ox) < 0.01) {
          this.orbiting = false;
        }
      }
    };

    return Tangensoid;

  })();

  mainloop = function() {
    var t, _i, _j, _len, _len1;
    ctx.putImageData(img, 0, 0);
    for (_i = 0, _len = tangensoids.length; _i < _len; _i++) {
      t = tangensoids[_i];
      t.draw();
    }
    for (_j = 0, _len1 = tangensoids.length; _j < _len1; _j++) {
      t = tangensoids[_j];
      t.move();
    }
  };

  createContext = function(W, H) {
    var canvas;
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    return canvas.getContext("2d");
  };

  /*
  INIT
  */


  cvs = document.getElementById("world");

  cvs.width = W = window.innerWidth;

  cvs.height = H = window.innerHeight;

  r2g = 1 / Math.PI * 180.0;

  tc = 0;

  ctx = cvs.getContext("2d");

  img = ctx.createImageData(W, H);

  i = 20;

  tangensoids = ((function() {
    var _results;
    _results = [];
    while (i--) {
      _results.push(new Tangensoid(H / 2 * (1 + Math.random() - Math.random()), W / 2 * (1 + Math.random() - Math.random()) | 0));
    }
    return _results;
  })());

  tangensoids[0].r = 10;

  tangensoids[0].setTarget();

  setInterval(mainloop, 1000 / 30);

}).call(this);
