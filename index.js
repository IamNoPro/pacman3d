import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { CSG } from 'three-csg-ts'
import CannonDebugger from 'cannon-es-debugger'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {CharacterControls} from './characterControls'

// GLOBAL VARIABLES
let scene, camera, renderer, world, cannonDebugger, controls
let timeStep = 1/60;
let groundMaterial;
let characterControls;
let lastkey= ''
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
const clock = new THREE.Clock()
const loader = new GLTFLoader()
const WIDTH = 104
const HEIGHT = 88
const DEPTH = 2
const ROWS = 22
const COLS = 26
const board = [
    [0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,0],
    [0,1,1,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,1,1,0],
    [0,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,1,0,-1,-1,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0],
]


const textureLoader = new THREE.TextureLoader()

//SETUP FUNCTIONS
initScene()
initWorld()
createGround()
initLights()
renderBoard()
createPacman()

// createWall(4,15,4,-48,0,-38)
animate()

function initScene(){
    scene = new THREE.Scene() 
    // scene.background = new THREE.TextureLoader().load('/textures/placeholder/background.jpg')
    // scene.backgroundBlurrines = 0.5
    scene.background = new THREE.Color('white')

    camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,200)
    camera.position.set(0,100,60)
    camera.rotation.set(-Math.PI/3, 0, 0)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
}

function initWorld(){
    world = new CANNON.World()
    world.gravity.set(0, -10,0)

    cannonDebugger = new CannonDebugger(scene,world, {
        color: 0xfffff,
        scale: 1.0
    })
}

// function initOrbitControls(){
//     controls = new OrbitControls(camera, renderer.domElement)
//     controls.enableDamping = true
//     controls.minDistance = 20
//     controls.maxDistance = 80
//     controls.enablePan = false
//     controls.maxPolarAngle = Math.PI / 2 - 0.05
//     controls.update();
// }

function initLights(){
    
    const light = new THREE.DirectionalLight()
    light.position.set(0,90,55)
    scene.add(light)
}

function createGround(){
    //THREE JS
    // const groundTexture = textureLoader.load('textures/placeholder/placeholder.png')
    // groundTexture.wrapS = THREE.RepeatWrapping
    // groundTexture.wrap = THREE.RepeatWrapping
    // groundTexture.repeat.set(48,48)
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(WIDTH,HEIGHT,DEPTH),
        new THREE.MeshStandardMaterial({color: 'gray'})
      );
    box.rotation.x = - Math.PI / 2
    const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(8,8,16),
        new THREE.MeshBasicMaterial({color:'blue'})
    );
    box2.position.set(-20,0,HEIGHT/2-4)
    box.updateMatrix()
    box2.updateMatrix()
    let subRes = CSG.subtract(box, box2);
    subRes.rotation.x = - Math.PI / 2
    box2.position.set(20,0,HEIGHT/2-4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes, box2)
    box2.position.set(-20,0,-HEIGHT/2+4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes,box2)
    box2.position.set(20,0,-HEIGHT/2+4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes,box2)
    scene.add(subRes);

    //CANNON JS
    groundMaterial = new CANNON.Material("groundMaterial")
    const groundShape = new CANNON.Box(new CANNON.Vec3(40,1,40))
    const groundBody = new CANNON.Body({mass: 0, shape: groundShape, material: groundMaterial})
    world.addBody(groundBody)
}

function createWall(width,height,depth,x,y,z){
    const wallMaterial = new CANNON.Material('wallMaterial')
    const wallShape = new CANNON.Box(new CANNON.Vec3(width/2,height/2,depth/2))
    const wallBody = new CANNON.Body({mass:0, shape: wallShape, material: wallMaterial})
    wallBody.position = new CANNON.Vec3(x,y,z)
    world.addBody(wallBody)


    const roundedBoxGeometry = new RoundedBoxGeometry(width,height,depth,10,1)
    const mat = new THREE.MeshStandardMaterial({
        color: 'violet',
        metalness: 1,
        roughness: 0.1,
        
    })
    const boxMesh = new THREE.Mesh(roundedBoxGeometry,mat)
    scene.add(boxMesh)
    boxMesh.position.copy(wallBody.position)
}
//---------------------------//
//MODEL
function createPacman(){
    const pacMat = new CANNON.Material('pacmanMaterial')
    const pacShape = new CANNON.Box(new CANNON.Vec3(3,3,3))
    const pacBody = new CANNON.Body({
        mass: 100, 
        material: pacMat, 
        shape: pacShape,
        
    })
    pacBody.position = new CANNON.Vec3(0,10,0)
    world.addContactMaterial(new CANNON.ContactMaterial(groundMaterial,pacMat,{
        friction:1,
        restitution:0
    }))
    world.addBody(pacBody)

    loader.load('models/pacman_animated.glb',(gltf)=>{
    const model = gltf.scene
    model.position.y = 4
    model.traverse(function(object){
        if(object.isMesh) object.castShadow = true
    })
    model.scale.set(3,3,3) 
    model.position.copy(pacBody.position)
    model.quaternion.copy(pacBody.quaternion)

    scene.add(model)

    const gltfAnimations = gltf.animations
    const mixer = new THREE.AnimationMixer(model)
    const animationMap = new Map()
    gltfAnimations.forEach((a) => {
        animationMap.set(a.name, mixer.clipAction(a))
    })
    console.log(animationMap)
    characterControls = new CharacterControls(pacBody,model,mixer,animationMap,camera,'Action',{x:0,y:0})

})
}





function renderBoard(){
    for(let row = 0; row < ROWS; row++){
        for(let col = 0; col < COLS; col++){
            const cell = board[row][col]
            if(cell === 0){
                const randomHeight = Math.random() * 5 + Math.random() * 5 + 1
                const wallMaterial = new CANNON.Material('wallMaterial')
                const wallShape = new CANNON.Box(new CANNON.Vec3(2,randomHeight/2,2))
                const wallBody = new CANNON.Body({mass:0, shape: wallShape, material: wallMaterial})
                
                const geo = new RoundedBoxGeometry(4,randomHeight,4,10,1)
                const mat = new THREE.MeshStandardMaterial({
                    color: 'violet',
                    roughness: 0.1,
                })
                const wallMesh = new THREE.Mesh(geo,mat)
                wallBody.position.x = (col * 2 - COLS) * 2 + 2
                wallBody.position.z = (row * 2 - ROWS) * 2 + 2
                wallBody.position.y = randomHeight/2
                world.addBody(wallBody)
                wallMesh.position.copy(wallBody.position)
                scene.add(wallMesh)
                
            }
        }
    }
}


function animate(){
    world.step(timeStep)
    // controls.update()
    let mixerUpdateDelta = clock.getDelta()
    renderer.render(scene,camera)
    if(characterControls){
        characterControls.update(mixerUpdateDelta,keys,lastkey)
    }
    cannonDebugger.update()
    requestAnimationFrame(animate)
}

window.addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            lastkey = "w"
            keys.w.pressed = true
            break
        case 'a':
            lastkey = 'a'
            keys.a.pressed = true
            break
        case 's':
            lastkey = 's'
            keys.s.pressed = true
            break
        case 'd':
            lastkey = 'd'
            keys.d.pressed = true
            break
            
    }
})

window.addEventListener('keyup', ({key}) => {
    switch(key){
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break      
    }
})