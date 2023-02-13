import styles from './style.css?inline'
import audioFile from './src/auquila-sublab.mp3';

import { Scene, SphereGeometry, AudioListener, Audio, AudioLoader, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, Mesh, Clock, AudioAnalyser } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import { spCode } from './sp-code.js';


let scene = new Scene();

let camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 1.2;

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( new Color(1, 1, 1), 0);
document.body.appendChild( renderer.domElement );

let clock = new Clock();

let button = document.querySelector('.button');
button.innerHTML = "Loading Audio..."

const listener = new AudioListener();
camera.add(listener);

// create an Audio source
const sound = new Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new AudioLoader();
audioLoader.load(audioFile, function(buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  button.innerHTML = 'Play audio';
  button.addEventListener('pointerdown', () => {
    button.style.display = 'none';
    sound.play();
  }, false);
});

const analyser = new AudioAnalyser(sound, 32);

let state = {
  time: 0.0,
  mouse : new Vector3(),
  currMouse : new Vector3(),
  pointerDown: 0.0,
  currPointerDown: 0.0,
  audio: 0.0,
  currAudio: 0.0,
}

// create our geometry and material
let geometry  = new SphereGeometry(2, 45, 45);
// let material = new MeshBasicMaterial( { color: 0x33aaee} );
// let mesh = new Mesh(geometry, material);

let mesh = createSculptureWithGeometry(geometry, spCode(), () => {
  return {
    time: state.time,
    mouse: state.mouse,
    pointerDown: state.pointerDown,
    audio: state.audio,
    _scale: 0.5
  }
});

scene.add(mesh);

window.addEventListener( 'pointermove', (event) => {
  state.currMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	state.currMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}, false );

window.addEventListener( 'pointerdown', (event) => state.currPointerDown = 1.0, false );
window.addEventListener( 'pointerup', (event) => state.currPointerDown = 0.0, false );

// Add mouse controlls
let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5
} );

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );


let render = () => {
  requestAnimationFrame( render );
  state.time += clock.getDelta();
  state.pointerDown = .1 * state.currPointerDown + .9 * state.pointerDown;
  state.mouse.lerp(state.currMouse, .05 );

  let analysis = analyser.getFrequencyData()[2] / 255.0;
  analysis = Math.pow(analysis * 0.8, 8);
  state.currAudio += analysis + clock.getDelta() * 0.5;
  state.audio = .2 * state.currAudio + .8 * state.audio;
  // console.log(analysis);

  controls.update();
  renderer.render( scene, camera );
};

render();