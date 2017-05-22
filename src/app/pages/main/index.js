// import SceneController from './scene.controller';
//
// $(() => {
//     var scene = new SceneController();
// });

export default {
    template: require('./template.pug')(),
    data() {
        return {
            foo: 'bar',
        }
    },
    created() {
        console.log('created', this, this.foo);
    },
    mounted() {
        console.log('mounted', this, this.foo);
    }
}
