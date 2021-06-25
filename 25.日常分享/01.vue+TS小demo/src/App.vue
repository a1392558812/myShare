<template>
  <div id="app">
    <MenuBar/>
    <ItemList/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MenuBar from './components/MenuBar.vue'
import ItemList from './components/itemList.vue'
@Component({
  components: {
      MenuBar,
      ItemList
  },
})
export default class App extends Vue {}
</script>

<style>

</style>
