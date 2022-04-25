import './style.css'
import{OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {AnimationClip, Clock, VectorKeyframeTrack , AnimationMixer} from 'three';
import * as THREE from 'three';

/// SET UP
const clock = new Clock();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
  0.5, 1000);
console.log("Hello World");
camera.position.x = -10; 
camera.position.y = 20;
camera.position.z = 25;
var renderer = new THREE.WebGL1Renderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


document.querySelector("#speed").innerText = "Speed: " + document.getElementById("speedSlider").value;

document.querySelector("#size").innerText = "Size: " + document.getElementById("sizeSlider").value;



document.getElementById("speedSlider").oninput = () => 
  document.querySelector("#speed").innerText = "Speed: " + document.getElementById("speedSlider").value;


document.getElementById("sizeSlider").oninput = () => 
  document.querySelector("#size").innerText = "Size: " + document.getElementById("sizeSlider").value;


let message = "";
let count = 0;
document.querySelector("#textOut").innerText = message;

document.getElementById("sizeSlider").oninput = () => 
  document.querySelector("#size").innerText = "Size: " + document.getElementById("sizeSlider").value;



function addLine(string){
  message =  message + "\n" + string;
  document.querySelector("#textOut").innerText = message;
}

function clickFunctions(){
  message =  "Click & Drag: Adjust orientation\nRight Click & Drag: Move Array\nScroll: Zoom in/out";
  document.querySelector("#clickOptions").innerText = message;
}
clickFunctions();


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
const pivotColor = new THREE.MeshStandardMaterial({color: 0xFF0000})

var cube = [];
var xPositions = [];
var cubeHeights = [];
var arrayLength = document.getElementById("sizeSlider").value;


function randomize(){
  cubeHeights = [];
  xPositions = [];

  for (let i = 0; i < document.getElementById("sizeSlider").max; i++) {
    let h = Math.abs(3+Math.random()*10);
    cubeHeights.push(h);
    xPositions.push((i * 2));
  }
}
randomize();

for (let i = 0; i < arrayLength; i++) {
  let geometry = new THREE.BoxGeometry(1, cubeHeights[i], 1);
  cube[i] = new THREE.Mesh(geometry, basicMaterial);
  cube[i].position.x = xPositions[i];
  cube[i].position.y += cubeHeights[i]/2;
  scene.add(cube[i]);
}

/// CAMERA

const controls = new OrbitControls(camera, renderer.domElement);

camera.lookAt(cube[0]);

function cameraAnimate() {
  requestAnimationFrame(cameraAnimate);
  controls.update();
  renderer.render(scene, camera);
}

/// INIT RENDER
renderer.render(scene, camera);
cameraAnimate();


/// the swap animation using keyframes
function swap(cubes, index1, index2){
  var speed = document.getElementById("speedSlider").value;
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

/*
 * Compare cube but changes pivot color
*/
function compareCubesWithPivot(index1, pivot){
  changeColor(index1, brightMaterial);
  changeColor(pivot, pivotColor);
  return (cube[index1].geometry.parameters.height > cube[pivot].geometry.parameters.height);
}

function moveCubeRelativelyX(theCube, initPos, relMotion){
  var speed = document.getElementById("speedSlider").value;
  // let theCube = cube[cubeIndex]; 

  let times = [0, (speed * .3)];

  //Positions that the cubes will be at
  let cube1_values = [
    theCube.position.x, 
    theCube.position.y, 
    theCube.position.z, 

    xPositions[initPos+relMotion], 
    theCube.position.y,
    theCube.position.z, 
  ];

  // use len = -1 to automatically calculate the 
  // length from the array of tracks
  let len = -1;
  
  let positionKF = new VectorKeyframeTrack('.position', times, cube1_values);
  let tracks = [positionKF];
  let clip = new AnimationClip('slowmove_cube', len, tracks);
  let mixer = new AnimationMixer(theCube, THREE.InterpolateSmooth);
  let action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;
  action.enable =true;
  action.play();

  return mixer;
}

function moveCubeRelativelyZ(theCube, relMotion){
  var speed = document.getElementById("speedSlider").value;
  let times = [0, (speed * .3)];
  let currentPosZ = theCube.position.z;

  let cube1_values = [
    theCube.position.x, 
    theCube.position.y, 
    currentPosZ, 

    theCube.position.x, 
    theCube.position.y,
    currentPosZ+relMotion, 
  ];

  let len = -1;
  
  let positionKF = new VectorKeyframeTrack('.position', times, cube1_values);
  let tracks = [positionKF];
  let clip = new AnimationClip('slowmove_cube', len, tracks);
  let mixer = new AnimationMixer(theCube, THREE.InterpolateSmooth);
  let action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;
  action.enable =true;
  action.play();

  return mixer;
}

/**
 * Insertion sort. Not implemented correctly, should not be calling swap(),
 * separate animation needed
 * @param {} cube 
 * @param {*} n 
 */
 async function insertionSort(cube, n) {

  for (var i = 1; i < n; i++) {
    let current = cube[i];
    addLine("\ncurrent cube is cube["+i+"]");
    let j = i-1;
    var speed = document.getElementById("speedSlider").value;
    current.material = pivotColor;
    swapMixer1 = moveCubeRelativelyZ(current, 2);
    swapAnimation();
    cube[j].material = brightMaterial;
    await sleep(speed*450);
    if (cube[j].geometry.parameters.height < current.geometry.parameters.height){
      await sleep(speed*100);
      cube[j].material = basicMaterial;
    }

    while((j > -1) && (cube[j].geometry.parameters.height > current.geometry.parameters.height)){
      cube[j].material = brightMaterial;
      addLine("\ncube["+j+"] is larger than current cube");
      var speed = document.getElementById("speedSlider").value;
      swapMixer2 = moveCubeRelativelyX(current, j+1, -1);
      addLine("advance cube["+j+"]");
      await sleep(speed*450);

      swapMixer2 = moveCubeRelativelyX(cube[j],j, 1);
      cube[j+1] = cube[j];
      await sleep(speed*450);
      j--;
      cube[j+1].material = basicMaterial;
    }
    if (j > -1){
      cube[j].material = brightMaterial;
      await sleep(speed*200);
      cube[j].material = basicMaterial;
      addLine("\ncube["+j+"] is smaller than current cube");
      addLine("insert current cube at position " + (j+1).toString());
    }else{
      addLine("\ncurrent cube is at the last position");
      addLine("insert current cube at position 0");
    }

    cube[j+1] = current;
    var speed = document.getElementById("speedSlider").value;

    swapMixer1 = moveCubeRelativelyZ(current, -2);
    await sleep(speed*450);
    current.material = basicMaterial;
  }
  addLine("Array sorted.");
  woohooCubes(n);
}

/**
 * Bubble sort. Works correctly. Could use faster animation speed
 * @param {} cube 
 */
 async function bubbleSort(cube, n) {
  //displayBubbleAlgo();
  var i, j;
  for (i = 0; i < n - 1; i++) {
    for (j = 0; j < n - i - 1; j++) {
      var speed = document.getElementById("speedSlider").value;
      addLine("Comparing Cube[" + j + "] and Cube[" + (j + 1) + "]");
      if (compareCubes(j, j + 1)) {
        addLine("Cube[" + j + "] > " + "Cube[" + (j + 1) + "]");
        addLine("\nSwapping " + j + " and " + (j + 1) + "\n");
        swapMixers = swap(cube, j, j + 1);
        swapMixer1 = swapMixers[0];
        swapMixer2 = swapMixers[1];
        var speed = document.getElementById("speedSlider").value;

        swapAnimation();
        //Wait for animation to finish before executing more code
        await sleep(speed * 450);

        resetColors(j, j + 1);
      } else {
        await sleep(speed * 230);

        resetColors(j, j + 1);
      }
    }
  }
  addLine("Array sorted.");
  woohooCubes(n);
}

/*
 * quickSort
*/
async function quickSort(cube, index1, index2) {
  if(index1 < index2) {
    let partIndex = await partition(cube, index1, index2);
    
    //Recursive calls to each pivot half. Uses await to wait for the function to be done
    await quickSort(cube, index1, partIndex - 1);
    await quickSort(cube, partIndex + 1, index2)

  }
}

/*Quicksort partitioning
 *Curently using cube[N] as a pivot would be better if the pivot was median of cube[0], cube[N/2], cube[N]
 *for WC handling
*/
async function partition(cube, index1, index2) {
  let i = (index1 - 1);
  addLine("Picking cube[" + index2 + "] as the pivot\n");
  for(let j = index1; j <= index2 - 1; j++) {
    var speed = document.getElementById("speedSlider").value;
    if(!compareCubesWithPivot(j, index2)) {
      i++;

      addLine("cube[" + j + "] is less than cube[" + index2 + "]\nSwapping cube[" + i + "] and cube[" + j + "]\n");
      swapMixers = swap(cube, i, j);
      swapMixer1 = swapMixers[0];
      swapMixer2 = swapMixers[1];
      await sleep(speed*500);
      swapAnimation();
      resetColors(i, j);

    }
    resetColors(j, index2);

  }
  var speed = document.getElementById("speedSlider").value;
  await addLine("Swapping cube[" + ( i + 1 )+ "] with cube[" + index2 + "]\n");
  swapMixers = swap(cube, i + 1, index2);
  swapMixer1 = swapMixers[0];
  swapMixer2 = swapMixers[1];
  swapAnimation();
  await sleep(speed * 500);
  resetColors(i + 1, index2);

  return(i + 1);
}
///

/// UI

document.body.appendChild( renderer.domElement );
document.getElementById("randomizeButton").addEventListener('click', RandomizeOnClick );
document.getElementById("resetButton").addEventListener('click', resetOnClick );
document.getElementById("insertionSortButton").addEventListener(
  'click', insertionSortOnClick );
document.getElementById("bubbleSortButton").addEventListener(
  'click', bubbleSortOnClick );
document.getElementById("quickSortButton").addEventListener(
  'click', quickSortOnClick );
var rangeslider = document.getElementById("speedSlider");
var output = document.getElementById("demo");
output.innerHTML = rangeslider.value;

rangeslider.oninput = function() {
}
///

function reset(){
  message = "";
  addLine("");
  count = 0;

  arrayLength = document.getElementById("sizeSlider").value;

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

var swapMixers;
var swapMixer1 , swapMixer2;

function RandomizeOnClick() {
  randomize();
  reset();
}

function swapAnimation(){
  requestAnimationFrame(swapAnimation);
  let delta = clock.getDelta();
  if(swapMixer1 != null){
    swapMixer1.update(delta);
  }
  if(swapMixer2 != null){
    swapMixer2.update(delta);
  }
  renderer.render(scene, camera);
}

function insertionSortOnClick( event ) {
  insertionSort(cube, arrayLength);
}

function bubbleSortOnClick( event ) {
  bubbleSort(cube, arrayLength);
}

async function quickSortOnClick( event ) {
  await quickSort(cube, 0, arrayLength-1);
  addLine("Array sorted.");
  woohooCubes(arrayLength);
}

function resetOnClick(){
  reset();
}
///

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

/*
 *Function to change the color of one cube
 *
*/
function changeColor(index, materialChange) {
  cube[index].material = materialChange;
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
