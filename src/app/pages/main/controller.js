import anime from 'animejs';

const FPS_MAX = 60;
const FPS_USUAL = 55;
const FPS_STABLE = 30;
const FPS_UNSTABLE = 20;

export default class Controller {
    constructor() {
        this.scene = $('#scene')[0];

        this.scene.hasLoaded
            ? this.onStart()
            : this.scene.addEventListener('loaded', this.onStart.bind(this))
        ;

        this.testTimeline = this.getTimeline();

        this.testInProgress = false;
        this.snapshots = [];
    }

    onStart() {
        this.stats = this.scene.components.stats;
        console.log(this.scene, this.stats, this.fps, this.testTimeline);

        for (let i=0; i < 500; i++) {
            this.addObject();
        }

        setTimeout(this.startTest.bind(this), 2000);
    }

    // stats
    get fps() { return this.stats.stats('fps').value(); }
    get raf() { return this.stats.stats('raf').value(); }
    get entities() { return this.stats.stats('te').value(); }
    get renderCalls() { return this.scene.renderer.info.render.calls; }
    get vertices() { return this.scene.renderer.info.render.vertices; }
    get faces() { return this.scene.renderer.info.render.faces; }

    getSnapshot() {
        return {
            fps: this.fps,
            raf: this.raf,
            entities: this.entities,
            memory: this.scene.renderer.info.memory,
            render: this.scene.renderer.info.render,
        }
    }

    startTest() {
        this.testInProgress = true;
        this.testTimeline.play();
    }

    stopTest() {
        this.testInProgress = false;
        this.testTimeline.pause();

        localStorage.setItem('benchmark.cubes', JSON.stringify(this.snapshots));
        this.snapshots.forEach((v) => {
            v.fps = v.fps.toFixed(2);
            v.raf = v.raf.toFixed(2);
        });
        console.log(this.snapshots);
    }

    // Benchmark timeline frames
    timelineFrames = [
        {
            duration: 40,
            begin: () => {
                for (let i=0; i<20; i++) {
                    this.addObject();
                }
            }
        }
    ]

    addObject() {
        var position = new THREE.Vector3(
            _.random(-10, 10),
            _.random(-10, 10),
            _.random(-10, 10)
        );

        $('<a-box>').attr({
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
            console.log('Saved', snap);
        }

        if (this.fps < FPS_UNSTABLE) {
            this.stopTest();
            return;
        }
    }

    _timelineFramesAfter = [
        {
            offset: '-=30',
            duration: 40,
            begin: this.checkFps.bind(this),
        }
    ]

    getTimeline() {
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
