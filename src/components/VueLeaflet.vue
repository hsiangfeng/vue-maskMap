<template>
  <div class="vue-leaflet">
    <loading :active.sync="isLoading"></loading>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-4 areaSelect bg-init">
          <div class="bg-select p-3 areaSelect__select">
            <div class="h5">{{ nowTime }}</div>
            <div class="h3 text-center">{{ dateNunber }}購買日</div>
            <form class="areaSelect__select__list">
              <div class="form-group mb-0 pb-3 bg-select">
                <label for="cityControlSelect">請選擇縣市</label>
                <select class="form-control" id="cityControlSelect" v-model="selectCity.cityName">
                  <option value selected>--請選擇縣市--</option>
                  <option
                    v-for="(item, index) in county"
                    :key="index"
                    :value="item.CityName"
                  >{{ item.CityName }}</option>
                </select>
              </div>
              <div class="form-group bg-select" v-if="selectCity.cityName">
                <label for="areaFormControlSelect">請選擇區域</label>
                <select
                  class="form-control"
                  id="areaFormControlSelect"
                  v-model="selectCity.areaName"
                  @change="updateSelect"
                >
                  <option value selected>--請選擇區域--</option>
                  <option
                    v-for="(item, index) in county.find((item) => item.CityName === selectCity.cityName).AreaList"
                    :key="index"
                  >{{ item.AreaName }}</option>
                </select>
              </div>
            </form>
            <div class="h5" v-if="this.selectCity.pharmacies.length">
              共查詢到 {{ this.selectCity.pharmacies.length }} 間
            </div>
            <div class="h5" v-else>
              請選擇縣市及區域。
            </div>
          </div>
          <div class="list-group">
            <a
              href="#"
              class="list-group-item list-group-item-action rounded mb-3"
              v-for="(item,index) in selectCity.pharmacies"
              @click="foucsData(item)"
              :key="index"
            >
              <div class="d-flex w-100 justify-content-between">
                <h4 class="mb-1"><i class="fas fa-prescription-bottle-alt"></i> {{ item.properties.name }}</h4>
                <small>更新時間：{{ item.properties.updated }}</small>
              </div>
              <div class="mask">
                <div
                  class="mask__list"
                  :class="item.properties.mask_adult === 0 ? 'bg-secondary' : 'bg-info'"
                >
                  <div class="h6"><i class="fas fa-male"></i> 成人口罩</div>
                  <div class="mask__list__number">
                    目前剩餘
                    <span class="mask--fontSize">{{ item.properties.mask_adult }}</span> 個
                  </div>
                </div>
                <div
                  class="mask__list"
                  :class="item.properties.mask_child === 0 ? 'bg-secondary' : 'bg-success'"
                >
                  <div class="h6"><i class="fas fa-child"></i> 兒童口罩</div>
                  <div class="mask__list__number">
                    目前剩餘
                    <span class="mask--fontSize">{{ item.properties.mask_child }}</span> 個
                  </div>
                </div>
              </div>
              <p class="mb-1">地址：{{ item.properties.address }}</p>
              <p class="mb-1">
                聯絡電話：
                <a :href="`tel:${item.properties.phone}`">{{ item.properties.phone }}</a>
              </p>
              <small>{{ item.properties.note }}</small>
            </a>
          </div>
        </div>
        <div class="col-md-8">
          <l-map style="width: 100%; height: 100vh;" :zoom="leaflet.zoom" :center="leaflet.center">
            <l-tile-layer :url="leaflet.url" :attribution="leaflet.attribution"></l-tile-layer>
            <l-marker :lat-lng="leaflet.marker"></l-marker>
          </l-map>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import {
  LMap, LTileLayer, LMarker,
} from 'vue2-leaflet';

export default {
  name: 'VueLeaflet',
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      isLoading: false,
      leaflet: {
        zoom: 18,
        center: L.latLng(23.8759391, 120.588669),
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(23.8759391, 120.588669),
      },
      pharmacies: [],
      county: [],
      selectCity: {
        cityName: '',
        areaName: '',
        pharmacies: [],
      },
      nowTime: '',
      dateNunber: '',
    };
  },
  methods: {
    getData() {
      const vm = this;
      const axios = vm.$http;
      this.isLoading = true;
      axios.get(process.env.VUE_APP_AREA)
        .then((res) => {
          vm.county = res.data;
          return axios.get(process.env.VUE_APP_APIPATH);
        }).then((res) => {
          vm.pharmacies = res.data.features;
          this.isLoading = false;
        });
    },
    removeMarker() {
      this.leaflet.marker = L.latLng(25.02271, 121.528509);
      this.selectCity.pharmacies = [];
    },
    updateSelect() {
      this.removeMarker();

      // 篩選區域
      this.pharmacies.forEach((item) => {
        if (item.properties.county === this.selectCity.cityName && item.properties.town === this.selectCity.areaName) {
          this.selectCity.pharmacies.push(item);
        }
      });

      // 移動到該區塊
      const lat = this.selectCity.pharmacies[0].geometry.coordinates[1];
      const lng = this.selectCity.pharmacies[0].geometry.coordinates[0];
      this.leaflet.center = L.latLng(lat, lng);
    },
    foucsData(data) {
      this.leaflet.marker = L.latLng(data.geometry.coordinates[1], data.geometry.coordinates[0]);
      this.leaflet.center = L.latLng(data.geometry.coordinates[1], data.geometry.coordinates[0]);
      this.leaflet.zoom = 18;
    },
    getNowDate() {
      const time = new Date();
      const year = time.getFullYear();
      const month = time.getMonth() + 1;
      const day = time.getDate() + 1;
      const week = time.getDay();
      const dateList = ['日', '一', '二', '三', '四', '五', '六'];
      if (week === 1 || week === 3 || week === 5) {
        this.dateNunber = '奇數';
      } else if (week === 2 || week === 4 || week === 6) {
        this.dateNunber = '偶數';
      } else {
        this.dateNunber = '都可以買';
      }
      this.nowTime = `${year}.${month}.${day} 星期${dateList[week]}`;
    },
  },
  async created() {
    await this.getData();
    await this.getNowDate();
  },
};
</script>

<style lang="scss">
.bg-init {
  background-color: #f7f7f7;
}
.bg-select {
  background-color: #8ac1c4;
}

.areaSelect {
  height: 100vh;
  overflow: auto;
  &__select {
    margin-bottom: 10px;
    color: white;
    font-weight: 600;
    &__list {
      background: white;

    }
  }
}
.mask {
  display: flex;
  &__list {
    width: 50%;
    margin: 25px 5px 25px 0px;
    color: white;
    padding: 15px;
    border-radius: 10px;
    &:nth-child(2) {
      margin-right: 0px;
    }
  }
  &--fontSize {
    font-size: 24px;
  }
}
</style>
