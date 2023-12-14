//import * as THREE from '../Common/build/three.module.js';
import * as THREE from '../../three/build/three.module.js';

let camera, scene, renderer, canvas;

function main() {


    canvas = document.getElementById( "gl-canvas" );

    scene = new THREE.Scene();
  
    const fov = 75;
    const aspect = 1;  // the canvas default
    const near = 0.1;
    const far = 10;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  
    camera.position.z = 2;
  
    renderer = new THREE.WebGLRenderer({canvas});
    
    
  
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  
    const material = new THREE.MeshBasicMaterial({color: 0xFF0000});  
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  
    //callRenderer();
    renderer.render(scene, camera);
  
    
    window.addEventListener( 'resize', onWindowResize );
}



function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render(scene, camera);

}




main();

