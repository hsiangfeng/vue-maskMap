<template>
  <div class="home">
    <VueLeaflet/>
  </div>
</template>

<script>
// @ is an alias to /src
import VueLeaflet from '@/components/VueLeaflet.vue';

export default {
  name: 'home',
  components: {
    VueLeaflet,
  },
};
</script>
