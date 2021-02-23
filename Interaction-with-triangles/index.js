// Generated by CoffeeScript 1.4.0
(function() {
  var Atom, H, R, Structure, W, a, camera, light1, light2, mat1, mat2, mouse, onDocumentMouseDown, onDocumentMouseMove, onDocumentMouseUp, projector, r, render, renderer, s, scene, structure,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  R = 1.0;

  r = R / 2.0;

  s = Math.sqrt(3.0);

  a = R * s;

  W = window.innerWidth;

  H = window.innerHeight;

  mat1 = new THREE.MeshPhongMaterial({
    color: 0x000000,
    ambient: 0x888888,
    specular: 0xffffff,
    shininess: 250,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });

  mat2 = new THREE.MeshPhongMaterial({
    color: 0xCC2244,
    ambient: 0x444444,
    specular: 0xffffff,
    shininess: 250,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, W / H, 0.000001, 1000);

  camera.position.y = 0;

  camera.position.z = 16;

  scene.add(new THREE.AmbientLight(0x444444));

  light1 = new THREE.DirectionalLight(0xFFCCAA, 1.5);

  light1.position.set(0, 15, 15);

  scene.add(light1);

  light2 = new THREE.DirectionalLight(0x4422CC, 1.5);

  light2.position.set(0, -15, 15);

  scene.add(light2);

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(W, H);

  projector = new THREE.Projector();

  mouse = new THREE.Vector3();

  document.body.appendChild(renderer.domElement);

  Atom = (function(_super) {

    __extends(Atom, _super);

    Atom.meshes = [];

    function Atom(i, j) {
      var d, mat;
      this.i = i;
      this.j = j;
      Atom.__super__.constructor.call(this);
      d = Math.abs((this.i + this.j + 1) % 2) * 2;
      this.position.x = this.i * a / 2.0;
      this.position.y = this.j * a / 2.0 * s + d * R / 4.0;
      this.position.x *= 1.1;
      this.position.y *= 1.1;
      this.geo = new THREE.Geometry();
      if (Math.abs((this.j + this.i + 1) % 2)) {
        this.geo.vertices.push(new THREE.Vector3(0, -R, 0));
        this.geo.vertices.push(new THREE.Vector3(a / 2, r, 0));
        this.geo.vertices.push(new THREE.Vector3(-a / 2, r, 0));
      } else {
        this.geo.vertices.push(new THREE.Vector3(0, R, 0));
        this.geo.vertices.push(new THREE.Vector3(-a / 2, -r, 0));
        this.geo.vertices.push(new THREE.Vector3(a / 2, -r, 0));
      }
      this.geo.faces.push(new THREE.Face3(0, 1, 2));
      this.geo.computeFaceNormals();
      this.geo.computeCentroids();
      this.geo.computeBoundingSphere();
      mat = this.i || this.j ? mat2 : mat1;
      Atom.meshes.push(this.mesh = new THREE.Mesh(this.geo, mat));
      this.mesh.atom = this;
      this.add(this.mesh);
    }

    Atom.prototype.animation = function() {
      this.rotation.y += Math.PI / 900 * this.position.x * Math.PI;
      return this.rotation.x += Math.PI / 700 * this.position.y * Math.PI;
    };

    return Atom;

  })(THREE.Object3D);

  Structure = (function(_super) {

    __extends(Structure, _super);

    function Structure() {
      var A, i, j, l, _i, _j, _ref;
      Structure.__super__.constructor.call(this);
      this.rotation.z = Math.PI;
      A = 2;
      for (j = _i = _ref = -A * 2; _ref <= A ? _i <= A : _i >= A; j = _ref <= A ? ++_i : --_i) {
        l = 2 * A + j;
        for (i = _j = -l; -l <= l ? _j <= l : _j >= l; i = -l <= l ? ++_j : --_j) {
          this.add(new Atom(i, j));
        }
      }
    }

    Structure.prototype.animation = function() {
      var atom, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        atom = _ref[_i];
        _results.push(atom.animation());
      }
      return _results;
    };

    return Structure;

  })(THREE.Object3D);

  onDocumentMouseDown = function(e) {
    var intersects, raycaster;
    e.preventDefault();
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    mouse.z = 0.5;
    projector.unprojectVector(mouse, camera);
    raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
    intersects = raycaster.intersectObjects(Atom.meshes);
    if (intersects.length > 0) {
      return intersects[0].object.material = mat1;
    }
  };

  onDocumentMouseUp = function(e) {
    return e.preventDefault();
  };

  onDocumentMouseMove = function(e) {
    var atom, intersects, raycaster, _i, _len, _ref;
    e.preventDefault();
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    mouse.z = 0.5;
    _ref = structure.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      atom = _ref[_i];
      atom.lookAt(mouse.clone().multiplyScalar(-15).setZ(20));
    }
    projector.unprojectVector(mouse, camera);
    raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
    intersects = raycaster.intersectObjects(Atom.meshes);
    if (intersects.length > 0) {
      return renderer.domElement.style.cursor = 'pointer';
    } else {
      return renderer.domElement.style.cursor = 'auto';
    }
  };

  render = function() {
    requestAnimationFrame(render);
    return renderer.render(scene, camera);
  };

  structure = new Structure;

  scene.add(structure);

  renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);

  renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

  renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

  render();

}).call(this);
