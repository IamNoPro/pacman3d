import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class CreateWorld {
    constructor(){
        this._Initialize()
    }
    _Initialize(){
        //RENDERER
        this.threejs = new THREE.WebGL1Renderer({antialias: true})
        this.threejs.shadowMap.enabled = true
        this.threejs.setPixelRatio(window.devicePixelRatio)
        this.threejs.setSize(window.innerWidth,window.innerHeight)
        document.body.appendChild( this.threejs.domElement)

        // window.addEventListener('resize', () => {
        //     this.OnWindowResize()
        // }, false)

        //CAMERA
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
        this.camera.position.set(0,5,5)

        //SCENE
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color("skyblue")

        //LIGHT
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7))

        const dirLight = new THREE.DirectionalLight(0xffffff, 1)
        dirLight.position.set(- 60, 100, - 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = - 50;
        dirLight.shadow.camera.left = - 50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;
        this.scene.add(dirLight);

        //ORBIT CONTROLS
        const orbitControls = new OrbitControls(this.camera,this.threejs.domElement)
        orbitControls.enableDamping = true
        orbitControls.minDistance = 5
        orbitControls.maxDistance = 40
        orbitControls.enablePan = false
        orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
        orbitControls.update();

        this.generateFloor()
        this.animate()

    }
    //FOR PATTERN REPEATING TEXTURE, E.G FLOOR
    wrapAndRepeatTexture(map){
        map.wrapS = map.wrapT = THREE.RepeatWrapping
        map.repeat.x = map.repeat.y = 10
    }
    //GENERATING FLOOR
    generateFloor(){
        const textureLoader = new THREE.TextureLoader();
        const placeholder = textureLoader.load("textures/placeholder/placeholder.png");
        
        const WIDTH = 80
        const LENGTH = 80

        const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
        const material = new THREE.MeshPhongMaterial({ map: placeholder})
        this.wrapAndRepeatTexture(material.map)

        const floor = new THREE.Mesh(geometry, material)
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI / 2
        this.scene.add(floor)
    }
    OnWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.threejs.setSize(window.innerWidth,window.innerHeight)
    }

    animate(){
        requestAnimationFrame(() => {
            
            this.threejs.render(this.scene,this.camera)
            this.animate()
        })
    }
}

let App = null

App = new CreateWorld()
