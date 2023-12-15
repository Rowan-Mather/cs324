import * as THREE from '../Common/build/three.module.js';
import { TrackballControls } from '../Common/examples/jsm/controls/TrackballControls.js';

let camera0, camera1, controls, scene, renderer, canvas;

var camNo = 0;

function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    camera0 = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera0.position.z = -10;

    camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera1.position.x = -10;
    camera1.position.y = 8;
    camera1.position.z = -10;

    // world

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
    
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

   function makeInstance(geometry, color, x) {
     const material = new THREE.MeshPhongMaterial({color});

     const cube = new THREE.Mesh(geometry, material);
     scene.add(cube);

     cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44abc8,  0),
    makeInstance(new THREE.WireframeGeometry(geometry), 0x8244aa, -2),
    makeInstance(geometry, 0xFFF00,  2),
    makeInstance(new THREE.SphereGeometry(boxWidth/2), 0xB00B69, 4),
    makeInstance(new THREE.TorusKnotGeometry(boxWidth/4, boxWidth/10), 0x420A55, -4)
  ];
  
    

    // lights

    const dirLight = new THREE.DirectionalLight( 0x0000ff, 1.1 );
    dirLight.position.set( 5, -10, -5 );
    scene.add( dirLight );

    const dirLight2 = new THREE.DirectionalLight( 0xff0000, 10.1 );
    dirLight2.position.set( -3, 5, -10 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0xF22222, 2.0 );
    scene.add( ambientLight );

    // renderer

    renderer = new THREE.WebGLRenderer( {canvas} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );


    window.addEventListener( 'resize', onWindowResize );

    createControls( camera0 );
    controls.update();

    window.addEventListener('keydown', function(e) {
      if(e.key=='c') {
        camNo = 1-camNo; 
        if (camNo) createControls( camera1 );
        else createControls( camera0 );
        controls.update();
      }
    });

}

function createControls( camera ) {

    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 0.8;

    //     This array holds keycodes for controlling interactions.

// When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
// When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
// When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
// Default is KeyA, KeyS, KeyD which represents A, S, D.
    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];



}



function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    camera0.aspect = aspect;
    camera1.aspect = aspect;
    camera0.updateProjectionMatrix();
    camera1.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();
    controls.update();

}

function animate() {

    requestAnimationFrame( animate );

    controls.update();

    if (camNo) renderer.render( scene, camera1 );
    else renderer.render( scene, camera0 );

}


init();
animate();