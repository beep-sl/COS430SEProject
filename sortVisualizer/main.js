import './style.css'
import{ OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {AnimationClip, Clock,  NumberKeyframeTrack, VectorKeyframeTrack , AnimationMixer} from 'three';
import * as THREE from 'three';
import * as dat from 'dat.gui';


/// set up
const clock = new Clock();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
  0.5, 1000);

camera.position.x = 30; 
camera.position.y = 8;
camera.position.z = 45;

var renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

///  LIGHTS
const ambLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambLight);
const pointlight1 = new THREE.PointLight(0x0000FF, 1.5);
pointlight1.position.set(7,15,5);

const pointlight2 = new THREE.PointLight(0xFF0000, 2);
pointlight2.position.set(30,15,-5);

scene.add(pointlight1, pointlight2);

/// BOXES
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshStandardMaterial({color: 0x770070});
var brightMaterial = new THREE.MeshStandardMaterial({color: 0x1F0FFF});

var cube = [];
var length = 23;
for (let i = 0; i < 23; i++) {

  let h = 3+Math.random()*10
  let geometry = new THREE.BoxGeometry(1, h, 1);
  cube[i] = new THREE.Mesh(geometry, material);
  cube[i].position.x = (i * 2) - (length);
  cube[i].position.y += Math.abs(h/2);
  scene.add(cube[i]);
}

cube[5].material = brightMaterial;

cube[12].material = brightMaterial;



///A basic animation using keyframes

var mixers;
var mixer1 , mixer2;


// COMPARE FUNCTION
// compare on cube[3].geometry.parameters.height;


// change to passing array and two indexes
function swap(cube1, kube2){
  //swap(cubes, index1, index2)
  let midway =  (cube1.position.x +  kube2.position.x)/2; 

  // cube1 = cubes[index1]; 
  // kube2 = cubes[index2];

  let times = [0, 2, 4];
  let cube1_values = [
    cube1.position.x, 
    cube1.position.y, 
    cube1.position.z, 

    midway,
    cube1.position.y, 
    -midway,

    kube2.position.x, 
    cube1.position.y,
    kube2.position.z,
  ];

  let kube2_values = [
    kube2.position.x, 
    kube2.position.y, 
    kube2.position.z, 

    midway,
    kube2.position.y, 
    midway,

    cube1.position.x, 
    kube2.position.y,
    cube1.position.z, 
  ];

  let cube1_positionKF = new VectorKeyframeTrack('.position', times, cube1_values);

  let kube2_positionKF = new VectorKeyframeTrack('.position', times, kube2_values);


  let tracks1 = [cube1_positionKF];

  let tracks2 = [kube2_positionKF];


  // use -1 to automatically calculate the length from the array of tracks
  let len = -1;

  let clip1 = new AnimationClip('slowmove_cube', len, tracks1);

  let clip2 = new AnimationClip('slowmove_kube', len, tracks2);


  let mixer1 = new AnimationMixer(cube1, THREE.InterpolateSmooth);

  let mixer2 = new AnimationMixer(kube2, THREE.InterpolateSmooth);

  let action1 = mixer1.clipAction(clip1);
  action1.setLoop(THREE.LoopOnce);
  action1.clampWhenFinished =true;
  action1.enable =true;

  let action2 = mixer2.clipAction(clip2);
  action2.setLoop(THREE.LoopOnce);
  action2.clampWhenFinished =true;
  action2.enable =true;

  action1.play();
  action2.play();

  return[mixer1, mixer2];
}


/// UI

document.body.appendChild( renderer.domElement );
document.getElementById("button").addEventListener(
   'click', onPointerDown );

function onPointerDown( event ) {
  mixers = swap(cube[5], cube[12]);
  mixer1 = mixers[0];
  mixer2 = mixers[1];
  animate();
}



//ANIMATION
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer1.update(delta);
  mixer2.update(delta);
  renderer.render(scene, camera);

}

///
renderer.render(scene, camera);

animate();