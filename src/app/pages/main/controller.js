import anime from 'animejs';

const FPS_MAX = 60;
const FPS_USUAL = 53;
const FPS_STABLE = 33;
const FPS_UNSTABLE = 20;

class Animation {
    constructor(cb) {
        this.tick = cb;
    }

    active = false
    delay = 0

    currentTime = 0
    dt = 0

    _run(time) {
        if (!this.active) return false;
        requestAnimationFrame(this._run.bind(this));

        this.dt = this.currentTime && time ? time - this.currentTime : 0;
        if (this.delay && this.dt && this.dt < this.delay) return true;

        this.currentTime = time;
        this.tick(this.dt, time);
    }

    play() {
        this.active = true;
        this._run();
    }

    pause() {
        this.active = false;
    }
}

export default class Controller {
    constructor($scope, $uibModal) {
        this.$scope = $scope;
        this.$uibModal = $uibModal;

        this.scene = $('#scene')[0];
        this.testGroup = $('#test-group')[0];
        this.scene.hasLoaded
            ? this.onStart()
            : this.scene.addEventListener('loaded', this.onStart.bind(this))
        ;

        this.animation = new Animation(this.tick.bind(this));

        // this.testTimeline = this.getTimeline();
        // this.testInProgress = false;
        this.snapshots = [];
    }

    onStart() {
        this.stats = this.scene.components.stats;
        console.log(this.scene, this.stats, this.fps, this.testTimeline);
        this.setMode(this.modes[0]);

        setTimeout(this.startTest.bind(this), 2000);
    }

    // stats
    get fps() { return this.stats.stats('fps').value(); }
    get raf() { return this.stats.stats('raf').value(); }
    get entities() { return this.testGroup.childElementCount; }
    get renderCalls() { return this.scene.renderer.info.render.calls; }
    get vertices() { return this.scene.renderer.info.render.vertices; }
    get faces() { return this.scene.renderer.info.render.faces; }

    getSnapshot() {
        return {
            fps: this.fps,
            raf: this.raf,
            entities: this.entities,
            memory: Object.assign({}, this.scene.renderer.info.memory),
            render: Object.assign({}, this.scene.renderer.info.render),
        }
    }

    // mode methods
    modes = [
        {
            name: 'cubes',
            object: '<a-box>',
            objectCount: 300,
            incBy: 15,
        },
        {
            name: 'spheres',
            object: '<a-sphere>',
            objectCount: 100,
            incBy: 10,
        },
        {
            name: 'spheres-100',
            object: '<a-sphere geometry="segmentsWidth: 100; segmentsHeight: 100;">',
            objectCount: 100,
            incBy: 5,
        },
        {
            name: 'particles-100',
            object: '<a-entity particle-system="particleCount: 100">',
            objectCount: 1,
            incBy: 1,
            delay: 1000
        },
        {
            name: 'particles-10k',
            object: '<a-entity particle-system="particleCount: 10000">',
            objectCount: 1,
            incBy: 1,
            delay: 2000
        },
        {
            name: 'particles-50k',
            object: '<a-entity particle-system="particleCount: 50000">',
            objectCount: 1,
            incBy: 1,
            delay: 2000
        },
    ]

    setMode(mode) {
        if (!mode) return;
        this.mode = mode;
        this.animation.delay = this.mode.delay || 100
        this.initTest();
    }

    setModeBtn(mode) {
        if (!mode) return;
        if (this.testInProgress) this.pauseTest();
        this.setMode(mode);

        setTimeout(this.startTest.bind(this), 2000);
    }

    // test methods
    clearScene() {
        $('#test-group').html('');
        this.snapshots = [];
        this._critCurrent = 0;
    }

    initTest() {
        this.clearScene();

        for (let i=0; i < this.mode.objectCount; i++) {
            this.addObject();
        }
    }

    startTest() {
        this.animation.play();
    }

    pauseTest() {
        this.animation.pause();
    }

    stopTest() {
        this.pauseTest();

        localStorage.setItem('benchmark.obj-'+this.mode.name, JSON.stringify(this.snapshots));
        this.snapshots.forEach((v) => {
            v.fps = v.fps.toFixed(2);
            v.raf = v.raf.toFixed(2);
        });
        console.log(this.snapshots);
    }

    tick(dt, time) {
        // console.log('tick', dt, time);
        this.checkFps();

        for (let i=0; i<this.mode.incBy; i++) {
            this.addObject();
        }
    }

    __showResults() {
        this.$uibModal.open({
            template: require('app/modals/results.pug')(),
            controller: ($scope) => {
                $scope.name = this.benchmarkName;
                $scope.results = this.snapshots;
            }
        })
    }

    // Benchmark timeline frames
    addObject() {
        var position = new THREE.Vector3(
            _.random(-10, 10),
            _.random(-10, 10),
            _.random(-10, 10)
        );

        $(this.mode.object).attr({
            position: position.toString(),
        }).appendTo('#test-group')
    }

    // Timeline basics
    _critStack = [
        FPS_USUAL,
        FPS_STABLE,
        FPS_UNSTABLE,
    ]
    _critCurrent = 0

    checkFps() {
        if (this.fps <= this._critStack[this._critCurrent]) {
            this._critCurrent++;
            let snap = this.getSnapshot();
            snap.critical = true;
            this.snapshots.push(snap);
            console.log('Saved', snap, snap.render.faces / snap.render.calls, snap.render.vertices / snap.render.calls);
        }

        if (this.fps < FPS_UNSTABLE) {
            console.log('HALT');
            this.stopTest();
            this.$scope.$digest();
            return;
        }
    }

    __getTimeline() {
        var timeline = anime.timeline({
            autoplay: false,
            complete: () => { // loop all callbacks
                if (!this.testInProgress) return;
                this.testTimeline.restart();
            }
        })

        this.timelineFrames.concat(this._timelineFramesAfter)
        .forEach((v) => {
            if (!v.targets) {
                v.targets = {t: 0};
                v.t = 0;
            }

            timeline.add(v);
        });

        return timeline;
    }
}
