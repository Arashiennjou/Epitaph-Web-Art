import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { model } from "./model.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const scene = new THREE.Scene();
let currentModel = model;
scene.add(currentModel);

const createGradientBackground = () => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgb(191, 79, 98)');
  gradient.addColorStop(1, 'rgb(227, 95, 24)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return new THREE.CanvasTexture(canvas);
};
scene.background = createGradientBackground();

// Load the image as a texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('image.png', (texture) => {
  const aspectRatio = texture.image.width / texture.image.height;
  const screenAspectRatio = window.innerWidth / window.innerHeight;
  
  let planeWidth, planeHeight;
  if (aspectRatio > screenAspectRatio) {
    planeWidth = window.innerWidth;
    planeHeight = window.innerWidth / aspectRatio;
  } else {
    planeHeight = window.innerHeight;
    planeWidth = window.innerHeight * aspectRatio;
  }

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(geometry, material);
  
  plane.position.z = -1000;  // Adjust the Z position to fit the screen
  scene.add(plane);
});

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(100, 60, 50);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-100, 60, -50);
scene.add(directionalLight, directionalLight2);
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const pinkLight = new THREE.PointLight(0xE06666, 2, 100);
pinkLight.position.set(5, 15, 40);
scene.add(pinkLight);

const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
camera.position.set(15, 40, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 500;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 5,
  color: 'white',
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

let mouseSpeed = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastMoveTime = Date.now();

document.addEventListener('mousemove', (event) => {
  const now = Date.now();
  const dx = event.clientX - lastMouseX;
  const dy = event.clientY - lastMouseY;
  const dt = now - lastMoveTime;

  mouseSpeed = Math.sqrt(dx * dx + dy * dy) / dt;

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  lastMoveTime = now;
});

const animateParticles = () => {
  const positions = particlesGeometry.attributes.position.array;
  const speed = 0.4 + mouseSpeed * 1;

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i + 1] -= speed;
    if (positions[i + 1] < -250) {
      positions[i + 1] = 250;
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;
};

let clickPosition = { x: 0, y: 0 };
let inputCount = 0;

document.addEventListener('click', function (event) {
  clickPosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener('keydown', function (event) {
  if (event.code === 'Space' && inputCount < 10) {
    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.style.position = 'absolute';
    inputBox.style.left = clickPosition.x + 'px';
    inputBox.style.top = clickPosition.y + 'px';
    inputBox.style.width = '300px';
    inputBox.style.background = 'rgba(255, 255, 255, 0.5)';
    inputBox.style.border = 'none';
    inputBox.style.padding = '5px';
    document.body.appendChild(inputBox);
    inputBox.focus();

    inputBox.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const textValue = inputBox.value;
        document.body.removeChild(inputBox);

        const text = document.createElement('div');
        text.style.position = 'absolute';
        text.style.color = '#fff';
        text.style.fontFamily = 'Sankofa Display';
        text.style.fontSize = '46px';
        text.style.left = clickPosition.x + 'px';
        text.style.top = clickPosition.y + 'px';
        text.style.transition = 'left 20s, top 20s';
        text.textContent = textValue;
        document.body.appendChild(text);

        const moveText = () => {
          text.style.left = Math.random() * window.innerWidth + 'px';
          text.style.top = Math.random() * window.innerHeight + 'px';
        };

        const interval = setInterval(moveText, 2000);

        text.addEventListener('mouseover', () => {
          clearInterval(interval);
          text.style.color = '#E34E2E';
          setTimeout(() => {
            disappearText(text);
          }, 1000);
        });

        inputCount++;
        if (inputCount === 10) {
          changeModelGradually();
        }
      }
    });
  }
});

function disappearText(element) {
  const words = element.textContent.split('');
  let index = 0;
  const interval = setInterval(() => {
    if (index < words.length) {
      element.textContent = words.slice(index).join('');
      index++;
    } else {
      clearInterval(interval);
      document.body.removeChild(element);
    }
  }, 500);
}

function changeModelGradually() {
  const loader = new GLTFLoader();
  loader.load(
    './model/import2.glb',
    function (gltf) {
      const newModel = gltf.scene;
      newModel.scale.set(11, 11, 11);  // Adjusted scale for the new model
      newModel.position.set(-25, -60, -10);
      newModel.rotation.y = 0.1;
      newModel.rotation.x = -0.2;
      newModel.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      });
      scene.add(newModel);
      scene.remove(currentModel);

      let opacity = 0;
      const transition = setInterval(() => {
        opacity += 0.01;
        if (opacity > 1) {
          opacity = 1;
          clearInterval(transition);
          currentModel = newModel;
        }

        newModel.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity = opacity;
          }
        });
      }, 30);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
      console.error('An error happened', error);
    }
  );
}

function render() {
  renderer.render(scene, camera);
  controls.update();
  animateParticles();
  requestAnimationFrame(render);
}

render();

document.getElementById('audio-control').addEventListener('click', () => {
  const audio = document.getElementById('background-audio');
  audio.play().catch((error) => {
    console.error('Failed to play audio:', error);
  });
});

// Load "13.glb" into four corners with increased size
const loader = new GLTFLoader();
loader.load('./model/13.glb', (gltf) => {
  const baseModel = gltf.scene;
  baseModel.scale.set(12, 12, 12);  // Adjusted scale to make the model bigger

  const cornerPositions = [
    { x: -50, y: 0, z: -50, rotationY: Math.PI / 2 }, // Bottom left
    { x: 50, y: 0, z: -50, rotationY: -Math.PI / 2 }, // Bottom right
    { x: -50, y: 0, z: 50, rotationY: Math.PI }, // Top left
    { x: 50, y: 0, z: 50, rotationY: 0 }, // Top right
  ];

  cornerPositions.forEach((pos) => {
    const cornerModel = baseModel.clone();
    cornerModel.position.set(pos.x, pos.y, pos.z);
    cornerModel.rotation.y = pos.rotationY;
    scene.add(cornerModel);
  });
});

