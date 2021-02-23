// Generated by CoffeeScript 1.4.0
(function() {
  var Atom, H, MODE, MOUSEDOWN, PAUSED, R, Structure, W, a, camera, death, face1, face2, life, mat1, mat2, mat3, mat4, mat5, mats, mouse, nextMat, onDocumentMouseDown, onDocumentMouseMove, onDocumentMouseUp, projector, r, render, renderer, s, scene, structure,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  life = [3];

  death = [0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  R = 1.0;

  r = R / 2.0;

  s = Math.sqrt(3.0);

  a = R * s;

  W = window.innerWidth;

  H = window.innerHeight;

  MOUSEDOWN = false;

  PAUSED = false;

  MODE = "ON";

  nextMat = 0;

  mat1 = new THREE.MeshBasicMaterial({
    color: 0xDDDDDD
  });

  mat2 = new THREE.MeshBasicMaterial({
    color: 0xEE2244
  });

  mat3 = new THREE.MeshBasicMaterial({
    color: 0x88CC44
  });

  mat4 = new THREE.MeshBasicMaterial({
    color: 0x4488EE
  });

  mat5 = new THREE.MeshBasicMaterial({
    color: 0xEE8844
  });

  mats = [mat2, mat3, mat4, mat5];

  face1 = new THREE.Geometry();

  face1.vertices.push(new THREE.Vector3(0, R, 0));

  face1.vertices.push(new THREE.Vector3(-a / 2, -r, 0));

  face1.vertices.push(new THREE.Vector3(a / 2, -r, 0));

  face1.faces.push(new THREE.Face3(0, 1, 2));

  face1.computeFaceNormals();

  face2 = new THREE.Geometry();

  face2.vertices.push(new THREE.Vector3(0, -R, 0));

  face2.vertices.push(new THREE.Vector3(a / 2, r, 0));

  face2.vertices.push(new THREE.Vector3(-a / 2, r, 0));

  face2.faces.push(new THREE.Face3(0, 1, 2));

  face2.computeFaceNormals();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 1000);

  camera.position.y = 4;

  camera.position.z = 70;

  scene.add(new THREE.AmbientLight(0xFFFFFF));

  renderer = new THREE.CanvasRenderer();

  renderer.setSize(W, H);

  projector = new THREE.Projector();

  mouse = new THREE.Vector3();

  document.body.appendChild(renderer.domElement);

  Atom = (function(_super) {

    __extends(Atom, _super);

    Atom.meshes = [];

    function Atom(i, j) {
      var mat;
      this.i = i;
      this.j = j;
      this.setOff = __bind(this.setOff, this);

      this.setOn = __bind(this.setOn, this);

      this.toggle = __bind(this.toggle, this);

      Atom.__super__.constructor.call(this);
      this.d = Math.abs((this.i + this.j + 1) % 2);
      this.position.x = this.i * a / 2.0;
      this.position.y = this.j * a / 2.0 * s + this.d * R / 2.0;
      this.position.x *= 1.1;
      this.position.y *= 1.1;
      this.on = Math.random() > 0.5;
      mat = this.on ? mats[Math.random() * mats.length | 0] : mat1;
      this.face = Math.abs((this.j + this.i) % 2) ? face1 : face2;
      Atom.meshes.push(this.mesh = new THREE.Mesh(this.face, mat));
      this.mesh.atom = this;
      this.add(this.mesh);
    }

    Atom.prototype.toggle = function() {
      this.on = !this.on;
      return this.mesh.material = this.on ? mats[Math.random() * mats.length | 0] : mat1;
    };

    Atom.prototype.setOn = function() {
      this.on = true;
      return this.mesh.material = mats[nextMat];
    };

    Atom.prototype.setOff = function() {
      this.on = false;
      return this.mesh.material = mat1;
    };

    return Atom;

  })(THREE.Object3D);

  Structure = (function(_super) {

    __extends(Structure, _super);

    Structure.prototype.atoms = {};

    function Structure() {
      this.cellularCalcs = __bind(this.cellularCalcs, this);

      var A, atom, i, j, l, _i, _j, _ref;
      Structure.__super__.constructor.call(this);
      this.rotation.z = Math.PI;
      A = 4;
      for (j = _i = _ref = -A * 2; _ref <= A ? _i <= A : _i >= A; j = _ref <= A ? ++_i : --_i) {
        l = 2 * A + j;
        for (i = _j = -l; -l <= l ? _j <= l : _j >= l; i = -l <= l ? ++_j : --_j) {
          this.add(atom = new Atom(i, j));
          this.atoms["" + i + ":" + j] = atom;
        }
      }
    }

    Structure.prototype.cellularCalcs = function() {
      var i, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results;
      if (MOUSEDOWN || PAUSED) {
        return;
      }
      nextMat = (nextMat + 1) % mats.length;
      _ref = this.atoms;
      for (i in _ref) {
        a = _ref[i];
        a.c = 0;
        if (a.d) {
          a.c += ((_ref1 = this.atoms["" + (a.i - 1) + ":" + a.j]) != null ? _ref1.on : void 0) | 0;
          a.c += ((_ref2 = this.atoms["" + (a.i + 1) + ":" + a.j]) != null ? _ref2.on : void 0) | 0;
          a.c += ((_ref3 = this.atoms["" + a.i + ":" + (a.j + 1)]) != null ? _ref3.on : void 0) | 0;
          a.c += ((_ref4 = this.atoms["" + (a.i - 2) + ":" + (a.j + 1)]) != null ? _ref4.on : void 0) | 0;
          a.c += ((_ref5 = this.atoms["" + (a.i - 2) + ":" + a.j]) != null ? _ref5.on : void 0) | 0;
          a.c += ((_ref6 = this.atoms["" + (a.i - 1) + ":" + (a.j + 1)]) != null ? _ref6.on : void 0) | 0;
          a.c += ((_ref7 = this.atoms["" + (a.i + 2) + ":" + (a.j + 1)]) != null ? _ref7.on : void 0) | 0;
          a.c += ((_ref8 = this.atoms["" + (a.i + 2) + ":" + a.j]) != null ? _ref8.on : void 0) | 0;
          a.c += ((_ref9 = this.atoms["" + (a.i + 1) + ":" + (a.j + 1)]) != null ? _ref9.on : void 0) | 0;
          a.c += ((_ref10 = this.atoms["" + a.i + ":" + (a.j - 1)]) != null ? _ref10.on : void 0) | 0;
          a.c += ((_ref11 = this.atoms["" + (a.i - 1) + ":" + (a.j - 1)]) != null ? _ref11.on : void 0) | 0;
          a.c += ((_ref12 = this.atoms["" + (a.i + 1) + ":" + (a.j - 1)]) != null ? _ref12.on : void 0) | 0;
        } else {
          a.c += ((_ref13 = this.atoms["" + (a.i - 1) + ":" + a.j]) != null ? _ref13.on : void 0) | 0;
          a.c += ((_ref14 = this.atoms["" + (a.i + 1) + ":" + a.j]) != null ? _ref14.on : void 0) | 0;
          a.c += ((_ref15 = this.atoms["" + a.i + ":" + (a.j - 1)]) != null ? _ref15.on : void 0) | 0;
          a.c += ((_ref16 = this.atoms["" + (a.i - 2) + ":" + (a.j - 1)]) != null ? _ref16.on : void 0) | 0;
          a.c += ((_ref17 = this.atoms["" + (a.i - 2) + ":" + a.j]) != null ? _ref17.on : void 0) | 0;
          a.c += ((_ref18 = this.atoms["" + (a.i - 1) + ":" + (a.j - 1)]) != null ? _ref18.on : void 0) | 0;
          a.c += ((_ref19 = this.atoms["" + (a.i + 2) + ":" + (a.j - 1)]) != null ? _ref19.on : void 0) | 0;
          a.c += ((_ref20 = this.atoms["" + (a.i + 2) + ":" + a.j]) != null ? _ref20.on : void 0) | 0;
          a.c += ((_ref21 = this.atoms["" + (a.i + 1) + ":" + (a.j - 1)]) != null ? _ref21.on : void 0) | 0;
          a.c += ((_ref22 = this.atoms["" + a.i + ":" + (a.j + 1)]) != null ? _ref22.on : void 0) | 0;
          a.c += ((_ref23 = this.atoms["" + (a.i - 1) + ":" + (a.j + 1)]) != null ? _ref23.on : void 0) | 0;
          a.c += ((_ref24 = this.atoms["" + (a.i + 1) + ":" + (a.j + 1)]) != null ? _ref24.on : void 0) | 0;
        }
      }
      _ref25 = this.atoms;
      _results = [];
      for (i in _ref25) {
        a = _ref25[i];
        if (a.on && ~death.indexOf(a.c)) {
          a.setOff();
        }
        if (!a.on && ~life.indexOf(a.c)) {
          _results.push(a.setOn());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Structure;

  })(THREE.Object3D);

  onDocumentMouseDown = function(e) {
    var intersects, raycaster;
    e.preventDefault();
    MOUSEDOWN = true;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.z = 0.5;
    projector.unprojectVector(mouse, camera);
    console.log(mouse);
    raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
    intersects = raycaster.intersectObjects(Atom.meshes);
    if (intersects.length > 0) {
      if (intersects[0].object.atom.on) {
        intersects[0].object.atom.setOff();
        return MODE = "OFF";
      } else {
        intersects[0].object.atom.setOn();
        return MODE = "ON";
      }
    } else {
      MODE = "ON";
      return console.log(intersects[0].object.atom.c);
    }
  };

  onDocumentMouseUp = function(e) {
    e.preventDefault();
    return MOUSEDOWN = false;
  };

  onDocumentMouseMove = function(e) {
    var intersects, raycaster;
    e.preventDefault();
    if (MOUSEDOWN) {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
      mouse.z = 0.5;
      projector.unprojectVector(mouse, camera);
      raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
      intersects = raycaster.intersectObjects(Atom.meshes);
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        if (MODE === "ON") {
          return intersects[0].object.atom.setOn();
        } else {
          return intersects[0].object.atom.setOff();
        }
      } else {
        return renderer.domElement.style.cursor = 'auto';
      }
    }
  };

  window.readRules = function() {
    var c, d, i, l, _i, _j, _len, _len1;
    d = document.getElementById("death").children;
    i = 0;
    death = [];
    for (_i = 0, _len = d.length; _i < _len; _i++) {
      c = d[_i];
      if (c.checked) {
        death.push(i);
      }
      i++;
    }
    l = document.getElementById("life").children;
    i = 0;
    life = [];
    for (_j = 0, _len1 = l.length; _j < _len1; _j++) {
      c = l[_j];
      if (c.checked) {
        life.push(i);
      }
      i++;
    }
    console.log(life);
    return console.log(death);
  };

  window.clearCells = function() {
    var i, _ref, _results;
    _ref = structure.atoms;
    _results = [];
    for (i in _ref) {
      a = _ref[i];
      _results.push(a.setOff());
    }
    return _results;
  };

  window.fillCells = function() {
    var i, _ref, _results;
    _ref = structure.atoms;
    _results = [];
    for (i in _ref) {
      a = _ref[i];
      _results.push(a.setOn());
    }
    return _results;
  };

  window.randomFillCells = function() {
    var i, _ref, _results;
    _ref = structure.atoms;
    _results = [];
    for (i in _ref) {
      a = _ref[i];
      _results.push(Math.random() > 0.5 ? a.setOff() : a.setOn());
    }
    return _results;
  };

  window.pauseToggle = function(e) {
    PAUSED = !PAUSED;
    return document.getElementById("pause").value = PAUSED ? "play" : "pause";
  };

  window.save = function(e) {
    return window.open(renderer.domElement.toDataURL("image/png"));
  };

  window.selectRule = function(rule) {
    console.log(rule, eval(rule));
    life = rule[0];
    death = rule[1];
    return writeRules();
  };

  window.writeRules = function() {
    var c, d, i, l, _i, _j, _len, _len1, _results;
    console.log(life, death);
    d = document.getElementById("death").children;
    i = 0;
    for (_i = 0, _len = d.length; _i < _len; _i++) {
      c = d[_i];
      c.checked = ~death.indexOf(i++);
    }
    l = document.getElementById("life").children;
    i = 0;
    _results = [];
    for (_j = 0, _len1 = l.length; _j < _len1; _j++) {
      c = l[_j];
      _results.push(c.checked = ~life.indexOf(i++));
    }
    return _results;
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

  writeRules();

  setInterval(structure.cellularCalcs, 100);

  render();

}).call(this);