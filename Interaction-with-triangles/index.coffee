
R =   1.0
r = R/2.0
s = Math.sqrt 3.0
a = R*s

W = window.innerWidth
H = window.innerHeight

mat1 = new THREE.MeshPhongMaterial
        color       : 0x000000
        ambient     : 0x888888
        specular    : 0xffffff
        shininess   : 250
        side        : THREE.DoubleSide 
        vertexColors: THREE.VertexColors
        # shading     : THREE.FlatShading

mat2 = new THREE.MeshPhongMaterial
        color       : 0xCC2244
        ambient     : 0x444444
        specular    : 0xffffff
        shininess   : 250
        side        : THREE.DoubleSide 
        vertexColors: THREE.VertexColors
        # shading     : THREE.FlatShading

scene  = new THREE.Scene()
camera = new THREE.PerspectiveCamera 50, W/H, 0.000001, 1000
camera.position.y =  0
camera.position.z = 16

scene.add new THREE.AmbientLight 0x444444

light1 = new THREE.DirectionalLight 0xFFCCAA, 1.5
light1.position.set  0, 15, 15
scene.add light1

light2 = new THREE.DirectionalLight 0x4422CC, 1.5
light2.position.set 0,-15, 15
scene.add light2

renderer = new THREE.WebGLRenderer()
renderer.setSize W, H
# renderer.domElement.addEventListener 'mousemove', onDocumentMouseMove, false );
projector = new THREE.Projector()
mouse     = new THREE.Vector3()

document.body.appendChild renderer.domElement

class Atom extends THREE.Object3D

    @meshes:[]

    constructor: (@i, @j)->
        
        super()
        
        d = Math.abs((@i+@j+1)%2)*2
        @position.x = @i*a/2.0
        @position.y = @j*a/2.0*s + d*R/4.0

        # console.log @i, @j, @position.x, @position.y

        @position.x *= 1.1
        @position.y *= 1.1
        
        # console.log @i, @j, @x, @y/r

        @geo = new THREE.Geometry()

        if Math.abs((@j+@i+1)%2)
            @geo.vertices.push( new THREE.Vector3(    0, -R, 0 ) );
            @geo.vertices.push( new THREE.Vector3(  a/2,  r, 0 ) );
            @geo.vertices.push( new THREE.Vector3( -a/2,  r, 0 ) );

        else
            @geo.vertices.push( new THREE.Vector3(    0,  R, 0 ) );
            @geo.vertices.push( new THREE.Vector3( -a/2, -r, 0 ) );
            @geo.vertices.push( new THREE.Vector3(  a/2, -r, 0 ) );

        @geo.faces.push( new THREE.Face3( 0, 1, 2 ) );
        
        do @geo.computeFaceNormals
        do @geo.computeCentroids
        do @geo.computeBoundingSphere

        # @geo = new THREE.SphereGeometry(r/2.0, 0)

        mat = if @i||@j then mat2 else mat1
        # mat = mat2
        Atom.meshes.push @mesh = new THREE.Mesh @geo, mat
        @mesh.atom = @
        @add @mesh

    animation:->
        @rotation.y += Math.PI / 900 * @position.x * Math.PI
        @rotation.x += Math.PI / 700 * @position.y * Math.PI


class Structure extends THREE.Object3D

    constructor:()->
        
        super()        
        
        @rotation.z = Math.PI
        A = 2
        for j in [-A*2..A]
            l = 2*A+j
            for i in [-l..l]
                @add new Atom i, j

    animation:->
        
        do atom.animation for atom in @children

onDocumentMouseDown = (e) ->

    e.preventDefault();
    
    mouse.x =  ( e.clientX / W ) * 2 - 1
    mouse.y = -( e.clientY / H ) * 2 + 1
    mouse.z = 0.5
    
    projector.unprojectVector mouse, camera
    # console.log mouse

    raycaster  = new THREE.Raycaster camera.position, mouse.sub( camera.position ).normalize()
    intersects = raycaster.intersectObjects Atom.meshes


    if intersects.length > 0
        intersects[0].object.material = mat1;

onDocumentMouseUp = (e)->
    e.preventDefault();
    # controls.enabled = true
    # if INTERSECTED
    #     plane.position.copy( INTERSECTED.position );
    #     SELECTED = null;

    # container.style.cursor = 'auto';

onDocumentMouseMove = (e)->

    e.preventDefault();

    mouse.x =  ( e.clientX / W ) * 2 - 1
    mouse.y = -( e.clientY / H ) * 2 + 1
    mouse.z =  0.5

    atom.lookAt mouse.clone().multiplyScalar(-15).setZ(20) for atom in structure.children

    projector.unprojectVector mouse, camera
    # console.log mouse
    raycaster  = new THREE.Raycaster camera.position, mouse.sub( camera.position ).normalize()
    intersects = raycaster.intersectObjects Atom.meshes

    if intersects.length > 0
        renderer.domElement.style.cursor = 'pointer';
    else 
        renderer.domElement.style.cursor = 'auto';


render = ()->

    requestAnimationFrame render
    # do structure.animation
    renderer.render scene, camera

structure = new Structure 
scene.add structure

renderer.domElement.addEventListener 'mousemove', onDocumentMouseMove, false 
renderer.domElement.addEventListener 'mousedown', onDocumentMouseDown, false 
renderer.domElement.addEventListener 'mouseup'  , onDocumentMouseUp  , false

do render
