import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'


export class Pacman {
    constructor(model,mixer,animationsMap,camera,currentAction,velocity, direction){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        // this.animationsMap.forEach((value,key) =>{
        //     if(key == currentAction){
        //         value.play()
        //     }
        // })
        this.camera = camera
        this.rotateQuaternion = new THREE.Quaternion()
        this.velocity = velocity
        this.radius = 3
        this.speed = 0.3
        this.score = 0
        this.startedAnimation = false
        this.direction = direction
        this.getPacman = false
        
    }
    update(delta){
        if(!this.startedAnimation){
            this.model.position.x += this.velocity.x
            this.model.position.z += this.velocity.y
            this.model.quaternion.copy(this.rotateQuaternion)
            this.animationsMap.get(this.currentAction)?.play()
            this.mixer.update(delta)
        }
        
    }
    disappear(){
        const targetScale = new THREE.Vector3(1,1,1)
        let tweenPosition = new TWEEN.Tween(this.model.position)
        .to({x: this.model.position.x, y: 30, z: this.model.position.z}, 3000)
        .easing(TWEEN.Easing.Quadratic.InOut);
        let tweenScale = new TWEEN.Tween(this.model.scale)
        .to(targetScale,3000)
        .easing(TWEEN.Easing.Quadratic.InOut)

        tweenPosition.start()
        tweenScale.start()
    }
    animateOnCollision(){
        this.startedAnimation = true
        let tweenUp
        let tweenDown
        let tweenY
        let lookBack
        console.log('rotationBefore',this.model.rotation)
        if(this.direction === 'down'|| this.direction === 'up'){
            tweenUp = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x + Math.PI / 2, y:this.model.rotation.y + Math.PI / 2, z: 0 + this.model.rotation.z }, 1000) // Rotate 
            .easing(TWEEN.Easing.Quadratic.InOut);

            tweenDown = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x - Math.PI / 2, y: this.model.rotation.y - Math.PI / 2, z: this.model.rotation.z + 0 }, 1000) // Rotate
            .easing(TWEEN.Easing.Quadratic.InOut);
        } else {
            tweenUp = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x + 0, y: this.model.rotation.y + Math.PI / 2, z: this.model.rotation.z + Math.PI / 2 }, 1000) // Rotate 
            .easing(TWEEN.Easing.Quadratic.InOut);

            tweenDown = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x, y: this.model.rotation.y - Math.PI / 2, z: this.model.rotation.z - Math.PI / 2 }, 1000) // Rotate
            .easing(TWEEN.Easing.Quadratic.InOut);
        }
        tweenY = new TWEEN.Tween(this.model.rotation)
        .to({ x: this.model.rotation.x, y: this.model.rotation.y + Math.PI * 2, z: this.model.rotation.z }, 2000) // Rotate fully around Y-axis
        .easing(TWEEN.Easing.Quadratic.InOut)
        
        lookBack = new TWEEN.Tween(this.model.rotation)
        .to({x: this.model.rotation.x, y: this.model.rotation.y + Math.PI, z: this.model.rotation.z},1000 )
        .easing(TWEEN.Easing.Quadratic.InOut)
        
        



        tweenUp.chain(tweenDown);
        tweenDown.chain(tweenY);
        tweenY.chain(lookBack)
        console.log('roationAfter', this.model.rotation)
        

        // Start the animation
        tweenUp.start();
        lookBack.onComplete(() => {
            this.startedAnimation = false
        })
    }
   
}