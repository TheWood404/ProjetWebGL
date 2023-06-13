import * as THREE from 'three';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {dat} from './lib/dat.gui.min.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


var camera, renderer;
var windowScale;
window.scene = new THREE.Scene();
import {Coordinates} from './lib/Coordinates.js';

"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Field of view exercise
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, $*/

var camera, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var cylinder, sphere, cube;
var bevelRadius = 1.9;	// TODO: 2.0 causes some geometry bug.
var aspectRatio;
var eyeTargetScale;

//parametre du menu
function setupGui() {
    //effect pour le menu fov
	effectController = {
    };
    var gui = new dat.GUI();
    effectController.fov = 45;
    gui.add( effectController, "fov", 0, 180, 5 ).name("Field of View").onChange( function() {
        camera.fov = effectController.fov;
        camera.updateProjectionMatrix();
    }
    );

    

}

//initialisation de la caméra
function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0x808080, 1.0 );

	// CAMERA
	// aspect ratio of width of window divided by height of window
	aspectRatio = canvasWidth/canvasHeight;
	// OrthographicCamera( left, right, top, bottom, near, far )
	camera = new THREE.PerspectiveCamera( 45, aspectRatio, 10, 10000 );
	camera.position.set( -890, 600, -480 );

	// CONTROLS
	cameraControls = new OrbitControls(camera, renderer.domElement);
	cameraControls.target.set(0,335,0);

	var startdir = new THREE.Vector3();
	startdir.subVectors( camera.position, cameraControls.target );
	eyeTargetScale = Math.tan(camera.fov*(Math.PI/180)/2)*startdir.length();

}

//ajout de la scène
function fillScene() {
	window.scene = new THREE.Scene();

	// LIGHTS
	window.scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	window.scene.add( light );

	light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( -400, 200, -300 );

	window.scene.add( light );

	// some cubes
	
}

//carreau d'aide pour la grille
function drawHelpers() {
	Coordinates.drawGrid({size:1000,scale:0.01});
}

//ajout de la skybox
function createSkyBox() {
    scene.background = new THREE.CubeTextureLoader()
    .setPath( 'skybox/' )
    .load(['sunft.jpg','sunbk.jpg',
            'sunup.jpg','sundn.jpg',
            'sunrt.jpg','sunlf.jpg']);
    
}

var mtlLoader = new MTLLoader();
mtlLoader.load('textures/Desk_OBJ.mtl', function (materials) {
    materials.preload();
    
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/table.obj', function (object) {
        scene.add(object);
        object.scale.set(1, 1, 0.9);
        object.position.set(0, 200, -11);
    });
});

var loader = new OBJLoader();

//ajout de la nape

/* var textureLoader = new THREE.TextureLoader();
loader.load('objet/nape.obj', function (object) {
    // L'objet a été chargé avec succès
    // Vous pouvez ajouter l'objet à votre scène WebGL ici
    scene.add(object);

    // Mettre la table à l'échelle
    object.scale.set(90, 100, 90);

    // Mettre la nape sur la table à la bonne position
    object.position.set(265, 100, -37);
    //rotation de la nape 90°
    object.rotation.y = Math.PI / 2;

    // Charger la texture et l'appliquer à l'objet
    textureLoader.load('textures/nape.png', function (texture) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
        }
        });
     });

}); */

var mtlLoader = new MTLLoader();
mtlLoader.load('textures/nape.mtl', function (materials) {
    materials.preload();
    
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/nape.obj', function (object) {
        scene.add(object);
        object.scale.set(90, 100, 90);
        object.rotation.y = Math.PI / 2;

        object.position.set(265, 100, -37);
    });
});

/*
//ajout du bowl
loader.load('objet/bowl.obj', function (object) {
    // L'objet a été chargé avec succès
    // Vous pouvez ajouter l'objet à votre scène WebGL ici
    scene.add(object);

    // Mettre la table à l'échelle
    object.scale.set(20, 20, 20);

    // Mettre la nape sur la table à la bonne position
    object.position.set(20, 230, 10);
    //rotation de la nape 90°
    object.rotation.y = Math.PI / 2;

    // Charger la texture et l'appliquer à l'objet
     textureLoader.load('textures/osier.png', function (texture) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
           }
        });
    });

}); */

var fbxLoader = new FBXLoader();
fbxLoader.load('objet/bowl1_low.fbx', function (object) {
    scene.add(object);
    object.scale.set(4, 4, 4);
    object.position.set(20, 248, 10);
});


//ajout de la scène au DOM
function addToDOM() {
	var container = document.getElementById('webGL');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

//animation
function animate() {
	window.requestAnimationFrame(animate);
	render();
}

//rendu
function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.render(window.scene, camera);
}

//initialisation
try {
	init();
	fillScene();
	setupGui();
	drawHelpers();
	addToDOM();
	animate();
    createSkyBox();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#webGL').append(errorReport+e);
}


var container = document.createElement( 'div' );
document.body.appendChild( container );
container.appendChild( renderer.domElement );