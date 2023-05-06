import * as THREE from 'three'
import * as CANNON from 'cannon-es'
const velocity = 4

export class CharacterControls {
    constructor(pacBody,model,mixer,animationsMap,camera,currentAction,velocity){
        this.pacBody = pacBody
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.animationsMap.forEach((value,key) =>{
            if(key == currentAction){
                value.play()
            }
        })
        this.camera = camera

        this.walkDirection = new THREE.Vector3()
        this.rotateAngle = new THREE.Vector3(0,1,0)
        this.rotateQuaternion = new THREE.Quaternion()
        this.velocity = velocity
    }
    update(delta,keys,lastkey){
        if(keys.w.pressed && lastkey === "w"){
            this.pacBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI)
            this.velocity.x = -0.5
            this.velocity.y = 0
            this.currentAction = 'eat once.011'
        } else if(keys.a.pressed && lastkey === 'a'){
            this.velocity.y = -0.5
            this.velocity.x = 0
            this.pacBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI/2)
            this.currentAction = 'eat once.011'
        } else if(keys.s.pressed && lastkey === "s"){
            this.velocity.x = 0.5
            this.velocity.y = 0
            this.pacBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), 0)
            this.currentAction = 'eat once.011'
        } else if(keys.d.pressed && lastkey === 'd'){
            this.velocity.y = 0.5
            this.velocity.x = 0
            this.pacBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2)
            this.currentAction = 'eat once.011'
        }

        this.pacBody.position.z += this.velocity.x
        this.pacBody.position.x += this.velocity.y
        this.model.position.copy(this.pacBody.position)
        this.model.quaternion.copy(this.pacBody.quaternion)
        this.animationsMap.get(this.currentAction).play()
        this.mixer.update(delta)
    }
}