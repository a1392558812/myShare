<template>
  <div id="memos" class="container">
    <MemoItem :memo="item" v-for="item in aHelper.memoListArr" :key="item.id"/>
  </div>
</template>
<script lang="ts">
import {Vue,Component} from 'vue-property-decorator'
import MemoItem from './MemoItem.vue'
import {State} from 'vuex-class'
@Component({
    components:{
        MemoItem
    }

})
export default class ItemList extends Vue{
    @State private aHelper: any;
}
</script>
<style scoped lang=''>

</style>