import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 22);

// Importation de l'élément canvas
const canvas = document.getElementById('canvas');

// Création d'un WebGLRenderer et définir sa largeur et hauteur
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Création des contrôles
const controls = new OrbitControls(camera, canvas);

// Gestion de l'événement de redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

const textureLoader = new THREE.TextureLoader();

let textureEquirec = textureLoader.load('background7.jpeg');
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;

scene.background = textureEquirec;

// Chargement du modèle GLB de la bougie
const loaderbougie = new GLTFLoader();

let candle;

loaderbougie.load('candle.glb', function (gltf) {
    candle = gltf.scene;
    scene.add(candle);

    // Ajustements spécifiques à la taille et à la position du modèle
    candle.scale.set(0.05, 0.05, 0.05); // Ajustez l'échelle selon vos besoins
    candle.position.set(0, 0, 0); // Ajustez la position selon vos besoins

    console.log('Bougie générée');

    // Appeler la fonction après le chargement de la bougie
    onCandleLoaded();
}, undefined, function (error) {
    console.error(error);
});

let flame;
let mixer;

// Fonction appelée après le chargement de la bougie
function onCandleLoaded() {
    // Chargement du modèle GLB de la flamme
    const loader = new GLTFLoader();

    loader.load('flame.glb', (gltf) => {
        flame = gltf.scene;

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(flame);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        flame.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.4;
                child.material.color.set(0xFF00FF); // rose fluo 
            }
        });

        scene.add(flame);

        flame.scale.set(0.01, 0.01, 0.01);
        flame.position.set(0.1, 3.1, 0);

        console.log('Flamme générée');

        // Fonction d'animation
        const animate = () => {
            requestAnimationFrame(animate);

            // Mettre à jour l'animation du mixer
            if (mixer) {
                mixer.update(0.016);
            }

            controls.update();
            renderer.render(scene, camera);
        };

        // Lancer l'animation
        animate();
    }, undefined, (error) => {
        console.error(error);
    });
}

// Création d'une lumière ambiante 
const ambientLight = new THREE.AmbientLight(0xADD8E6, 10);
scene.add(ambientLight);

// Création d'une lumière directionnelle jaune
const yellowDirectionalLight = new THREE.DirectionalLight(0xFFA500, 80);
yellowDirectionalLight.position.set(-7, 3, -10);
scene.add(yellowDirectionalLight);

// // Création d'aides visuelles pour la représentation des lumières
// const yellowDirectionalLightHelper = new THREE.DirectionalLightHelper(yellowDirectionalLight);
// scene.add(yellowDirectionalLightHelper);

// Création de la boucle d'animation
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

// Appel de la fonction animate pour la première fois
animate();

// Création de la sphère verte avec texture de verre
const greenSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const greenSphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00FF00,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.8,
});
const greenSphere = new THREE.Mesh(greenSphereGeometry, greenSphereMaterial);
greenSphere.position.set(5, 5, -2.6); // Ajustez la position selon vos besoins
scene.add(greenSphere);

// Création de la sphère orange avec texture de verre
const orangeSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const orangeSphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFA500,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.8,
});
const orangeSphere = new THREE.Mesh(orangeSphereGeometry, orangeSphereMaterial);
orangeSphere.position.set(5, 3.5, -2.6); // Ajustez la position selon vos besoins
scene.add(orangeSphere);

// Création de la sphère rose avec texture de verre
const pinkSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const pinkSphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFF00FF,
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
    metalness: 0.8,
});
const pinkSphere = new THREE.Mesh(pinkSphereGeometry, pinkSphereMaterial);
pinkSphere.position.set(5, 2, -2.6); // Ajustez la position selon vos besoins
scene.add(pinkSphere);

// Création de la sphère bleue totalement transparente
const blueSphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
const blueSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 });
const blueSphere = new THREE.Mesh(blueSphereGeometry, blueSphereMaterial);
blueSphere.position.set(0.1, 3.3, 0);
scene.add(blueSphere);


// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Événement de clic pour les sphères
function onClick(event) {
    // Coordonnées de la souris
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Mettre à jour le rayon
    raycaster.setFromCamera(mouse, camera);

    // Vérifier les intersections
    const intersects = raycaster.intersectObjects([greenSphere, orangeSphere, pinkSphere, blueSphere], true);

    // Si l'objet est intersecté, faire quelque chose
    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object === greenSphere) {
            console.log('Sphère verte cliquée');
            // Changer la couleur de la flamme en vert fluo (0x00FF00) et l'opacité à 0.4
            changeFlameColor(0x00FF00);
            changeFlameOpacity(0.4);
        } else if (object === orangeSphere) {
            console.log('Sphère orange cliquée');
            // Changer la couleur de la flamme en orange fluo (0xFFA500) et l'opacité à 0.4
            changeFlameColor(0xFFA500);
            changeFlameOpacity(0.4);
        } else if (object === pinkSphere) {
            console.log('Sphère rose cliquée');
            // Changer la couleur de la flamme en rose fluo (0xFF00FF) et l'opacité à 0.4
            changeFlameColor(0xFF00FF);
            changeFlameOpacity(0.4);
        } else if (object === blueSphere) {
            console.log('Sphère bleue cliquée');
            // Changer l'opacité de la flamme à 0%
            changeFlameOpacity(0);
        }
    }
}

// Fonction pour changer la couleur de la flamme
function changeFlameColor(color) {
    if (flame) {
        flame.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(color);
                console.log(`Couleur de la flamme changée en ${color.toString(16)}`);
            }
        });
    }
    // Ajoutez votre logique de changement de couleur ou toute autre action ici
}

// Fonction pour changer l'opacité de la flamme
function changeFlameOpacity(opacity) {
    if (flame) {
        flame.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = opacity;
                console.log(`Opacité de la flamme changée à ${opacity}`);
            }
        });
    }
    // Ajoutez votre logique de changement d'opacité ou toute autre action ici
}

// Ajouter un écouteur d'événements de clic à la fenêtre
window.addEventListener('click', onClick);

