var W = window.innerWidth;
var H = window.innerHeight;    

var Circle = function(x,y) {
	this.x = x;
    this.y = y;
    this.r = 1;
    this.c = '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16)
}
    
var chars = "☭☮☢☀⌘⊙⊛⁋☔☉♥♻✪✔✗❣❤⦿✉✂☿♀♂♈♉♋☂★☆✈✆✑❁❂❄";
var cvs=document.getElementById('main');
cvs.width  = W;
cvs.height = H;
var chr = chars.charAt(Math.floor(Math.random()*chars.length));
var ctx = cvs.getContext('2d');
ctx.font = "normal normal " + H/1.2+ "px arial";
ctx.fillStyle = "white";
var tw = ctx.measureText(chr).width;
ctx.fillText(chr,(W-tw)/2, H/1.2);

var img;

// get points inside shape
var points = [];

generatePoints();

//ctx.globalCompositeOperation = "destination-out";


setInterval(grow, 10); 

function generatePoints() {
    
    img = ctx.getImageData(0,0, W, H);
    var p_cnt = 0;
    var cnt = 0;
    while (p_cnt < 5 && cnt < 10000) {
        var x = Math.floor(Math.random()*W);
        var y = Math.floor(Math.random()*H);
        var random_id = (x+y*W)*4;
        if (img.data[random_id+3] > 128) {
            points[p_cnt++] = new Circle(x,y);
            img.data[random_id+1] = 255;
        } else{
            img.data[random_id+3] = 100;
        }
        
        cnt++;
    }
}


function grow() {
    if(!points.length) generatePoints();
    img = ctx.getImageData(0,0, W, H);
    var points2 = []
    var pc = 0;    
    for (var i=0; i < points.length; i++) {
        
        var coliding = false;
        var split = 32;
        for (var j=0; j < split; j++) {
            var x = Math.ceil(points[i].x + Math.sin(Math.PI*2/split*j)*(points[i].r+3.0));
            var y = Math.ceil(points[i].y + Math.cos(Math.PI*2/split*j)*(points[i].r+3.0));
            if (img.data[(x+y*W)*4+3] < 10 || img.data[(x+y*W)*4] < 250 || points[i].r >20 ) {
                coliding = true;
                break;
            }
        }
        
        if(!coliding) { 
            points[i].r+=2;
            ctx.beginPath();
            ctx.fillStyle = points[i].c;
            ctx.arc(points[i].x, points[i].y, points[i].r, 0, 3.1415926*2, false);
            ctx.fill();
            ctx.closePath();
            points2[pc++]  = points[i];
        }
    }
	points = points2;
}
