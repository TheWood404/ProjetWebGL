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

var mirrorCube, mirrorCam; // Mirroir

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 1024, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );


//parametre du menu
function setupGui() {
    // Paramètres du menu
    effectController = {
        fov: 45,
        opacity: 1.0,
        normalMapIntensity: 1.0,
        showGrid: true,
        enableShadows: true,
        showWireframe: false,
        showSprites: true // Option pour afficher ou masquer les sprites
    };

    var gui = new dat.GUI();

    // Option pour le champ de vision (FOV)
    gui.add(effectController, "fov", 0, 180, 5).name("Field of View").onChange(function() {
        camera.fov = effectController.fov;
        camera.updateProjectionMatrix();
    });
    
    // Option pour afficher ou masquer les sprites
    gui.add(effectController, "showSprites").name("Show Sprites").onChange(function(value) {
        // Afficher ou masquer les sprites ici
        toggleSpritesVisibility(value);
    });
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
    renderer.shadowMap.enabled = true;



	// CAMERA
	// aspect ratio of width of window divided by height of window
	aspectRatio = canvasWidth/canvasHeight;
	// OrthographicCamera( left, right, top, bottom, near, far )
	camera = new THREE.PerspectiveCamera( 45, aspectRatio, 10, 10000 );
	camera.position.set( 400, 300, 10 );
    //rotation sur la gauche de la caméra
    camera.rotation.y = Math.PI / 2;

	// CONTROLS
	cameraControls = new OrbitControls(camera, renderer.domElement);
	cameraControls.target.set(0,335,0);

	var startdir = new THREE.Vector3();
	startdir.subVectors( camera.position, cameraControls.target );
	eyeTargetScale = Math.tan(camera.fov*(Math.PI/180)/2)*startdir.length();

}

// Ajout de la scène
function fillScene() {
    window.scene = new THREE.Scene();

    // LIGHTS
    window.scene.add(new THREE.AmbientLight(0x222222));

    var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(200, 400, 500);

    // Ombre de la lumière
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    // Configuration de l'ombre
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 1500;
    light.shadow.camera.left = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;
    light.shadow.camera.bottom = -500;

    window.scene.add(light);

    light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(-400, 200, -300);

    window.scene.add(light);

    // Mirroir
    var cubeGeom = new THREE.BoxGeometry(1000, 300, 1);

    mirrorCam = new THREE.CubeCamera( 1, 1000, cubeRenderTarget   );
    mirrorCam.position.set(0, 300, 450);
    scene.add(mirrorCam);


    var mirrorCubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: cubeRenderTarget.texture } );
    mirrorCube = new THREE.Mesh( cubeGeom, mirrorCubeMaterial );
    mirrorCube.position.set(0, 300, 490);
    scene.add(mirrorCube);



    

}

function sprite(){
    var disk = new THREE.TextureLoader().load('textures/sprites.png');
    var material = new THREE.SpriteMaterial({ map: disk });
    material.color.setHSL(1, 1, 1)
    for (var i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            for (let k = 0; k < 8; k++) {
                var particles = new THREE.Sprite(material);
                var vertex = new THREE.Vector3();
                // accept the point only if it's in the sphere
                vertex.x = -1000 + Math.random() * 10 * 100 * k;
                vertex.y = -1000 + Math.random() * 10 * 100 * j;
                vertex.z = -1000 + Math.random() * 10 * 100 * i;
                particles.scale.set(35, 35, 35);
                particles.position.x = vertex.x;
                particles.position.y = vertex.y;
                particles.position.z = vertex.z;
                scene.add(particles);
            }
        }
    }
}

function toggleSpritesVisibility(visible) {
    // Parcourir tous les sprites et les rendre visibles ou invisibles selon la valeur passée en paramètre
    scene.traverse(function(child) {
        if (child instanceof THREE.Sprite) {
            child.visible = visible;
        }
    });
}

//ajout de la skybox
function createSkyBox() {
    scene.background = new THREE.CubeTextureLoader()
    .setPath( 'skybox/' )
    .load(['sunft.jpg','sunbk.jpg',
            'sunup.jpg','sundn.jpg',
            'sunrt.jpg','sunlf.jpg']);
    
}

//ajout d'un brouillard
function createFog() {
    scene.fog = new THREE.FogExp2(0x9db3b5, 0.0005);
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

        // Activer les ombres pour la table
        object.castShadow = true;
        object.receiveShadow = true;
    });
});


var loader = new OBJLoader();

var mtlLoader4 = new MTLLoader();
mtlLoader4.load('textures/nape.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/nape.obj', function (object) {
        object.scale.set(90, 100, 90);
        object.rotation.y = Math.PI / 2;

        object.position.set(265, 100, -37);

        // Ombre
        object.castShadow = true;
        object.receiveShadow = true;

        // Parcourir tous les enfants de l'objet et activer les ombres
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);
    });
});

//Bole de fruits

var mtlLoader3 = new MTLLoader();
mtlLoader3.load('textures/fruits.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/fruits2.obj', function (object) {
        object.scale.set(40, 40, 40);
        object.rotation.y = Math.PI / 2;
        object.position.set(-50, 230, 500);

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                // Appliquer les ombres sur les matériaux
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);
    });
});


var mtlLoader = new MTLLoader();
mtlLoader.load('textures/uploads_files_830301_water+glass.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/uploads_files_830301_water+glass.obj', function (object) {
        object.scale.set(10, 10, 10);
        object.rotation.y = Math.PI / 2;

        object.position.set(-100, 240, 50);

        // Ombre
        object.castShadow = true;
        object.receiveShadow = true;

        // Parcourir tous les enfants de l'objet et activer les ombres
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);
    });
});


//pinceau
var mtlLoaderp = new MTLLoader();
mtlLoaderp.load('textures/PaintBrush3.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/PaintBrush32.obj', function (object) {
        object.scale.set(10, 10, 10);
        object.rotation.y = 150;

        object.position.set(-70, 251, -40);

        // Ombre
        object.castShadow = true;
        object.receiveShadow = true;

        // Parcourir tous les enfants de l'objet et activer les ombres
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);
    });
});


function createGround() {
    var geometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var texture = new THREE.TextureLoader().load('textures/osier.png');
    var material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -10;

    // Activer les ombres pour le sol
    plane.receiveShadow = true;

    scene.add(plane);
}


function createWall(width, height, depth, texturePath) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var texture = new THREE.TextureLoader().load(texturePath);
    var material = new THREE.MeshPhongMaterial({ map: texture });
    var wall = new THREE.Mesh(geometry, material);

    // Activer les ombres pour le mur
    wall.castShadow = true;
    wall.receiveShadow = true;

    // Positionnement du mur par rapport au sol
    wall.position.y = height / 2;
    wall.position.z = -depth / 2;  // Décalage en arrière du sol
    wall.position.x = -width / 2;  // Décalage vers la gauche du sol
    // Pivoter le mur
    wall.rotation.y = Math.PI / 2;

    scene.add(wall);
}


function createRightWall(width, height, depth, texturePath) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var texture = new THREE.TextureLoader().load(texturePath);
    var material = new THREE.MeshPhongMaterial({ map: texture, transparent: true });
    var wall = new THREE.Mesh(geometry, material);

    // Activer les ombres pour le mur
    wall.castShadow = true;
    wall.receiveShadow = true;

    // Positionnement du mur à droite du sol
    wall.position.y = height / 2;
    wall.position.z = -depth / 2;
    wall.position.x = width / 2;  // Décalage vers la droite du sol
    // Pivoter le mur
    wall.rotation.y = Math.PI / 2;

    scene.add(wall);
}


function createFrontWall(width, height, depth, texturePath, xPos, yPos, zPos) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var texture = new THREE.TextureLoader().load(texturePath);
    var material = new THREE.MeshPhongMaterial({ map: texture });
    var wall = new THREE.Mesh(geometry, material);

    // Activer les ombres pour le mur
    wall.castShadow = true;
    wall.receiveShadow = true;

    // Positionnement du mur en face du sol
    wall.position.x = xPos;
    wall.position.y = yPos;
    wall.position.z = zPos;

    scene.add(wall);
}


//grappe de raisin
var mtlLoaderr = new MTLLoader();
mtlLoaderr.load('textures/Textures/10181_Grape-L2.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/raisins.obj', function (object) {


        // Parcourir tous les enfants de l'objet et appliquer la texture
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                var textureLoader = new THREE.TextureLoader();
                var texture = textureLoader.load('textures/Textures/Grapes_C.jpg');
                child.material = new THREE.MeshBasicMaterial({ map: texture });
            }

            object.scale.set(6, 6, 6);
            object.rotation.y = 20;
            object.position.set(30, 249, -50);
        });

        // Ombre
        object.castShadow = true;
        object.receiveShadow = true;

        scene.add(object);
    });
});


//grappe de raisin 2
//grappe de raisin
var mtlLoaderrr = new MTLLoader();
mtlLoaderrr.load('textures/Textures/10181_Grape-L2.mtl', function (materials) {
    materials.preload();

    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load('objet/raisins.obj', function (object) {
        object.scale.set(4, 4, 4);
        object.rotation.y = 150;
        object.position.set(-61, 249, -25);

        // Rotation 140
        object.rotation.y = -20;

        // Parcourir tous les enfants de l'objet et appliquer le matériau violet
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0x800080 });
            }
        });

        // Ombre
        object.castShadow = true;
        object.receiveShadow = true;

        scene.add(object);
    });
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
    mirrorCam.visible = false;
    mirrorCam.update( renderer, scene );
    mirrorCam.visible = true;

    var delta = clock.getDelta();
    cameraControls.update(delta);


    renderer.render(window.scene, camera);
}


//initialisation
try {
	init();
	fillScene();
	setupGui();
	addToDOM();
	animate();
    createSkyBox();
    createGround();
    createWall(1000, 500, 20, 'textures/texturemaison/brick.png');
    createRightWall(1000, 500, 20, 'textures/texturemaison/brickfenetre.png');
    createFrontWall(1000, 500, 20, 'textures/texturemaison/brick.png', 0, 250, 500);
    createFog();
    sprite();

} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#webGL').append(errorReport+e);
}


