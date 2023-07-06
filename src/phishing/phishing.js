import Vue from 'vue';
import Components from '@aeternity/aepp-components-3';
import App from './App';
import VueMeta from 'vue-meta';
import '@aeternity/aepp-components-3/dist/aepp.components.css';

global.browser = require('webextension-polyfill');

Vue.prototype.$browser = global.browser;

Vue.use(Components);
Vue.use(VueMeta);
export default new Vue({
  el: '#app',
  render: h => h(App),
});
