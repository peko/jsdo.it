// forked from peko's "KDTree Test" http://jsdo.it/peko/dfwK
var MAX_PARTICLES = 200;
var MAX_NODES     = 1000;
var NUM_NEIGHBORS = 10;
var cvs = document.getElementById('world');
var ctx = cvs.getContext('2d');
W = cvs.width  = window.innerWidth;
H = cvs.height = window.innerHeight;
var particles, nodes, kdtree;
var treeImage;

window.addEventListener('mousemove', onWindowMouseMove, false);

setInterval(loop, 1000/30);

function loop() {
    if(treeImage) ctx.putImageData(treeImage, 0, 0);
    //ctx.clearRect(0,0,W,H);
	for (var i=0; i<MAX_PARTICLES; i++) {
    	if(particles[i].t_node) {
            
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy; 
            
            //this.x += (this.tx-this.x)/10;
            //this.y += (this.ty-this.y)/10; 
            
            if(Math.abs(particles[i].x-particles[i].tx)+Math.abs(particles[i].y-particles[i].ty)<5) {
                particles[i].setTarget(particles[i].t_node.nn[Math.floor(Math.random()*particles[i].t_node.nn.length)]);
            }
        }
        ctx.beginPath();
        ctx.fillStyle = particles[i].c;
        ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, 3.1415926*2, false);
        ctx.fill();
        ctx.closePath();
        
    }
}

function onClick() {
    ctx.clearRect(0,0,W,H);
	generateTree();
    treeImage = drawTree();
    for (var i=0; i<MAX_PARTICLES; i++) {
      	var p = particles[i];
        p.setTarget(nodes[Math.floor(Math.random()*nodes.length)]);
    }
}


var Node = function(x,y) {
	this.x = x;
    this.y = y;
    
    this.nn = undefined;
    
}


var Particle = function(x,y) {
	this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.t_node = undefined;
    this.tx = undefined;
    this.ty = undefined;
    this.c = "rgba(0,0,0,0.8)";//'#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16);
    this.r = 2;
}
    
Particle.prototype.move = function() {

}


Particle.prototype.setTarget = function(node) {
    	this.t_node = node;
        this.tx = node.x;
        this.ty = node.y;
        var dx = this.tx-this.x;
        var dy = this.ty-this.y;
        var ll = Math.sqrt(dx*dx+dy*dy);
       	this.vx = dx/ll*3;
        this.vy = dy/ll*3;
}


function generateParticles() {
    
	particles = [];
    for (var i=0; i<MAX_PARTICLES; i++) {
    	particles[i] = new Particle(Math.random()*W, Math.random()*H);
    }
   
}

    
function generateTree() {
    nodes = generateNodes(W, H, MAX_NODES);
    kdtree = new datastructure.KDTree(nodes);
}

function drawTree() {
    
    var ctx=createContext(W, H);
    for (var i=0; i<nodes.length; i++) {
        var cp = [];
        var nn = kdtree.getNearestNeighbours(nodes[i], NUM_NEIGHBORS, cp);
        //nn.splice(0, 4);
        nodes[i].nn = nn;

        ctx.strokeStyle="rgba(0,0,0,0.05)";
        for(var j=1; j<nn.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nn[j].x, nn[j].y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    return ctx.getImageData(0,0, W, H);
}


function generateNodes(W, H, cnt) {
    
    var chars = "☼☀☉☁☂☔★☆✪♈♉☯☮♡❤✈♩♪♫♭▲△◎⌘ぬのはふへ";
    
    var ctx = createContext(W, H);
    var chr = chars.charAt(Math.floor(Math.random()*chars.length));
    
    ctx.font = "normal normal " + H/1.2+ "px arial";
    ctx.fillStyle = "rgba(255, 255, 255, 255)";
    var tw = ctx.measureText(chr).width;
    ctx.rotate(0.01);
    ctx.fillText(chr, (W-tw)/2, H/1.2);
	
    var nodes = []
	var img = ctx.getImageData(0,0, W, H);
    var blr = ctx.createImageData(W,H);
    for (var i=1; i<W*H-W-1; i++) {
    	blr.data[i*4+3] = (img.data[ i   *4+3]+
                           img.data[(i+1)*4+3]+
                           img.data[(i-1)*4+3]+
                           img.data[(i+W)*4+3]+
                           img.data[(i-W)*4+3])/5
    }
    var i=0;
    
    while(i<cnt/2) {
    	var x = Math.random()*W|0;
        var y = Math.random()*H|0;
        var a = img.data[(x+y*W)*4+3];
        if(a>0) {
        	nodes[i] = new Node(x, y);
            nodes[i].id = i;
            i++;
        }
    }
    while(i<cnt) {
    	var x = Math.random()*W|0;
        var y = Math.random()*H|0;
        var a = blr.data[(x+y*W)*4+3];
        if(a>0 && a<255) {
        	nodes[i] = new Node(x, y);
            nodes[i].id = i;
            i++;
        }
    }
    return nodes;
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

generateParticles();
onClick();