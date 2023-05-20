import * as THREE from "three"
import * as TWEEN from '@tweenjs/tween.js'
import { CSG } from 'three-csg-ts'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Pacman} from './pacmanClass'
import {Ghost} from  './ghostClass'
import {AlienShip} from  './nloClass'





// GLOBAL VARIABLES
let scene, camera, renderer, controls
let animationId
let pacman;
let ghost;
let alien
let pelletCounter = 0
let ghostAnimation = false
let isModelIntact = true;





//TESTING


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
let ghosts = []
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
createNlo()
// createGhost()
animate()







function initScene(){
    scene = new THREE.Scene() 
    scene.background = new THREE.TextureLoader().load('/textures/placeholder/texture_0.jpeg')
    // scene.backgroundBlurrines = 0.5
    // scene.background = new THREE.Color('white')

    camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,200)
    camera.position.set(0,80,83)
    camera.rotation.set(-Math.PI/4, 0, 0)

    //tween
    // const geometry = new THREE.BoxGeometry(10, 10, 10);
    // const material = new THREE.MeshBasicMaterial({ color: 'blue' });
    // myBox = new THREE.Mesh(geometry, material);
    // myBox.position.y = 5
    // scene.add(myBox)

    // tweenUp = new TWEEN.Tween(myBox.rotation)
    //     .to({ x: 0, y: 0, z: Math.PI / 2 }, 2000)
    //     .easing(TWEEN.Easing.Quadratic.InOut);
    // const tweenDown = new TWEEN.Tween(myBox.rotation)
    //     .to({ x: 0, y: 0, z: -Math.PI / 2 }, 2000)
    //     .easing(TWEEN.Easing.Quadratic.InOut);
      
    // // Rotate along the Y-axis
    // const tweenY = new TWEEN.Tween(myBox.rotation)
    //     .to({ x: 0, y: Math.PI, z: 0 }, 1000)
    //     .easing(TWEEN.Easing.Quadratic.InOut);

    // tweenUp.chain(tweenDown);
    // tweenDown.chain(tweenY);



    //tween

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // setTimeout(() =>{
    //     tweenUp.start()
    // },5000)
    const spotlight = new THREE.SpotLight('brown', 1);
    spotlight.position.set(0, 10, 0);
    spotlight.angle = Math.PI/6
    scene.add(spotlight);

    const coneGeometry = new THREE.ConeGeometry(6,30, 32); // Adjust size as needed

// Create material for spotlight rays
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 'white', opacity: 0.3, transparent: true });

    // Create mesh for spotlight rays
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.y = 15
    scene.add(coneMesh)
   
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
    // const ambientlight = new THREE.AmbientLight('blue', 0.3)
    const light = new THREE.DirectionalLight('white', 1)
    light.castShadow = true
    light.position.set(0,90,55)
    light.shadow.mapSize.width = 200;
    light.shadow.mapSize.height = 200;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 200;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = - 50;
    light.shadow.camera.left = - 50;
    light.shadow.camera.right = 50;

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(0, 100, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 200;
    dirLight.shadow.mapSize.height = 200;
    // scene.add(dirLight);
    // scene.add(ambientlight)
    scene.add(light)
}

function createGround(){
    //THREE JS
    const groundTexture = textureLoader.load('textures/placeholder/texture_2.jpeg')
    // groundTexture.wrapS = THREE.RepeatWrapping
    // groundTexture.wrap = THREE.RepeatWrapping
    // groundTexture.repeat.set(24,24)
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(WIDTH-6,HEIGHT-6,1),
        new THREE.MeshStandardMaterial({map:  groundTexture})
      );
    box.rotation.x = - Math.PI / 2
    const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(10,12,20),
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
    subRes.receiveShadow = true
    scene.add(subRes);

    
}


//MODEL PACMAN
function createPacman(){
    loader.load('models/packylinYellow.glb',(gltf)=>{
    const model = gltf.scene
    console.log(model)
    model.position.y = 4
    model.position.z = -24
    model.position.x = -32
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

    pacman = new Pacman(model,mixer,animationMap,camera,'',{x:0,y:0}, 'down')
    setTimeout(() =>{
        pacman.getPacman = true
    },10000)
    
    
    })
}
function createNlo(){
    loader.load('models/scanner_droid.glb', (gltf) =>{
        const model = gltf.scene
        console.log(model)
        model.position.y = 30
        model.position.x = 0
        model.position.z = 0
        model.traverse(function(object){
            if(object.isMesh) {
                object.castShadow = true 
                // object.material.color.set('white')
            }
        })
        model.scale.set(0.04,0.04,0.04)
        scene.add(model)
        const gltfAnimations = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap = new Map()
        gltfAnimations.forEach((a) => {
            animationMap.set(a.name, mixer.clipAction(a))
        })
        console.log(animationMap)
        alien = new AlienShip(model,mixer,animationMap,"CINEMA_4D_Main")
        
    })
}

//MODEL GHOST
function createGhost(){
    loader.load('models/ghost_purpleusdz.glb', (gltf) =>{
        const model = gltf.scene
        console.log(model)
        model.position.y = 1
        model.position.x = 8
        model.traverse(function(object){
            if(object.isMesh) {
                object.castShadow = true 
                // object.material.color.set('white')
            }
        })
        model.scale.set(2.5,2.5,2.5)
        scene.add(model)
        //------------//
        const particleGeometry = new THREE.BufferGeometry();
        const vertices = [];
        model.traverse(function (node) {
          if (node.isMesh) {
            const matrixWorld = node.matrixWorld;
            const positions = node.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
              const vertex = new THREE.Vector3();
              vertex.fromBufferAttribute(positions, i);
              vertex.applyMatrix4(matrixWorld);
              vertices.push(vertex.x, vertex.y, vertex.z);
            }
          }
        });
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 4));
      
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff });
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        particles.visible = false
        

        //------------//
        const gltfAnimations = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap = new Map()
        gltfAnimations.forEach((a) => {
            animationMap.set(a.name, mixer.clipAction(a))
        })
        ghost = new Ghost(model,mixer,animationMap,camera,'Animation', {x:0,y:0})
        ghosts.push(ghost)
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
                    pellet.mesh.position.y = 2.5
                    pellet.mesh.castShadow = true
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


//HELPER DELETE AFTER
// let curveHelper = new THREE.CatmullRomCurve3(path);
// let curvePoints = curveHelper.getPoints(50);
// let curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
// let curveMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
// let curveObject = new THREE.Line(curveGeometry, curveMaterial);
// scene.add(curveObject);


//---------//
//TESTING



function animate(){
    controls.update()
    let mixerUpdateDelta = 0.04
    renderer.render(scene,camera)
    if(pacman){
        
        if(/*keys.w.pressed && */ lastkey === 'w'){
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
        } if(/*keys.a.pressed && */ lastkey === 'a'){
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
        } if(/*keys.s.pressed && */ lastkey === 's'){
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
        } if(/*keys.d.pressed && */ lastkey === 'd'){
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
        if(pacman.velocity.x > 0) {
            pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2)
             pacman.direction = 'right'}
        else if(pacman.velocity.x < 0) {
            pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2) 
            pacman.direction = 'left'}
        else if(pacman.velocity.y < 0 ) {
            pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI)
            pacman.direction = 'up'}
        else if(pacman.velocity.y > 0) {
            pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 0)
            pacman.direction = 'down'
        }


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
                pacman.animateOnCollision()
                if(pacman.direction === 'down'){
                    lastkey = 'w'
                } else if(pacman.direction === 'up'){
                    lastkey = 's'
                } else if(pacman.direction === 'left'){
                    lastkey = 'd'
                } else if(pacman.direction === 'right'){
                    lastkey = 'a'
                }
                
                
            }
        }
        
        pacman.update(mixerUpdateDelta)
        
    }
    if(alien){
        alien.update(mixerUpdateDelta)
        if(pacman?.getPacman){
            alien.getPacman(pacman)
            pacman.getPacman = false
        }
    }
    let deltaGhost = 0.005


    //DETECT COLLISION BETWEEN GHOST AND PLAYER
    for(let i = ghosts.length -1 ; i>= 0; i--){
        const ghost = ghosts[i]
        if(Math.hypot(ghost.model.position.x - pacman.model.position.x,ghost.model.position.z - pacman.model.position.z) < ghost.radius + pacman.radius){
            if(ghost.scared){
                isModelIntact = false
                particles.visible = true
                particles.position.copy(ghost.model.position.clone())
                if (!isModelIntact) {
                    setTimeout(() => {
                      isModelIntact = true;
                      particles.visible = false;
                    }, 5000);
                  }
            } else{
                cancelAnimationFrame(animationId)
                alert('LOOOOOSEEER')
            }
        }
    }

    //WIN CONDITION
    if(pelletCounter === pellets.length){
        alert("WIN!!!")
        cancelAnimationFrame(animationId)
    }
    //GHOST HANDLER
    ghosts.forEach((ghost) => {
        const collisions = [] 

        walls.forEach((wall) => {
            if(!collisions.includes('right')
             && detectCollision({
                 pacman: {
                     ...ghost,
                     velocity: {
                         x: ghost.speed,
                         y: 0
                     }
                 },
                 wall
            })){
                 collisions.push('right')
            }
            if(!collisions.includes('left')
             && detectCollision({
                 pacman: {
                     ...ghost,
                     velocity: {
                         x: -ghost.speed,
                         y: 0
                     }
                 },
                 wall
            })){
                 collisions.push('left')
            }
            if(!collisions.includes('up')
             && detectCollision({
                 pacman: {
                     ...ghost,
                     velocity: {
                         x: 0,
                         y: -ghost.speed
                     }
                 },
                 wall
            })){
                 collisions.push('up')
            }
            if(!collisions.includes('down')
             && detectCollision({
                 pacman: {
                     ...ghost,
                     velocity: {
                         x: 0,
                         y: ghost.speed
                     }
                 },
                 wall
            })){
                 collisions.push('down')
            }
        })
        
        let pathways = [];
        let oppositeDirection;
        if (ghost.direction === 'down') oppositeDirection = 'up';
        else if (ghost.direction === 'up') oppositeDirection = 'down';
        else if (ghost.direction === 'right') oppositeDirection = 'left';
        else if (ghost.direction === 'left') oppositeDirection = 'right';
        
        const initial_pathways = ['right', 'left', 'up', 'down']
        pathways = initial_pathways.filter((collision)=> {
            return !collisions.includes(collision)
        })
        pathways = pathways.filter(direction => direction !== oppositeDirection)
        if(ghost.stepsTaken >= ghost.maxSteps || !pathways.includes(ghost.direction)){
            ghost.direction = pathways[Math.floor(Math.random() * pathways.length)]
            ghost.stepsTaken = 0
            ghost.maxSteps = Math.floor(Math.random() * 30) + 31
        }
        
        if((ghost.direction == 'down' || ghost.direction =="up") && ghost.threshold < 0){
            if(ghost.model.position.x < -20){
                console.log('verticalLLL')
                if(pathways.includes('right')){
                    console.log('vertical right')
                    ghost.direction = 'right'
                    ghost.threshold = Math.floor(Math.random() * 314) +159
                }
            }else if(ghost.model.position.x > 20){
                console.log('verticalRRR')
                if(pathways.includes('left')){
                    console.log('vertical left')
                    ghost.direction = 'left'
                    ghost.threshold = Math.floor(Math.random() * 314) + 159
                }
            }
        }
        if(ghost.direction =='right' || ghost.direction =='left' && ghost.threshold2 < 0){
            console.log('horizontal')
            if(((ghost.model.position.z > -25 && ghost.model.position.z < -18) || (ghost.model.position.z < 25 && ghost.model.position.z >20)) && ghost.model.position.x < 22 && ghost.model.position.x > -22){
                if((Math.floor(Math.random() * 3) + 1) >= 2){
                    if(pathways.includes('down')){
                        console.log('horizontal down')
                        ghost.direction = 'down'
                        ghost.threshold2 = Math.floor(Math.random() * 314) +159
                    }
                } else{
                    if(pathways.includes('up')){
                        console.log('horizontal up')
                        ghost.direction = 'up'
                        ghost.threshold2 = Math.floor(Math.random() * 314) +159
                    }
                }
                
            }
        }
        
        ghost.threshold --
        ghost.threshold2 --
      
        
        
       
        // if(!collisions.includes(prev_direction) && ghost.repeated_direction <= 200)
        //     direction = prev_direction;
        
        // if(direction !== prev_direction)
        //     ghost.repeated_direction = 0;
        // else 
        //     ghost.repeated_direction ++;

        switch (ghost.direction){
            case 'down':
                ghost.velocity.y = ghost.speed
                ghost.velocity.x = 0
                ghost.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 0)
                ghost.direction = 'down'
                break
            case 'up':
                ghost.velocity.y = -ghost.speed
                ghost.velocity.x = 0
                ghost.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI)
                ghost.direction = 'up'
                break
            case 'right':
                ghost.velocity.y = 0
                ghost.velocity.x = ghost.speed
                ghost.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2)
                ghost.direction = 'right'
                break
            case 'left':
                ghost.velocity.y = 0
                ghost.velocity.x = -ghost.speed
                ghost.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2)
                ghost.direction = 'left'
                break
        }
        ghost.stepsTaken ++
        // ghost.randomRight --
        ghost.randomLeft --
        if(isModelIntact){
            ghost.update(deltaGhost)
        }
        
    })
    animationId = requestAnimationFrame(animate)
    TWEEN.update()
}
window.addEventListener('keydown', ({key}) => {
    console.log("key pressed ", key);
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

// window.addEventListener('keyup', ({key}) => {
//     switch(key){
//         case 'w':
//             keys.w.pressed = false
//             break
//         case 'a':
//             keys.a.pressed = false
//             break
//         case 's':
//             keys.s.pressed = false
//             break
//         case 'd':
//             keys.d.pressed = false
//             break      
//     }
// })
window.addEventListener('resize', function(){
    if(renderer){
      renderer.setSize(innerWidth,innerHeight)
    }
    if(camera){
      camera.aspect =innerWidth/innerHeight
      camera.updateProjectionMatrix()
    }
  })