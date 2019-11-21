import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import Stats from 'three/examples/jsm/libs/stats.module';
import getAnalyser from '../audio/getAnalyser';

const glsl = require('glslify');

export const CanvasGL = () => {
	useEffect(() => {
		const config = {
			octahedron: {
				size: 1.3,
				detail: 4,
				position: {
					x: -0.3,
					y: -0.8,
					z: 0,
				},
			},
			camera: {
				x: 0,
				y: 0,
				z: 3.8,
			},
			debug: false,
		};

		let scene, //THREE.Scene
			camera, //THREE.PerspectiveCamera
			renderer, //THREE.WebGLRenderer
			container, //HTMLElement | null
			geometry, //THREE.TetrahedronBufferGeometry
			uniforms, //object
			material, //THREE.Material,
			octahedron, //THREE.Mesh | THREE.Object3D | any,
			vertexShader, //string
			fragmentShader, //string
			vertexDisplacement, //Float32Array
			frameCounter = 0, //number
			controls, //OrbitControls
			stats, //any
			delta = 0, //number
			microphoneDataArray, //Uint8Array
			microphoneAnalyser, //AnalyserNode
			microphroneFrequencySum = 0, //number
			microphoneFrequencyAverage = 0; //number

		const init = () => {
			//Sound
			getAnalyser().then(analyser => {
				microphoneAnalyser = analyser;
				microphoneDataArray = new Uint8Array(microphoneAnalyser.fftSize);
			});

			//Three
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor('#000');

			//Canvas
			container = document.getElementById('gl-container');
			if (container) container.appendChild(renderer.domElement);

			//Shaders
			vertexShader = glsl(`
				attribute float vertexDisplacement;
				uniform float delta;
				uniform float frequencyAverage;
				varying float vOpacity;
				varying vec3 vPos;
		
				void main()
				{
					vPos = position;
					vOpacity = vertexDisplacement;
		
					vec3 p = position;
		
					p.x += sin(vertexDisplacement + delta / 2.0);
					p.y += cos(vertexDisplacement + delta / 2.0);

					vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
					gl_Position = projectionMatrix * modelViewPosition;
				}
			`);

			fragmentShader = glsl(`
				uniform float delta;
				varying float vOpacity;
				varying vec3 vPos;
		
				void main() {
		
					float r = 0.0 + cos(vPos.x * delta); //0.976
					float g = 1.0; //0.835
					float b = 0.525; //0.525
					vec3 rgb = vec3(r, g, b);
		
					gl_FragColor = vec4(rgb, vOpacity);
				}
			`);
		};

		const addOctahedron = () => {
			geometry = new THREE.OctahedronBufferGeometry(config.octahedron.size, config.octahedron.detail);
			uniforms = {
				delta: { value: 0 },
				frequencyAverage: { value: microphoneFrequencyAverage },
			};
			material = new THREE.ShaderMaterial({
				uniforms: uniforms,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
			});
			octahedron = new THREE.Mesh(geometry, material);

			octahedron.position.x = config.octahedron.position.x;
			octahedron.position.y = config.octahedron.position.y;
			octahedron.position.z = config.octahedron.position.z;

			scene.add(octahedron);
		};

		const addControls = () => {
			controls = new OrbitControls(camera, renderer.domElement);
			controls.autoRotate = true;
			controls.autoRotateSpeed = 1.8;
			controls.enableDamping = true;
			controls.enablePan = false;
			controls.enableZoom = false;
			controls.minPolarAngle = 1;
			controls.maxPolarAngle = 1;
			controls.rotateSpeed = 0.1;
		};

		const addGridHelper = () => {
			const size = 20;
			const divisions = 20;

			const gridHelper = new THREE.GridHelper(size, divisions);
			scene.add(gridHelper);
		};

		const addGUI = () => {
			const gui = new GUI();

			// const options = {
			// 	reset: () => {},
			// };

			let cam = gui.addFolder('Camera');
			cam.add(camera.position, 'x', 0, 100).listen();
			cam.add(camera.position, 'y', 0, 100).listen();
			cam.add(camera.position, 'z', 0, 100).listen();
			cam.open();

			let octa = gui.addFolder('Octahedron');
			octa.add(octahedron.position, 'x', -100, 100).listen();
			octa.add(octahedron.position, 'y', -100, 100).listen();
			octa.add(octahedron.position, 'z', -100, 100).listen();
			octa.open();

			// gui.add(options, 'reset');
		};

		const addStats = () => {
			stats = new Stats();
			if (container) container.appendChild(stats.dom);
		};

		const setControls = () => {
			controls.autoRotate = false;
			controls.enablePan = true;
			controls.enableZoom = true;
			controls.minPolarAngle = -2 * Math.PI;
			controls.maxPolarAngle = 2 * Math.PI;
			document.getElementById('gl-container').style.zIndex = 3;
		};
		const setOctahedron = () => {
			vertexDisplacement = new Float32Array(geometry.attributes.position.count);
			for (let i = 0; i < vertexDisplacement.length; i++) {
				vertexDisplacement[i] = Math.sin(i);
			}
			geometry.setAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));
		};

		const setCamera = () => {
			camera.position.x = config.camera.x;
			camera.position.y = config.camera.y;
			camera.position.z = config.camera.z;
		};

		const setEvents = () => {
			const handleWindowResize = () => {
				renderer.setSize(window.innerWidth, window.innerHeight);
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			};

			window.addEventListener('resize', handleWindowResize);
		};

		const animate = () => {
			if (microphoneAnalyser && microphoneDataArray) delta += (microphoneFrequencyAverage - 127) * 0.1;
			// 0.00 +- 0.01
			else delta += 0.05;

			frameCounter++;

			// if (microphoneAnalyser && microphoneDataArray) {
			// 	microphoneAnalyser.getByteTimeDomainData(microphoneDataArray);

			// 	microphroneFrequencySum = 0;

			// 	microphoneDataArray.forEach(number => {
			// 		microphroneFrequencySum += number;
			// 	});

			// 	microphoneFrequencyAverage = microphroneFrequencySum / microphoneDataArray.length;
			// }

			if (frameCounter % 60 === 1) {
				if (microphoneAnalyser && microphoneDataArray) {
					microphoneAnalyser.getByteTimeDomainData(microphoneDataArray);

					microphroneFrequencySum = 0;

					microphoneDataArray.forEach(number => {
						microphroneFrequencySum += number;
					});

					microphoneFrequencyAverage = microphroneFrequencySum / microphoneDataArray.length;
				}
			}

			if (frameCounter % 60 === 1) {
				if (microphoneAnalyser && microphoneDataArray) {
					console.log((microphoneFrequencyAverage - 127) * 0.1);
				}
			}

			octahedron.material.uniforms.delta.value = 0.5 + Math.sin(delta) * 0.5;
			octahedron.material.uniforms.frequencyAverage.value = microphoneFrequencyAverage;

			for (var i = 0; i < vertexDisplacement.length; i++) {
				vertexDisplacement[i] = Math.sin(i + delta) * 0.3;
			}

			octahedron.geometry.attributes.vertexDisplacement.needsUpdate = true;
			octahedron.material.uniformsNeedUpdate = true;

			if (controls) controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
			if (stats) stats.update();
		};

		init();

		addOctahedron();
		addControls();

		if (config.debug) {
			addGridHelper();
			addGUI();
			addStats();
			setControls();
		}

		setOctahedron();
		setCamera();
		setEvents();

		animate();
	}, []);

	return <div id='gl-container' />;
};
