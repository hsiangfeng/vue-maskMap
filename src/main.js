/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { Icon } from 'leaflet';
import Loading from 'vue-loading-overlay';
import App from './App.vue';
import router from './router';
import store from './store';

import 'vue-loading-overlay/dist/vue-loading.css';
import 'leaflet/dist/leaflet.css';

Vue.use(VueAxios, axios);
Vue.component('Loading', Loading);
// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
