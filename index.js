import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { CSG } from 'three-csg-ts'
import CannonDebugger from 'cannon-es-debugger'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Pacman} from './characterControls'

// GLOBAL VARIABLES
let scene, camera, renderer, controls
let animationId
let pacman;
let pelletCounter = 0

//CONTROLS KEYS
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
let walls = []
let pellets = []
const clock = new THREE.Clock()
const loader = new GLTFLoader()
const WIDTH = 104
const HEIGHT = 88
const DEPTH = 2
const ROWS = 22
const COLS = 26
const board = [
    [0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0],
    [0,1,1,1,1,-1,0,-1,-1,0,1,1,1,1,1,-1,0,-1,-1,0,1,1,1,1,-1,0],
    [0,1,-1,-1,-1,-1,0,-1,-1,0,1,-1,-1,-1,1,-1,0,-1,-1,0,-1,-1,-1,1,-1,0],
    [0,1,-1,0,-1,-1,0,0,0,0,1,-1,0,0,1,-1,0,0,0,0,-1,-1,0,1,-1,0],
    [0,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,-1,0],
    [0,1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,0,0,0,0,0,0,0,0,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,1,1,1,1,1,1,1,1,1,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,-1,1,-1,-1,-1,1,-1,-1,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,0,1,-1,0,0,1,-1,0,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,1,1,1,1,1,1,-1,0,1,1,1,1,1,-1,0,1,1,1,1,1,1,1,-1,0],
    [0,1,-1,-1,-1,-1,-1,1,-1,0,1,-1,-1,-1,1,-1,0,1,-1,-1,-1,-1,-1,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,0,1,-1,0,0,1,-1,0,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,1,1,1,1,1,1,1,1,1,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,0,-1,-1,0,1,-1,0,0,0,0,0,0,0,0,1,-1,0,-1,-1,0,1,-1,0],
    [0,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,-1,0],
    [0,1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,0],
    [0,1,-1,0,-1,-1,0,0,0,0,1,-1,0,0,1,-1,0,0,0,0,-1,-1,0,1,-1,0],
    [0,1,1,1,1,-1,0,-1,-1,0,1,1,1,1,1,-1,0,-1,-1,0,1,1,1,1,-1,0],
    [0,-1,-1,-1,-1,-1,0,-1,-1,0,-1,-1,-1,-1,-1,-1,0,-1,-1,0,-1,-1,-1,-1,-1,0],
    [0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0,0,-1,-1,0,0,0,0,0,0,0],
]


const textureLoader = new THREE.TextureLoader()




//CLASSES
class Pellet {
    constructor(){
        this.points = 10;
        this.radius = 0.8
        this.color = 'white'
        this.geometry = new THREE.SphereGeometry(this.radius,32,32)
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.2,
            metalness: 0,
            flatShading: true
        })
        this.mesh = new THREE.Mesh(this.geometry,this.material)
        this.position = {x: 0, z: 0}
        
    }
}
class Wall {
    constructor(randomHeight = 2){
        this.color = 'violet'
        this.width = 4
        this.height = randomHeight
        this.depth = 4
        this.geometry = new RoundedBoxGeometry(this.width,this.height,this.depth,10,1)
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.1,
        })
        this.mesh = new THREE.Mesh(this.geometry,this.material)
    }
}



//SETUP FUNCTIONS
initScene()
createGround()
initLights()
initOrbitControls()
renderBoard()
createPellets()
createPacman()
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

function initOrbitControls(){
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 40
    controls.maxDistance = 200
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.update();
}

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

    
}


//MODEL
function createPacman(){
    loader.load('models/pacman_animated.glb',(gltf)=>{
    const model = gltf.scene
    model.position.y = 4
    model.traverse(function(object){
        if(object.isMesh) object.castShadow = true
    })
    model.scale.set(3,3,3)
    scene.add(model)
    const gltfAnimations = gltf.animations
    const mixer = new THREE.AnimationMixer(model)
    const animationMap = new Map()
    gltfAnimations.forEach((a) => {
        animationMap.set(a.name, mixer.clipAction(a))
    })
    console.log(animationMap)
    pacman = new Pacman(model,mixer,animationMap,camera,'',{x:0,y:0})
    })
}




//CREATE PELLETS
function createPellets(){
    for(let row = 1; row < ROWS - 1; row++){
        for(let col = 1; col < COLS - 1; col++ ){
            if(board[row][col] === 1){
                const pellet = new Pellet()
                board[row][col] = pellet
                if(pellet){
                    pellet.mesh.position.x = (col * 2 - COLS) * 2 + 4
                    pellet.mesh.position.z = (row * 2 - ROWS) * 2 + 4
                    pellet.mesh.position.y = 2
                    pellets.push(pellet)
                    pellet.position.x = pellet.mesh.position.x
                    pellet.position.z = pellet.mesh.position.z
                    scene.add(pellet.mesh)
                }

            }
        }
    }
}

function renderBoard(){
    for(let row = 0; row < ROWS; row++){
        for(let col = 0; col < COLS; col++){
            const cell = board[row][col]
            if(cell === 0){
                const randomHeight = Math.random() * 5 + Math.random() * 5 + 1
                const wall =  new Wall(randomHeight)
                board[row][col] = wall
                if(wall){
                    wall.mesh.position.x = (col * 2 - COLS) * 2 + 2
                    wall.mesh.position.z = (row * 2 - ROWS) * 2 + 2
                    wall.mesh.position.y = randomHeight/2
                    walls.push(wall)
                    scene.add(wall.mesh)
                }  
            }
        }
    }
}


//Detect Collision
function detectCollision({pacman,wall}){
    const padding = wall.width - pacman.radius - 0.2
    return(
        pacman.model.position.z - pacman.radius + pacman.velocity.y <= wall.mesh.position.z + wall.depth / 2 + padding 
        && pacman.model.position.x + pacman.radius + pacman.velocity.x >= wall.mesh.position.x - padding - wall.width / 2
        && pacman.model.position.z + pacman.radius + pacman.velocity.y >= wall.mesh.position.z - padding - wall.depth / 2
        && pacman.model.position.x - pacman.radius + pacman.velocity.x <= wall.mesh.position.x + wall.width / 2 + padding
    )
}



function animate(){
    controls.update()
    let mixerUpdateDelta = 0.04
    renderer.render(scene,camera)
    if(pacman){
        if(keys.w.pressed && lastkey === 'w'){
            pacman.currentAction = 'eat once.011'
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(detectCollision({
                    pacman: {
                        ...pacman,
                        velocity: {
                            x: 0,
                            y: -pacman.speed
                        }
                    }, wall
                })){
                    pacman.velocity.y = 0
                    break
                } else {
                    pacman.velocity.y = -pacman.speed
                    
                }
            }
        } else if(keys.a.pressed && lastkey === 'a'){
            pacman.currentAction = 'eat once.011'
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(detectCollision({
                    pacman: {
                        ...pacman,
                        velocity: {
                            x: -pacman.speed,
                            y: 0
                        }
                    }, wall
                })){
                    pacman.velocity.x = 0
                    break
                } else {
                    pacman.velocity.x = -pacman.speed
                    
                }
            }
        } else if(keys.s.pressed && lastkey === 's'){
            pacman.currentAction = 'eat once.011'
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(detectCollision({
                    pacman: {
                        ...pacman,
                        velocity: {
                            x: 0,
                            y: pacman.speed
                        }
                    }, wall
                })){
                    pacman.velocity.y = 0
                    break
                } else {
                    pacman.velocity.y = pacman.speed
                    
                }
            }
        } else if(keys.d.pressed && lastkey === 'd'){
            pacman.currentAction = 'eat once.011'
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(detectCollision({
                    pacman: {
                        ...pacman,
                        velocity: {
                            x: pacman.speed,
                            y: 0
                        }
                    }, wall
                })){
                    pacman.velocity.x = 0
                    break
                } else {
                    pacman.velocity.x = pacman.speed
                    
                }
            }
        }
        walls.forEach((wall) => {
            if(detectCollision({pacman,wall})){
                pacman.velocity.x = 0
                pacman.velocity.y = 0
            }
        })
        if(pacman.velocity.x > 0) pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2)
        else if(pacman.velocity.x < 0) pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2)
        else if(pacman.velocity.y < 0 ) pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI)
        else if(pacman.velocity.y > 0) pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 0)


        //PELLET COLLISION CHECK
        for(let i = 0; i < pellets.length; i++){
            const pellet = pellets[i]
            if(Math.hypot(pellet.position.x - pacman.model.position.x, pellet.position.z - pacman.model.position.z) < pacman.radius){
                
                pellet.position.x = (i+1) * 100
                pellet.position.y = (i+1) * 100
                pacman.score += pellet.points
                pelletCounter +=1
                console.log(pelletCounter)
                scene.remove(pellet.mesh)
                
            }
        }
        pacman.update(mixerUpdateDelta)
    }
    animationId = requestAnimationFrame(animate)
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