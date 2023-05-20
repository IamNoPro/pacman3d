import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

export class AlienShip{
        constructor(model,mixer,animationsMap,currentAction){
            this.model = model
            this.mixer = mixer
            this.animationsMap = animationsMap
            this.currentAction = currentAction
            this.rotateQuaternion = new THREE.Quaternion()
            
        }
        update(delta){

            
            this.model.quaternion.copy(this.rotateQuaternion)
            this.animationsMap.get(this.currentAction)?.play()
            this.mixer.update(delta)
        }
        getPacman(pacman){
            console.log('here')
            console.log(pacman)
            const tweenGo = new TWEEN.Tween(this.model.position)
            .to({x: pacman.model.position.x,z: pacman.model.position.z, y: this.model.position.y}, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            tweenGo.start()
            tweenGo.onComplete(()=>{
                 pacman.disappear()
            })
           
        }
}