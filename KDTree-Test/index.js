var cvs = document.getElementById('world');
var ctx = cvs.getContext('2d');
W = cvs.width  = window.innerWidth;
H = cvs.height = window.innerHeight;
var nodes, kdtree;
    
window.addEventListener('mousemove', onWindowMouseMove, false);


function onClick() {
    ctx.clearRect(0,0,W,H);
	generateTree();
    drawTree();
}

var Node = function(x,y) {
	this.x = x;
    this.y = y;
}

function generateTree() {
    nodes = generateNodes(W, H, 500);
    ctx.fillStyle="rgba(255,255,255,0.5)";
    for (var n in nodes) {    
        ctx.beginPath();
        ctx.arc(nodes[n].x, nodes[n].y, 3,0,Math.PI*2);
        ctx.closePath();
        ctx.fill();
    }
    
    kdtree = new datastructure.KDTree(nodes);
}

function drawTree() {
    
    for (var i=0; i<nodes.length; i++) {
        var cp = [];
        
        var nn = kdtree.getNearestNeighbours(nodes[i], 10, cp);
        /*
        ctx.strokeStyle="rgba(255,255,255,0.05)";
        for(var j=1; j<cp.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            //console.log(nn);
            
            ctx.lineTo(cp[j].x, cp[j].y);
            ctx.closePath();
            ctx.stroke();
        }*/
        ctx.strokeStyle="rgba(0,0,0,0.1)";
        for(var j=1; j<nn.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nn[j].x, nn[j].y);
            ctx.closePath();
            ctx.stroke();
        }
        
    }
}
function generateNodes(W, H, cnt) {
    
    var chars = "☼☀☉☁☂☔★☆✪♈♉♊♋♌♍♎♏♐♑♒♓☯☮♡❤✈♩♪♫♭▲△◎◯⌘あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをんゔ";
    
    var ctx = createContext(W, H);
    var chr = chars.charAt(Math.floor(Math.random()*chars.length));
    
    ctx.font = "normal normal " + H/1.2+ "px arial";
    ctx.fillStyle = "rgba(255, 255, 255, 255)";
    var tw = ctx.measureText(chr).width;
    ctx.rotate(0.01);
    ctx.fillText(chr,(W-tw)/2, H/1.2);
	
    var nodes = []
	var img = ctx.getImageData(0,0, W, H);
    var i=0;
    while(i<cnt) {
    	var x = Math.random()*W|0;
        var y = Math.random()*H|0;
        var a = img.data[(x+y*W)*4+3];
        if(a>0) {
        	nodes[i++] = new Node(x, y);
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

onClick();