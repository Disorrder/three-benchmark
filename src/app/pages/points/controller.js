import anime from 'animejs';
import SPE from 'shader-particle-engine';
import 'aframe-particle-system-component';
import MainController from 'app/pages/main/controller';

export default class Controller extends MainController {
    constructor($scope) {
        super($scope);

        this.modes = [
            {
                name: 'max points',
                points: 300,
                incBy: 10,
            },
            {
                name: 'max systems',
                points: 500,
                // incBy: 1,
            },
        ]

        // this.animation = anime({
        //     loop: true,
        //     update: this.tick.bind(this)
        // });
    }

    // timelineFrames = [
    //     {
    //         duration: 40,
    //         begin: () => {
    //             // this.addParticles()
    //
    //         }
    //     }
    // ]

    initTest() {
        // this.clearScene();

        // this.particleGroup = this.createParticles();
        var particleGroups = $('[particle-system]');
        var particleGroup = particleGroups[0];
        this.particleGroup = particleGroup;
        console.log('init', this.particleGroup);
    }

    createParticles() {
    	var particleGroup = new SPE.Group({
    		texture: {
                value: THREE.ImageUtils.loadTexture('/assets/smokeParticle.png')
            }
    	});

    	var emitter = new SPE.Emitter({
            maxAge: {
                value: 2
            },
    		position: {
                value: new THREE.Vector3(0, 0, -50),
                spread: new THREE.Vector3( 0, 0, 0 )
            },

    		acceleration: {
                value: new THREE.Vector3(0, -10, 0),
                spread: new THREE.Vector3( 10, 0, 10 )
            },

    		velocity: {
                value: new THREE.Vector3(0, 25, 0),
                spread: new THREE.Vector3(10, 7.5, 10)
            },

            color: {
                value: [ new THREE.Color('white'), new THREE.Color('red') ]
            },

            size: {
                value: 1
            },

    		particleCount: 2000
    	});

        // document.querySelector('.numParticles').textContent =
        // 'Total particles: ' + emitter.particleCount;
    	particleGroup.addEmitter( emitter );
        $('#test-group')[0].object3D.add(particleGroup.mesh);

        return particleGroup;
    }

    tick() {
        console.log('tick', this.animation);
    }

}
