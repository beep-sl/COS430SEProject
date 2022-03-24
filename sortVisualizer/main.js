import './style.css'
import{ OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {AnimationClip, Clock,  NumberKeyframeTrack, VectorKeyframeTrack , AnimationMixer} from 'three';
import * as THREE from 'three';
import * as dat from 'dat.gui';


/// SET UP
const clock = new Clock();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
  0.5, 1000);
console.log("Hello World");
camera.position.x = 30; 
camera.position.y = 8;
camera.position.z = 45;

var renderer = new THREE.WebGL1Renderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

///  LIGHTS
const ambLight = new THREE.AmbientLight(0xFFFFFF, 1);

const pointlight1 = new THREE.PointLight(0x0000FF, 1.5);
pointlight1.position.set(7,15,5);

const pointlight2 = new THREE.PointLight(0xFF0000, 2);
pointlight2.position.set(30,15,-5);

scene.add(ambLight, pointlight1, pointlight2);

/// BOXES
const basicMaterial = new THREE.MeshStandardMaterial({color: 0x770070});
var brightMaterial = new THREE.MeshStandardMaterial({color: 0x1F0FFF});

var cube = [];
const xPositions = [];
const cubeHeights = [];
const arrayLength = 23;
for (let i = 0; i < arrayLength; i++) {

  let h = Math.abs(3+Math.random()*10)
  cubeHeights.push(h);
  let geometry = new THREE.BoxGeometry(1, h, 1);
  cube[i] = new THREE.Mesh(geometry, basicMaterial);

  xPositions.push((i * 2) - (arrayLength));
  cube[i].position.x = xPositions[i];
  cube[i].position.y += h/2;
  scene.add(cube[i]);
}



cube[5].material = brightMaterial;
cube[12].material = brightMaterial;

// TODO: COMPARE FUNCTION
// compare on cube[index].geometry.parameters.height;


/// the swap animation using keyframes
var mixers;
var mixer1 , mixer2;
function swap(cubes, index1, index2){
  
  let cube1 = cubes[index1]; 
  let kube2 = cubes[index2];
  let midway =  (cube1.position.x + kube2.position.x)/2; 
  let times = [0, 2, 4];

  //Positions that the cubes will be at
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
  
  // use len = -1 to automatically calculate the 
  // length from the array of tracks
  let len = -1;
  
  let cube1_positionKF = new VectorKeyframeTrack('.position', times, cube1_values);
  let cube1_tracks = [cube1_positionKF];
  let cube1_clip = new AnimationClip('slowmove_cube', len, cube1_tracks);
  let cube1_mixer = new AnimationMixer(cube1, THREE.InterpolateSmooth);
  let cube1_action = cube1_mixer.clipAction(cube1_clip);
  cube1_action.setLoop(THREE.LoopOnce);
  // cube1_action.clampWhenFinished = true;
  cube1_action.enable =true;
  cube1_action.play();

  let kube2_positionKF = new VectorKeyframeTrack('.position', times, kube2_values);
  let kube2_tracks = [kube2_positionKF];
  let kube2_clip = new AnimationClip('slowmove_kube', len, kube2_tracks);
  let kube2_mixer = new AnimationMixer(kube2, THREE.InterpolateSmooth);
  let kube2_action = kube2_mixer.clipAction(kube2_clip);
  kube2_action.setLoop(THREE.LoopOnce);
  // kube2_action.clampWhenFinished = true;
  kube2_action.enable =true;
  kube2_action.play();


  //swapping the index of the meshes within the mesh array
  cubes[index1] = kube2;
  cubes[index2] = cube1;


  return[cube1_mixer, kube2_mixer];
}
//////////



/// UI

document.body.appendChild( renderer.domElement );
document.getElementById("swapButton").addEventListener('click', swapOnClick );
document.getElementById("resetButton").addEventListener('click', resetOnClick );

///

function reset(){

  for (let i = scene.children.length - 1; i >= 0; i--) {
    if(scene.children[i].type === "Mesh")
        scene.remove(scene.children[i]);
}
for (let i = 0; i < arrayLength; i++) {

  let geometry = new THREE.BoxGeometry(1, cubeHeights[i], 1);
  cube[i] = new THREE.Mesh(geometry, basicMaterial);

  cube[i].position.x = xPositions[i];
  cube[i].position.y += cubeHeights[i]/2;
  scene.add(cube[i]);
}
renderer.render(scene, camera);

}

//ANIMATION

// function resetAnimation(mixes){
//   let delta2 = clock.getDelta();
//   for(var i = 0; i<mixes.length; i++){
//     requestAnimationFrame(resetAnimation);
//     mixes[i].update(delta2);
//     renderer.render(scene, camera);

//   }
// }

function resetOnClick(){
  reset();
}

function swapOnClick() {
  mixers = swap(cube, 5, 12);
  mixer1 = mixers[0];
  mixer2 = mixers[1];

  swapAnimation();
  mixer1.addEventListener('finished', (/*event*/)=>{mixer1.stopAllAction(); cube[12].position.x = xPositions[12];});
  mixer2.addEventListener('finished', (/*event*/)=>{mixer2.stopAllAction(); cube[5].position.x = xPositions[5];});
}

function swapAnimation(){
  requestAnimationFrame(swapAnimation);
  let delta = clock.getDelta();
  mixer1.update(delta);
  mixer2.update(delta);
  renderer.render(scene, camera);

}

function cameraAnimate() {
  requestAnimationFrame(cameraAnimate);
  controls.update();
  renderer.render(scene, camera);
}
///


renderer.render(scene, camera);
cameraAnimate();