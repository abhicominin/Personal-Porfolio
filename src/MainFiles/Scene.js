import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import particlesVertexShader from '../Shaders/particles/vertex.glsl'
import particlesFragmentShader from '../Shaders/particles/fragment.glsl'


import * as oceanMaterials from "../Materials/OceanMaterial.js";
import * as Skybox from "../skyandocean/Skybox.js";
import * as Ocean from "../skyandocean/Ocean.js";

import GUI from 'lil-gui';
import gsap from 'gsap';



const canvas = document.querySelector(".webgl");
export const renderer = new WebGLRenderer({ 
    canvas,
    powerPreference: "high-performance",
    antialias: true,
})
export const cameraForward = new THREE.Vector3();
export const scene = new Scene();
export const camera = new PerspectiveCamera();

//const gui = new GUI({ width: 340 })
//const debugObject = {}


export function UpdateCameraRotation()
{
    cameraForward.copy(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
}

var controls;

var cyclist;
var balls;
var ballsring;
var island;

let particles = null;
let meshes = [];
let pointsmaterial;
let cycleCounter = 0; // Initialize the counter outside the Update function

// Initialize audio listener and sound variable
let listener;
let sound;

// For plane
var mixer2;
var action2;

// For balls
var mixer3;
var action3;


var clock;
let azimuthalAngle;
let popups;
let cyclePos = 0;
let i = 0;
let g = 0.8;
let scrollSpeed

let cursor = {
    x: 0,
    y: 0
}


export let resMult = 1;
export function SetResolution(value) {
    resMult = value;
    updateRendererSize();
}

export let fov = 70;
export function SetFOV(value) {
    fov = value;
    camera.fov = value;
    camera.updateProjectionMatrix();
}


export function Start() {
    updateRendererSize();

    // Loading manager
    const loadingManager = new THREE.LoadingManager(() => {
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.classList.add('fade-out');
      loadingScreen.addEventListener('transitionend', onTransitionEnd);
    });

    clock = new THREE.Clock(); 

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClearColor = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;

    camera.fov = fov;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 0.3;
    camera.far = 4000;
    camera.updateProjectionMatrix();
    camera.position.set(0, 50, 30);

    // Create an AudioListener and attach it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Create a global audio source
    const sound = new THREE.Audio(listener);

    // Expose the sound object globally
    window.threeSound = sound;

    // Load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/beckoning.mp3', function (buffer) {
     sound.setBuffer(buffer);
     sound.setLoop(true);
     sound.setVolume(0.09);
     // Initially, do not play the sound
    });

    UpdateCameraRotation();

    // Controls
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0,0,0);
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI/2.05 ;
    controls.maxPolarAngle = Math.PI/2.45;
    controls.minDistance = 16;
    controls.maxDistance = 30;
    controls.enableDamping = true;
    controls.rotateSpeed = 0.25;



   
    // Draco loader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/');

    // GLTF loader
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.setDRACOLoader(dracoLoader)

    // Models 
    
    // gltfLoader.load(
    //     '/models/try.glb', function(gltf){
    //         cyclist = gltf.scene;
    //         cyclist.scale.set(.25,.25,.25);
    //         cyclist.rotation.y = Math.PI/2
    //         cyclist.position.y = 1.0
        

    //         const material= new THREE.PointsMaterial({
    //           color: 'grey',
    //           size: 0.01,
    //           sizeAttenuation: false,
    //           vertexColors: true,
    //           blending: THREE.AdditiveBlending,
    //         });

    //          //Playing Animation
    //         mixer2 = new THREE.AnimationMixer( cyclist );
    //         action2 = mixer2.clipAction( gltf.animations[ 0 ] );
    //         action2.timeScale = 0;
    //         action2.play();
        
    //         const excludedObjects = new Set([
    //             "Object_69", "Object_61", "Object_65", "Object_59", "Object_66", 
    //             "Object_67", "Object_70", "Object_71", "Object_62", "Object_63", 
    //             "Object_58", "Object_23", "Object_40", "Object_49", "Object_55", 
    //             "Object_18", "Object_5", "Object_8", "Object_12"
    //         ]);
            
    //         gltf.scene.traverse((node) => {
    //             if (node.isMesh) {
    //                 node.castShadow = true;
    //                 node.receiveShadow = true;
    //                 if (!excludedObjects.has(node.name)) {   
    //                     node.material = pointsmaterial;
    //                 }
    //             }
    //         });
            
    //     //scene.add(cyclist);
    // });


    /**
    * Particles
    */
    

    // Add notepad code

    gltfLoader.load('/models/modelthree.glb', (gltf) =>
        {
            particles = {}
            particles.index = 0

        
            // Positions
            const positions = gltf.scene.children.map(child => child.geometry.attributes.position)
        
            particles.maxCount = 0
            for(const position of positions)
            {
                if(position.count > particles.maxCount)
                    particles.maxCount = position.count
            }
        
            particles.positions = []
            for(const position of positions)
            {
                const originalArray = position.array
                const newArray = new Float32Array(particles.maxCount * 3)
        
                for(let i = 0; i < particles.maxCount; i++)
                {
                    const i3 = i * 3
        
                    if(i3 < originalArray.length)
                    {
                        newArray[i3 + 0] = originalArray[i3 + 0]
                        newArray[i3 + 1] = originalArray[i3 + 1] + 6
                        newArray[i3 + 2] = originalArray[i3 + 2]
                    }
                    else
                    {
                        const randomIndex = Math.floor(position.count * Math.random()) * 3
                        newArray[i3 + 0] = originalArray[randomIndex + 0]
                        newArray[i3 + 1] = originalArray[randomIndex + 1] + 6
                        newArray[i3 + 2] = originalArray[randomIndex + 2]
                    }
                }
        
                particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))
            }
            
            // Geometry
            const sizesArray = new Float32Array(particles.maxCount)
        
            for(let i = 0; i < particles.maxCount; i++)
                sizesArray[i] = Math.random()
        
            particles.geometry = new THREE.BufferGeometry()
            particles.geometry.setAttribute('position', particles.positions[particles.index])
            particles.geometry.setAttribute('aPositionTarget', particles.positions[1])
            particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))
        
        
            // Material
            particles.colorA = '#ff7300'
            particles.colorB = '#0091ff'
        
            particles.material = new THREE.ShaderMaterial({
                vertexShader: particlesVertexShader,
                fragmentShader: particlesFragmentShader,
                uniforms:
                {
                    uTime: new THREE.Uniform(0),
                    uSize: new THREE.Uniform(0.17),
                    uResolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio())),
                    uProgress: new THREE.Uniform(0),
                    uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
                    uColorB: new THREE.Uniform(new THREE.Color(particles.colorB))
                },
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        
            // Points
            particles.points = new THREE.Points(particles.geometry, particles.material)
            particles.points.frustumCulled = false
            scene.add(particles.points)

            particles.index = particles.index + 1
            
        
            // Methods
            particles.morph = (index) =>
            {
                // Update attributes
                console.log(particles.index)
                console.log(index)

                particles.geometry.attributes.position = particles.positions[particles.index]
                particles.geometry.attributes.aPositionTarget = particles.positions[index]

                // Animate uProgress
                // gsap.fromTo(
                //     particles.material.uniforms.uProgress,
                //     { value: 0 },
                //     { value: 1, duration: 3, ease: 'linear' }
                // )
        
                // Save index
                particles.index = index
            }
        
            // Tweaks
            //gui.addColor(particles, 'colorA').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) })
            //gui.addColor(particles, 'colorB').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) })
            //gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.001).name('uProgress').listen()
        
            //particles.morph0 = () => { particles.morph(0) }
            //particles.morph1 = () => { particles.morph(1) }
            //particles.morph2 = () => { particles.morph(2) }
            //particles.morph3 = () => { particles.morph(3) }
        
            // gui.add(particles, 'morph0')
            // gui.add(particles, 'morph1')
            // gui.add(particles, 'morph2')
            // gui.add(particles, 'morph3')
    })

     

    // Getting the html element
    popups = document.getElementsByClassName("popup");
    console.log(popups)



    window.addEventListener('mousemove', (event) =>
    {
        if(cursor){
            cursor.x = event.clientX / window.innerWidth - 0.5
            cursor.y = - (event.clientY / window.innerHeight - 0.5)
        }    
    })
        
        
    scrollSpeed = ( function()
    {
        
    let lastPos, newPos, delta
          
    function clear() {
        lastPos = null;
        delta = 0;
    }
          
    clear();
            
    return function(){

        newPos = controls.getAzimuthalAngle();

        if ( lastPos != null ){ // && newPos < maxScroll 
        delta = newPos -  lastPos;
           }
        if (delta == 1 || delta == -1 ) delta = 0;
        if (delta < -1) { 
            delta = -delta; 
            }
        //else if (delta > 1) cyclist.rotation.z = 0;
        if ( action2 )  action2.timeScale = delta*160;
        //if ( action3 )  action3.timeScale = delta*160;
        
        lastPos = newPos;
        return delta;
            
        };

    })
    ();

    /**
    * Animate
    */
    window.onresize = updateRendererSize;

    Skybox.Start();
    scene.add(Skybox.skybox);

    Ocean.Start();
    scene.add(Ocean.surface);
    }

    // To know the precision of a decimal number
    function precision(a) {
        if (!isFinite(a)) return 0;
        var e = 1, p = 0;
        while (Math.round(a * e) / e !== a) { e *= 10; p++; }
        return p;
    }

    let thirdPopupVisible = false; // Track the visibility state of the third popup
    let lastCyclePosOnIncrement = 0; // Store the cyclePos at the moment of increment
    let prevCyclePos = null; // Track the previous cycle position
    let scrollDirection = null; // Track the scroll direction ('forward' or 'backward')
    let prevThirdPopupVisible = false; // Track the previous visibility state of the third popup
    
    export function Update() {
      Skybox.Update();
      Ocean.Update();
      controls.update();
    
      // Update cyclist position
      azimuthalAngle = controls.getAzimuthalAngle();
      cyclePos = azimuthalAngle / (Math.PI * 2);
      if (cyclePos < 0) {
        cyclePos = 0.5 + (0.5 + cyclePos);
      }
    
      if (cyclist) {
        cyclist.position.x = Math.sin(azimuthalAngle) * 25.9;
        cyclist.position.z = Math.cos(azimuthalAngle) * 25.9;
        cyclist.rotation.y = azimuthalAngle;
      }


      // Check scroll direction
      if (prevCyclePos !== null) {
        if (cyclePos.toFixed(2) > prevCyclePos) {
          scrollDirection = "forward";
        } else if (cyclePos.toFixed(2) < prevCyclePos) {
          scrollDirection = "backward";
        }
      }
    
      // Update prevCyclePos
      prevCyclePos = cyclePos.toFixed(2);
    
      const visibilityDuration = 0.24; // Set duration for visibility (same for all popups)
      const startOffsets = [0.05, 0.4, 0.76]; // Starting points for each popup
    
      for (let i = 0; i < popups.length; i++) {
        const start = startOffsets[i]; // Starting point for the current popup
        const end = start + visibilityDuration; // End point based on duration
    
        if (cyclePos >= start && cyclePos < end) {
          popups[i].classList.remove("hidden");
          popups[i].classList.add("visible");
    
          // Update the third popup visibility state
          if (i === 2) {
            prevThirdPopupVisible = thirdPopupVisible;
            thirdPopupVisible = true;
          }
        } else {
          popups[i].classList.add("hidden");
          popups[i].classList.remove("visible");
    
          // Check if the third popup transitions from visible to hidden
          if (i === 2) {
            prevThirdPopupVisible = thirdPopupVisible;
            thirdPopupVisible = false;
    
            // Execute logic only when transitioning from visible to hidden
            if (prevThirdPopupVisible && !thirdPopupVisible) {
              cycleCounter++; // Increment the counter
    
              lastCyclePosOnIncrement = cyclePos.toFixed(2); // Save the exact value
    
              // Reset cycleCounter if it surpasses 3
              if (cycleCounter > 3) {
                cycleCounter = 0;
              }

              // check both 3 3 passing case
              
              
    
              // Access scrollDirection near particles.morph()
              console.log(cyclePos.toFixed(2))
              if(cyclePos.toFixed(2) != 0.75 && cyclePos.toFixed(2) != 0.76 && cyclePos.toFixed(2) != 0.74 ){
              particles.morph((cycleCounter + 1) % 4);
            
              }
            }
          }
        }
      }
    
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (mixer2) mixer2.update(delta);
    
      if (particles && particles.material) {
        particles.material.uniforms.uProgress.value = cyclePos;
      }

      if (particles && particles.material) {
        particles.material.uniforms.uTime.value = elapsed;
      }
    
      scrollSpeed();
    
      renderer.render(scene, camera);
    }
    



function updateRendererSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = window.innerWidth * resMult * pixelRatio;
    const height = window.innerHeight * resMult * pixelRatio;

    // Materials
    if(particles)
    particles.material.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio)

    renderer.setSize(width, height, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Preloader screen
function onTransitionEnd( event ) {
	event.target.remove();
}
