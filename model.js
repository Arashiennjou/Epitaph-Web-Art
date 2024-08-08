import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const model = new THREE.Group(); // Create a group object for the model

// Instantiate a GLTFLoader
const loader = new GLTFLoader();
const percentDiv = document.getElementById('per'); // Get the progress bar element

// Load the GLTF model
loader.load(
  './model/import1.glb',
  (gltf) => {
    // Set the properties for the loaded model
    const scene = gltf.scene;
    scene.scale.set(11, 11, 11);
    scene.position.set(-25, -60, -10);
    scene.rotation.set(-0.2, 0.1, 0);
    model.add(scene);

    // Log the loaded model for debugging
    console.log(gltf);

    // Hide the progress container when loading is complete
    document.getElementById('container').style.display = 'none';
  },
  (xhr) => {
    // Calculate the loading progress
    const percent = xhr.loaded / xhr.total;

    // Update the progress bar
    percentDiv.style.width = `${percent * 400}px`;
    percentDiv.style.textIndent = `${percent * 400 + 5}px`;
    percentDiv.textContent = `${Math.floor(percent * 100)}%`;
  },
  (error) => {
    // Log any loading errors
    console.error('An error occurred while loading the model:', error);
  }
);

export { model };

