//var W = window.innerWidth;
//var H = window.innerHeight;    
// ☮⌘♡☿♈♉♋☆☽☉◎
var chars = "☮⌘♡☿♈♉♋☆◎";

//W = cvs.width;
//H = cvs.height;
var MAX_R = 11;
var MIN_R = 6;

var fw = 64;
var fh = 64;
var field = createField(fw, fh, 100);
var mouseX=0, mouseY=0;

window.addEventListener('mousemove', onWindowMouseMove, false);

var cvs = document.getElementById('main');
var ctx = cvs.getContext("2d");

W = window.innerWidth;
H = window.innerHeight;    

cvs.width  = W;
cvs.height = H;


var Particle = function(x, y) {
	this.x = x;
    this.y = y;
    this.vx = 0.0;
    this.vy = 0.0
    this.target = undefined;
    this.c =  this.c = '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16);
    this.r = Math.random()*(MAX_R-MIN_R)+MIN_R;
    this.spin = Math.random() > 0.5 ? 1 : -1;
};

var particles = [];
var pc = 500;
for (var i=0; i<pc; i++) {
    particles[i] = new Particle(Math.random()*W, Math.random()*H);
   	particles[i].target = Math.random()*pc | 0;
}

setInterval(loop, 1000/30);

function onClick() {
	field = createField(fw, fh, 100);
}

function loop() {
    
    if(Math.random() > 0.995) field = createField(fw, fh, 100);
   
    ctx.fillStyle = "rgba(255, 255, 255, 255)";
	ctx.fillRect(0, 0, W, H);
   	
	ctx.putImageData(field, 0, 0);
    
    for (var i=0; i<particles.length; i++) {
        var fp = Math.floor(particles[i].x / W * fw) * 4 +      // field x
            	 Math.floor(particles[i].y / H * fh) * 4 * fw ; // field y
        
        particles[i].vx += (127 - field.data[fp  ])/128; // R chanel
        particles[i].vy += (127 - field.data[fp+1])/128; // G chanel
        
        if(Math.random()>0.99)  {
            var R = 5.0;
        	particles[i].vx += R-Math.random()*R*2;
            particles[i].vy += R-Math.random()*R*2;
        }
                
        particles[i].x -= particles[i].vx;
        particles[i].y -= particles[i].vy;
        
        var m = (particles[i].r-MIN_R)/(MAX_R-MIN_R);
        particles[i].vx *=0.95-m/20;
        particles[i].vy *=0.95-m/20;
        
        if (particles[i].x > W) particles[i].x = 0;
        if (particles[i].x < 0) particles[i].x = W;
        if (particles[i].y > H) particles[i].y = 0;
        if (particles[i].y < 0) particles[i].y = H;
        
        var dx = mouseX-particles[i].x;
		var dy = mouseY-particles[i].y;
     	var ll  = Math.sqrt(dx*dx+dy*dy);
        var ee  = Math.sin(Math.exp(-ll*ll/2000.0)*Math.PI/2);

        ctx.beginPath();
        ctx.arc(
            particles[i].x-dx*ee, 
            particles[i].y-dy*ee, 
            particles[i].r+ee*4, 
            0, Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = particles[i].c;
        ctx.fill();
    }
}

function createField(W, H, iter) {

    var ctx = createContext(W, H);
    var chr = chars.charAt(Math.floor(Math.random()*chars.length));
    ctx.fillStyle = "rgba(127, 127, 127, 255)";
    ctx.fillRect(0, 0, W, H);
    
    ctx.font = "normal normal " + H/1.2+ "px arial";
    ctx.fillStyle = "rgba(255, 255, 255, 255)";
    var tw = ctx.measureText(chr).width;
    ctx.fillText(chr, (W-tw)/2, H/1.2);

	var img = ctx.getImageData(0,0, W, H);
    
    for (var p=0; p<W*H; p++) {
    	img.data[p*4  ] = 127; // R
        img.data[p*4+1] = 127; // G
        img.data[p*4+2] = 127; // B
        img.data[p*4+3] = 255; // A
    }
    
    for (var x=0; x<W; x++) {
        for (var y=0; y<H; y++) {
        	var dx = W/2 - x; 
            var dy = H/2 - y; 
            var ll = Math.sqrt(dx*dx+dy*dy) / W * 2;
            img.data[(x+y*W)*4  ] += dx / ll / 2;
            img.data[(x+y*W)*4+1] += dy / ll / 2;
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

function createContext(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    return canvas.getContext("2d");
}

function onWindowMouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}