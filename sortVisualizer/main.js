import './style.css'
import{ OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {AnimationClip, Clock,  NumberKeyframeTrack, VectorKeyframeTrack , AnimationMixer} from 'three';
import * as THREE from 'three';

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

/// CAMERA

const controls = new OrbitControls(camera, renderer.domElement);

function cameraAnimate() {
  requestAnimationFrame(cameraAnimate);
  controls.update();
  renderer.render(scene, camera);
}

/// INIT RENDER
renderer.render(scene, camera);
cameraAnimate();





/// the swap animation using keyframes
var mixers;
var mixer1 , mixer2;
function swap(cubes, index1, index2){
  var speed = document.getElementById("sliderRange").value;
  let cube1 = cubes[index1]; 
  let kube2 = cubes[index2];

  //ADDED: Highlight cubes that are swapping
  // brightCubes(index1, index2);

  let midway =  (cube1.position.x + kube2.position.x)/2; 
  let zTravel = (cube1.position.x - kube2.position.x)/2;
  let times = [0, (speed * .15), (speed * .3)];

  //Positions that the cubes will be at
  let cube1_values = [
    cube1.position.x, 
    cube1.position.y, 
    cube1.position.z, 

    midway,
    cube1.position.y, 
    -zTravel,

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
    zTravel,

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
  //I uncommented this, I think its necessary to keep the cubes in place
   cube1_action.clampWhenFinished = true;
  cube1_action.enable =true;
  cube1_action.play();

  let kube2_positionKF = new VectorKeyframeTrack('.position', times, kube2_values);
  let kube2_tracks = [kube2_positionKF];
  let kube2_clip = new AnimationClip('slowmove_kube', len, kube2_tracks);
  let kube2_mixer = new AnimationMixer(kube2, THREE.InterpolateSmooth);
  let kube2_action = kube2_mixer.clipAction(kube2_clip);
  kube2_action.setLoop(THREE.LoopOnce);
  //I uncommented this, I think its necessary to keep the cubes in place
   kube2_action.clampWhenFinished = true;
  kube2_action.enable =true;
  kube2_action.play();

  //swapping the index of the meshes within the mesh array
  cubes[index1] = kube2;
  cubes[index2] = cube1;


  return[cube1_mixer, kube2_mixer];
}
//////////

/**
 * Sleep timer. Pass time in ms as parameter to set a delay for swap
 * functions to allow animations to finish before executing more code.
 * @param {*} time - time in ms
 * @returns - Promise
 */
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}


function compareCubes(index1, index2){
  brightCubes(index1, index2);
  return (cube[index1].geometry.parameters.height > cube[index2].geometry.parameters.height);
}



/**
 * Insertion sort. Not implemented correctly, should not be calling swap(),
 * separate animation needed
 * @param {} cube 
 * @param {*} n 
 */
async function insertionSort(cube) {
  var n = 23;
  for (var i = 1; i < n; i++) {
    var j = i-1;
    while ((j > 0) && (cube[i].geometry.parameters.height < cube[j].geometry.parameters.height)) {
      //Should just assign cube[j+1] = cube[i]
      mixers = swap(cube, j+1, j);
      mixer1 = mixers[0];s
      mixer2 = mixers[1];

      swapAnimation();
      //Wait for animation to finish
      await sleep(7000);
      j--;
    }
    //Should just assign cube[j+1] = cube[i]
    mixers = swap(cube, j+1, i);
    mixer1 = mixers[0];
    mixer2 = mixers[1];

    swapAnimation();
    //Wait for animation to finish
    await sleep(7000);
  }
}

/**
 * Bubble sort. Works correctly. Could use faster animation speed
 * @param {} cube 
 */
async function bubbleSort(cube) {
  var n = 23;
  
  var i, j;
  for (i = 0; i < n-1; i++) {
    for (j = 0; j < n-i-1; j++) {
      if (compareCubes(j,j+1)) {
        mixers = swap(cube, j, j+1);
        mixer1 = mixers[0];
        mixer2 = mixers[1];

        swapAnimation();
        //Wait for animation to finish before executing more code
        var speed = document.getElementById("sliderRange").value;
        await sleep(speed * 450);

        resetColors(j, j+1);
      }else{
        await sleep(speed * 230);

        resetColors(j, j+1);
      }
    }
  }
  woohooCubes(n);
}


/// UI

document.body.appendChild( renderer.domElement );
document.getElementById("swapButton").addEventListener('click', swapOnClick );
document.getElementById("resetButton").addEventListener('click', resetOnClick );
document.getElementById("insertionSortButton").addEventListener(
  'click', insertionSortOnClick );
document.getElementById("bubbleSortButton").addEventListener(
  'click', bubbleSortOnClick );
  var rangeslider = document.getElementById("sliderRange");
  var output = document.getElementById("demo");
  output.innerHTML = rangeslider.value;
  
  rangeslider.oninput = function() {
    //output.innerHTML = this.value;
  }
///

function reset(){

  for (let i = scene.children.length - 1; i >= 0; i--) {
    if(scene.children[i].type === "Mesh")
        scene.remove(scene.children[i]);
    // if(scene.children[i].type === "AnimationAction")
    //   scene.children[i].stop();
      
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

function resetOnClick(){
  reset();
}

function swapOnClick() {
  mixers = swap(cube, 5, 12);
  mixer1 = mixers[0];
  mixer2 = mixers[1];

  swapAnimation();
}

function insertionSortOnClick( event ) {
  insertionSort(cube, length);
}

function bubbleSortOnClick( event ) {
  bubbleSort(cube);
}

function swapAnimation(){
  requestAnimationFrame(swapAnimation);
  let delta = clock.getDelta();
  mixer1.update(delta);
  mixer2.update(delta);
  renderer.render(scene, camera);

}

/**
 * Function to change color of two cubes.
 * @param {} index1 
 * @param {*} index2 
 */
function brightCubes(index1, index2) {
  cube[index1].material = brightMaterial;
  cube[index2].material = brightMaterial;
  renderer.render(scene, camera);
}

/**
 * Function to reset colors of two cubes.
 * @param {} index1 
 * @param {*} index2 
 */
function resetColors(index1, index2) {
  cube[index1].material = basicMaterial;
  cube[index2].material = basicMaterial;
  renderer.render(scene, camera);
}

/**
 * Function to quickly highlight all cubes in an animation loop
 * @param {} n - length of array
 */
async function woohooCubes(n) {
  for (var i = 0; i < n; i++) {
    cube[i].material = brightMaterial;
    renderer.render(scene, camera);
    await sleep(50);
  }
}