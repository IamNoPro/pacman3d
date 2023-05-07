import * as THREE from 'three'
import * as CANNON from 'cannon-es'


export class Pacman {
    constructor(model,mixer,animationsMap,camera,currentAction,velocity){
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
        
    }
    update(delta){
        this.model.position.x += this.velocity.x
        this.model.position.z += this.velocity.y
        this.model.quaternion.copy(this.rotateQuaternion)
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
   
}