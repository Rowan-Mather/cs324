import * as THREE from '../../three/build/three.module.js';

function main() {
  const canvas = document.getElementById( "gl-canvas" );

  const scene = new THREE.Scene();

  const fov = 75;
  const aspect = 1;  // the canvas default
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({canvas});

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshBasicMaterial({color: 0xFF0000});  
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  renderer.render(scene, camera);
}

main();