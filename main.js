import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const canvas = document.getElementById("exhibit");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let mixer;
const clock = new THREE.Clock();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 50, sizes.width / sizes.height, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableZoom = false;
controls.maxPolarAngle = Math.PI/2;
controls.minPolarAngle = 0;



if(sizes.width > 768 && sizes.width<=1024){
  camera.position.set(34.8011216018967, 1.3403481551151182, -27.410207467830208);
  controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
}
else if(sizes.width >1024){
  camera.position.set(34.30711458061296, 1.3063509263081632, -26.928494756992265);
  controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
}
else{
  //less than 768px
  camera.position.set(63.79559732284805, 3.9131083220825724, -61.34939235454817);
  controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
}


camera.updateProjectionMatrix();
controls.update();
const loader = new GLTFLoader();

const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)',5);
scene.add(ambientLight);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;


//document.body.appendChild( renderer.domElement );

let model;
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
loader.setDRACOLoader(dracoLoader);


loader.load('models/My Solar Car.glb', function(gltf){
  model = gltf.scene;
  gltf.scene.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach((material) => {
            if (material.map) {
                material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                material.map.needsUpdate = true;
            }
        });
    });

  scene.add(model);

  mixer = new THREE.AnimationMixer(model);

    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
      });
  }, undefined, function ( error ) {
    console.error( error );
},
function (xhr) {
  console.log((xhr.loaded / xhr.total * 100) + '% loaded');
},
  function (error) {
    console.error('Error loading model:', error);
  }
);
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  if(sizes.width > 768 && sizes.width<=1024){
    camera.position.set(34.8011216018967, 1.3403481551151182, -27.410207467830208);
    controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
  }
  else if(sizes.width >1024){
    camera.position.set(34.30711458061296, 1.3063509263081632, -26.928494756992265);
    controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
  }
  else{
    //less than 768px
    camera.position.set(63.79559732284805, 3.9131083220825724, -61.34939235454817);
    controls.target.set(3.4705135102586024, -0.8158030857812023, 3.140678462504593);
  }

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  controls.update();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("pointerup", () => {
    console.log("camera.position.set("+camera.position.x+", "+camera.position.y+", "+camera.position.z+");");
    console.log("controls.target.set("+controls.target.x+", "+controls.target.y+", "+controls.target.z+");");
});

function animate(time) {
  renderer.setAnimationLoop((time) => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  });
}
animate();