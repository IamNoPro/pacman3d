import * as THREE from 'three'

export class Ghost {
    constructor(model,mixer,animationsMap,camera,currentAction,velocity){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.camera = camera
        this.rotateQuaternion = new THREE.Quaternion()
        this.velocity = velocity
        this.radius = 3
        this.speed = 0.3
        this.scared = true
        this.direction = 'down'
        this.maxSteps = 10
        this.stepsTaken = 0
        this.threshold = Math.floor(Math.random() * 314) + 159
        this.threshold2 = Math.floor(Math.random() * 314) + 159
    }
    update(delta){
        this.model.position.x += this.velocity.x
        this.model.position.z += this.velocity.y
        this.model.quaternion.copy(this.rotateQuaternion)
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
}