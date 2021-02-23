var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    
    stats,
    container,
    
    particle,
    
    camera,
    scene,
    renderer,
    
    mouseX = 0,
    mouseY = 0,
    
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2;


init();
setInterval(loop, 1000 / 60);

function init() {
  
  container = document.createElement('div');
  document.body.appendChild(container);
  
  camera = new THREE.Camera(0, 0, 1000);
  camera.focus = 200;
  
  scene = new THREE.Scene();
  
  renderer = new THREE.CanvasRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  
  for (var i = 0; i < 1000; i++) {
    
    particle = new THREE.Particle(new THREE.ColorFillMaterial(Math.random() * 0x808008 + 0x808080, 1));
    particle.size = Math.random() * 10 + 5;
    particle.position.x = Math.random() * 2000 - 1000;
    particle.position.y = Math.random() * 2000 - 1000;
    particle.position.z = Math.random() * 2000 - 1000;
    scene.add(particle);
  }
  
  container.appendChild(renderer.domElement);
  
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild(stats.domElement);
  
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
}

//

function onDocumentMouseMove(event) {
  
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  
  if(event.touches.length == 1) {
    
    event.preventDefault();
    
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  
  if(event.touches.length == 1) {
    
    event.preventDefault();
    
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

//

function loop() {
  
  camera.position.x += (mouseX - camera.position.x) * .05;
  camera.position.y += (-mouseY - camera.position.y) * .05;
  
  renderer.render(scene, camera);
  
  stats.update();
}