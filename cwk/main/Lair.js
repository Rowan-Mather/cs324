/*
CS324 Coursework: Lair de la Lune
by Rowan Mather, 2100495
*/

import * as THREE from '../three/build/three.module.js';

import { PointerLockControls } from 
    '../three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 
    '../three/examples/jsm/loaders/GLTFLoader.js';

// Generic
let camera, lantern, scene, renderer, controls;

// Overlays
let blocker, centreblocker, menu, loading, success, failure, shoot;

// Scene Building
const scale = 8;
let rocks = [];
let dragonBreath = [];
let water;
let mixer; // Animation mixer
const clock = new THREE.Clock();

// Progress
let alive = true;
let level = 1;

// Controls
const speed = 10;
let moveForward = 0;
let moveBackward = 0;
let moveLeft = 0;
let moveRight = 0;
let prevTime = performance.now();
const velocity = new THREE.Vector3();

init();
createScene(1);
animateScene1();

// Creates blockers, renderer and resize listener
function init() {

    // Initialise blocker messages.
    blocker = document.getElementById( 'blocker' );
    centreblocker = document.getElementById( 'centreblocker' );
    menu = document.getElementById( 'menu' );
    success = document.getElementById( 'success' );
    loading = document.getElementById( 'loading' );
    failure = document.getElementById( 'failure' );
    shoot = document.getElementById( 'shoot' );
    blocker.style.display = 'block';
    centreblocker.style.display = 'block';
    menu.style.display = 'block';
    success.style.display = 'none';
    loading.style.display = 'none';
    failure.style.display = 'none';
    shoot.style.display = 'none';

    // Create renderer.
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );

}

// When the browser window is resized, update the rendered display.
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

// Initialises the pointer-lock controls to configure the camera and update the 
// direction globals when the relevant keys are pressed.
function initControls () {
    controls = new PointerLockControls( camera, renderer.domElement );

    document.addEventListener( 'click', function () {

        controls.lock();

        if (onTarget) {
            successScreen();
            controls.unlock();
        }
        else if (alive) {
            menu.style.display = 'none';
            blocker.style.display = 'none';
        }

    } );

    scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = 1;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = 1;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = 1;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = 1;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = 0;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = 0;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = 0;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = 0;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
}

// Show death message
function failureScreen() {
    console.log("Game over.");
    blocker.style.display = 'block';
    failure.style.display = 'block';
    loading.style.display = 'none';
    success.style.display = 'none';
    alive = false;
    onTarget = false;
    controls.unlock(); // Return pointer-lock
}

// Show loading message & wait
async function loadingScreen() {
    console.log("Completed level 1.");
    blocker.style.display = 'block';
    loading.style.display = 'block';
    failure.style.display = 'none';
    success.style.display = 'none';
    createScene(2); // Generate the second scene.
    velocity.x = 0;
    velocity.z = 0;
    await new Promise(r => setTimeout(r, 1500));
    blocker.style.display = 'none';
    loading.style.display = 'none';
    controls.lock(); // Ensure the pointer is locked.
}

// Show completion message
async function successScreen() {
    console.log("Completed level 2.");
    shoot.style.display = "none";
    blocker.style.display = 'block';
    success.style.display = 'block';
    failure.style.display = 'none';
    loading.style.display = 'none';
    alive = false;
    await new Promise(r => setTimeout(r, 500));
    controls.unlock(); // Return pointer lock
}

// Calls the relevant functions to initialise the camera, objects and lighting
// for the given scene number.
function createScene(l) {
    level = l;
    // Create scene with fog.
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );

    //Create camera with keyboard controls.
    camera = new THREE.PerspectiveCamera( 
        75, window.innerWidth / window.innerHeight, 1, 1000 );
    if (l == 1) {
        scene.fog = new THREE.Fog( 0x000000, 0, 50 );
        camera.position.y = scale/3;
        camera.position.z = -scale/2;
    }
    else {
        camera.position.y = scale/2;
        camera.position.z = -315;
        const _euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        _euler.setFromQuaternion( camera.quaternion );
        _euler.y = Math.PI;
        camera.quaternion.setFromEuler(_euler);
    }
    initControls();

    // Add all meshes. 
    buildWorld();

    // Add lighting.
    lightWorld();
}

// Adds all the lighting to each scene.
function lightWorld() {
    if (level == 1) {
        const ambLight = new THREE.AmbientLight( 0x808080, 0.5); // soft white light
        scene.add(ambLight);
        lantern = new THREE.PointLight(0xFFF5BF, 200, 40, 3);
        lantern.position.y = 4;
        lantern.position.z = -scale/2;
        scene.add(lantern);
    }
    else if (level == 2) {
        lantern = new THREE.PointLight(0xFFF5BF, 200, 40, 3);
        lantern.position.set([0,0,-scale*30]);
        scene.add(lantern);
        const topLight = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 0.5);
        scene.add(topLight);
        const dragonLight = new THREE.SpotLight(0xFFFFFF, 1000);
        dragonLight.position.y = 150;
        dragonLight.position.z = -80;
        scene.add(dragonLight);
        //THREE.SpotLight
    }
}

// Adds all the neccersary objects into the current scene and textures them.
function buildWorld() {

    // Shortcut to add a native THREE js mesh into the scene with a given colour
    // and position.
    function addMesh(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial({color});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        scene.add(mesh);
        return mesh;
    }

    // Reset obstacles
    rocks = [];

    if (level == 1) {
        // Model Loader
        const loader = new GLTFLoader();

        // Add borders
        addMesh(
            new THREE.BoxGeometry(scale*10.5,scale/4,scale/2), 
            0x7373A5, 0,0,scale/4);
        addMesh(
            new THREE.BoxGeometry(scale/2,scale/4,scale*40), 
            0x7373A5, -scale*5,0,-scale*20);
        addMesh(
            new THREE.BoxGeometry(scale/2,scale/4,scale*40), 
            0x7373A5, scale*5,0,-scale*20);

        // Add river with video water texture
        var watertexturevid = document.getElementById( 'watertexture' );
        var watertexture = new THREE.VideoTexture( watertexturevid );
        watertexture.rotation = Math.PI/2;
        watertexture.center = new THREE.Vector2(0.5, 0.5);
        watertexture.repeat.set(1, 0.4);
        const watermat = new THREE.MeshPhongMaterial( { map:watertexture } );
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(scale*10,scale/4,scale*40), watermat);
        floor.position.set(0,-scale/4,-scale*20);
        scene.add(floor);

        // Load cave model
        loader.load( '../models/cave1.glb', function ( gltf ) {
            gltf.scene.position.set(0,5,-185);
            gltf.scene.scale.set(10,7,10);
            gltf.scene.rotation.set(0,0,0);
            scene.add( gltf.scene );
        }, undefined, function ( error ) {
        console.error( error );
        });
        // Cave endpoint
        loader.load( '../models/endpoint.glb', function ( gltf ) {
            gltf.scene.position.set(0,12,-scale*40);
            gltf.scene.scale.set(18,18,18);
            gltf.scene.rotation.set(0,-Math.PI/2,0);
            scene.add( gltf.scene );
        }, undefined, function ( error ) {
        console.error( error );
        });

        // Add rock obstacles
        for (let i = 3; i < 28; i++) {
            let xpos = Math.floor(Math.random() * scale*9.6 - scale*4.8);
            let block1 = addMesh(
                new THREE.BoxGeometry(scale,scale/4,scale/2), 
                0x425E7D, xpos, 0,-i*(4/3)*scale);
            xpos = Math.floor(Math.random() * scale*9.6 - scale*4.8);
            let block2 = addMesh(
                new THREE.BoxGeometry(scale,scale/4,scale/2), 
                0x425E7D, xpos, 0,-i*(4/3)*scale);
            rocks.push(block1);
            rocks.push(block2);
        }
    }
    else if (level == 2) {

        // Model Loader
        const loader = new GLTFLoader();

        const _euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        _euler.x = -Math.PI/2;

        // Add floor with water texture
        const swirlTexture = 
            new THREE.TextureLoader().load('../textures/whirlpool.png');
        const swirlMat = new THREE.MeshPhongMaterial( { map:swirlTexture } );
        water = new THREE.Mesh(
            new THREE.BoxGeometry(scale*80,scale/4,scale*80), swirlMat);
        water.position.set(0,-scale/4,0);
        scene.add(water);

        // Add border
        let torus = addMesh(
            new THREE.TorusGeometry(scale*41,scale), 0x3A454D, 0,-scale/4,0);
        torus.quaternion.setFromEuler(_euler); // Rotate to be level

        // Pedestal
        //addMesh(new THREE.CylinderGeometry(80,80,40,8), 0xFFC107, 0,0,0);

        // Load dragon model and animation
        // Based on example here: https://www.youtube.com/watch?v=GByT8ActvDk
        loader.load('../models/dragonanimated.glb', function(gltf) {
            const model = gltf.scene;
            gltf.scene.position.set(0,70,0);
            gltf.scene.scale.set(30,30,35);
            scene.add(model);
            mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;

            clips.forEach(function(clip) {
                const action = mixer.clipAction(clip);
                action.play();
            });

        }, undefined, function(error) {
            console.error(error);
        });

        // Create dragon fire particles
        for (let i = 0; i < 200; i++) {
            let col = Math.random();
            if (col < 0.33) { col = 0x0000FF; }
            else if (col > 0.66) { col = 0x00AAFF; }
            else { col = 0x0055FF; }
            let particleMesh =
                addMesh(new THREE.PlaneGeometry(3,3), col, 0, 95, -150);
            particleMesh.rotation.x = (Math.random() - 0.5) * 2 * Math.PI;
            particleMesh.rotation.y = (Math.random() - 0.5) * 2 * Math.PI;
            particleMesh.rotation.z = (Math.random() - 0.5) * 2 * Math.PI;
            let particle = {
                mesh: particleMesh,
                life: Math.random()*100,
                sprayangle: 0
            };
            dragonBreath.push(particle);
        }

        // Load cave model
        loader.load( '../models/cave2.glb', function ( gltf ) {
            gltf.scene.position.set(0,0,0);
            gltf.scene.scale.set(380,380,380);
            gltf.scene.rotation.set(0,0,0);
            scene.add( gltf.scene );
        }, undefined, function ( error ) {
        console.error( error );
        });

        // Generate rocks
        for (let i = 100; i < 300; i+=5) {
            let ang = Math.random() * 2 * Math.PI; // Generate a random position
            let coords = positionRock(i, ang); // Convert polar to cartesian
            let rock = {
                mesh: addMesh(new THREE.DodecahedronGeometry(8,8,8),
                    0x3A454D, coords.x, coords.y, coords.z),
                angle: ang,
                radius: i
            };
            rocks.push(rock);
        }

        // Add target marker
        let marker1 = 
            addMesh(new THREE.RingGeometry(15,20), 0xFF0000, -100,-0.8,100);
        let marker2 = 
            addMesh(new THREE.RingGeometry(5,10), 0xFF0000, -100,-0.8,100);
        marker1.quaternion.setFromEuler(_euler);
        marker2.quaternion.setFromEuler(_euler);        
    }
}

// Updates the velocity global according to any movement input (denoted by the 
// corresponding direction's flag being enabled).
function inputVelocity(delta) {
    let speedTime = speed*delta;
    // Facing direction
    const _euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
    _euler.setFromQuaternion( camera.quaternion );
    let theta = _euler.y;

    // Calculate movement from forwards/backward & left/right input relative to
    // the camera direction
    let faceDir = moveBackward - moveForward;
    let sideDir = moveRight - moveLeft;
    let faceThet = (theta + 2*Math.PI) % (Math.PI * 2);
    let sideThet = (faceThet + Math.PI/2) % (Math.PI * 2);

    let xchange = faceDir * Math.sin(faceThet);
    let zchange = faceDir * Math.cos(faceThet);
    xchange += sideDir * Math.sin(sideThet);
    zchange += sideDir * Math.cos(sideThet);

    // Scale it to the movement speed
    zchange *= speedTime;
    xchange *= speedTime;
    // Apply the movement
    velocity.x += xchange;
    velocity.z += zchange;

    // Apply natural deceleration
    velocity.x -= velocity.x * Math.sqrt(speed) * delta;
    velocity.z -= velocity.z *  Math.sqrt(speed) * delta;
}

// Move the camera and accompanying lantern according to the velocity global.  
function moveBoat() {
    camera.position.x += velocity.x;
    camera.position.z += velocity.z;
    lantern.position.x += velocity.x;
    lantern.position.z += velocity.z;
}

// ------------ SCENE 1 MECHANICS ------------ //

let bounce = false;

// The main animation loop for the first level, controlling all movement and 
// object changes. 
function animateScene1() {

    // Breaks out of the animation loop at the end of the level.
    if (level == 2) {
        animateScene2();
        return;
    }

    requestAnimationFrame(animateScene1);

    const time = performance.now();

    if ( controls.isLocked === true && alive) {
        const delta = ( time - prevTime ) / 1000;

        // Checks for collisions.
        if (hittingRock()) failureScreen();
        // Check for wall bounce.
        if (!hittingBoundary()) {
            // Updates velocity by user input.
            inputVelocity(delta);
            // Constant water flow movement.
            camera.position.z -= speed/50;
            lantern.position.z -= speed/50;
        }
        moveBoat();

    }

    prevTime = time;

    renderer.render( scene, camera );

}

// Handles all cases where a player intersects with a boundary to the scene.
// They will 
//    1) bounce off the side walls 
//    2) die if they hit the far wall
//    3) proceed to level 2 if they enter the archway in the far wall
//    4) be stopped from backing out of the near wall behind them
function hittingBoundary() {
    let cx = Math.abs(camera.position.x);
    let cz = Math.abs(camera.position.z);
    const boundary = 4.8*scale;
    // Prevents the user from backing out of the scene.
    if (camera.position.z > -scale/2) {
        camera.position.z = -scale/2;
    }
    // At the far end, the user has the opportunity to progress to level 2.
    else if (cz > 39*scale) {
        if (cx < scale) loadingScreen(); // Loads level 2.
        else failureScreen(); // Hits far wall.
        return true;
    }
    // If the user has hit a side wall, they continue to rebound for a time.
    if (bounce) {
        let cx = Math.abs(camera.position.x);
        if (0 < cx && cx < scale*4.5) { 
            bounce = false;
        }
        return true;
    }
    // If the user is hitting a side wall, enable the bounce mechanic.
    if (Math.abs(camera.position.x) > boundary) {
        // Limit position
        camera.position.x = 
            Math.max(-boundary, Math.min(camera.position.x, boundary));
        // Wall bounce
        velocity.x /= -2;
        bounce = true;
        return true;
    }
    return false;
}

// Checks each obstacle for intersection with the player.
// Returns true if one is hit.
function hittingRock() {
    let cx = camera.position.x;
    let cz = camera.position.z;
    for (let i = 0; i < rocks.length; i++) {
        let xdist = Math.abs(rocks[i].position.x - cx);
        let zdist = Math.abs(rocks[i].position.z - cz);
        if (xdist < scale/2 && zdist < scale/4) {
            return true;
        }
    }
    return false;
}


// ------------ SCENE 2 MECHANICS ------------ //

let timer = 0;
let onTarget = false;
const maxLife = 90;

// The main animation loop for the second level, controlling all movement and 
// object changes. 
function animateScene2() {

    requestAnimationFrame(animateScene2);

    const time = performance.now();

    if ( controls.isLocked === true && alive) {

        const delta = ( time - prevTime ) / 1000;

        timer += delta;

        // Restrict position to within the torus around the base of the cave.
        if (Math.pow(camera.position.x, 2) +  Math.pow(camera.position.z, 2) 
                > Math.pow(325,2)) {
            if (camera.position.x > 0) camera.position.x -= 5;
            else camera.position.x += 5;
            if (camera.position.z > 0) camera.position.z -= 5;
            else camera.position.z += 5;           
        }

        // Update velocity global with user input.
        inputVelocity(delta);
        moveScene2Objects();
        hittingEvent();
        moveBoat();
    }

    prevTime = time;

    renderer.render( scene, camera );

}

// Updates the rocks, dragon and water positions.
function moveScene2Objects() {
    // Update dragon animation.
    if (mixer) {
        let d = clock.getDelta();
        // Dragon animation mixer.
        mixer.update(d);
        // Animation is 270 frames, played at 24fps.
        const animTime = 270/24;
        // Time progression through animation.
        let progression = mixer.time % animTime;
        // Calculates the rotation amount of the dragon head at this point.
        let angleProg = 
            Math.cos(progression/animTime * 2 * Math.PI) * Math.PI * 0.22;
        // Update dragon breath particles.
        for (let i = 0; i < dragonBreath.length; i++) {
            let life = dragonBreath[i].life - d*100;
            let dist = 140+(maxLife-life);
            dragonBreath[i].mesh.position.set(
                -dist * Math.cos(dragonBreath[i].sprayangle),
                life,
                -dist * Math.sin(dragonBreath[i].sprayangle)
            );
            // If the particle has fallen, reset it to the current position of 
            // the dragon head. 
            if (life < 0) { 
                life = maxLife;
                dragonBreath[i].sprayangle = 
                    angleProg + Math.PI/2 + (Math.random() - 0.5) * 0.4;
            }
            // Update particle life.
            dragonBreath[i].life = life;
        }
    }
    // Move rocks (does not need to be done every frame, for efficiency).
    if (timer > 0.02) {
        for (let i = 0; i < rocks.length; i++) {
            // Increments polar rotation angle.
            let newAngle = (rocks[i].angle += 0.01 ) % (2*Math.PI);
            let coords = positionRock(rocks[i].radius, newAngle);
            rocks[i].mesh.position.x = coords.x;
            rocks[i].mesh.position.z = coords.z;
            // For efficiency, checks for collisions here.
            let distanceSq = 
                Math.pow(camera.position.x - coords.x, 2) +
                Math.pow(camera.position.z - coords.z, 2);
            if (Math.sqrt(distanceSq) < 8) {
                failureScreen();
            }
        }
        // Updates water rotation.
        timer = 0;
        const _euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        _euler.setFromQuaternion( water.quaternion );
        _euler.y += 0.01;
        water.quaternion.setFromEuler(_euler);
    }
}

// Calculates the cartesian co-ordinates of a rock obstacle given its polar
// co-ordinates about the origin/dragon.
function positionRock(radius, angle) {
    let cartZ = radius * Math.cos(angle);
    let cartX = radius * Math.sin(angle);
    return new THREE.Vector3(cartX, 0, cartZ);
}

// Checks for a collisiion with an obstacle or target to be hovering over the 
// red target.
function hittingEvent() {
    if (timer != 0) {
        // Checks each rock obstacle for a collision.
        for (let i = 0; i < rocks.length; i++) {
            let pos = rocks[i].mesh.position;
            let distanceSq = 
                Math.pow(camera.position.x - pos.x, 2) +
                Math.pow(camera.position.z - pos.z, 2);
            if (Math.sqrt(distanceSq) < 8) {
                failureScreen();
                return;
            }
        }
    }

    // Checks the distance to the target.
    let distanceSq =
        Math.pow(camera.position.x + 100, 2) +
        Math.pow(camera.position.z - 100, 2);
    if (Math.sqrt(distanceSq) < 21) {
        // If hovering over the target, enable and auto-reorient the camera to
        // face the dragon.
        onTarget = true;
        shoot.style.display = 'block';
        const _euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        _euler.setFromQuaternion( camera.quaternion );
        _euler.x = 0.53;
        _euler.y = -0.70;
        camera.quaternion.setFromEuler(_euler);
    }
    else {
        shoot.style.display = 'none';
        onTarget = false;
    }
}

