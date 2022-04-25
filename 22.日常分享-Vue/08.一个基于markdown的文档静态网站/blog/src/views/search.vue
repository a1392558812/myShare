<template>
  <div class="relative width100 height100 flex flex-direction-row">
    <layout-left-sidebar
      :leftSidebarW="leftSidebarW"
      :ifShowMenu="ifShowMenu"
      :ifLarger="ifLarger"
      :headerH="headerH"
      :toggleMenu="toggleMenu"/>
    <div class="width100 height100 flex flex-direction-column">
      <div class="search-title width100 flex align-items-center justify-content-center">
        <div class="flex align-items-baseline">
          <p style="margin-right: 10px">搜索结果</p>
          <p class="search-total">(共计{{searchResult.length}}条)</p>
        </div>
      </div>
      <ul class="search-content flex-1">
        <li
          class="search-item cursor-pointer"
          v-for="(item, index) in searchResult"
          @click="gotoDetails(item)"
          :key="index">{{item.name}}</li>
      </ul>
    </div>
  </div>
</template>

<script setup="props">
import { defineProps, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import list from '@/static/list.js'
import { renderList } from '@/common/methods'
import layoutLeftSidebar from '@/components/left-sidebar/left-sidebar'
import leftSidebarProps from '@/common/left-sidebar-props'
const allList = renderList(list)
defineProps(leftSidebarProps)
const searchResult = ref([])
const route = useRoute()
const router = useRouter()
let inputValue = decodeURI(route.query.key)
const gotoDetails = (item) => {
  if (item.noResult) return
  if (item.link) return window.open(item.link)
  router.push({
    path: '/',
    query: { indexPage: item.indexPage }
  })
}
const init = () => {
  inputValue = decodeURI(route.query.key)
  if (inputValue === '') {
    searchResult.value = [{ name: '请输入关键字', noResult: true }]
    return
  }
  const searchArr = []
  const filter = (arr) => {
    if (arr.children) {
      arr.children.forEach(item => {
        if (item.children) filter(item)
        if (item && item.name && !item.children) {
          (item.name.trim().toLowerCase().indexOf(inputValue.trim().toLowerCase()) !== -1) && searchArr.push(item)
        }
      })
    }
  }
  allList.forEach(filter)
  searchResult.value = searchArr.length ? searchArr : [{ name: '暂无搜索结果', noResult: true }]
}
onBeforeMount(init)
watch(route, (newV, oldV) => {
  if (newV.query.key !== inputValue) init()
})
</script>

<style scoped lang="scss">
.search-title{
  padding: 20px 0;
  font-size: 25px;
  border-bottom: 1px solid #eee;
  .search-total{
    font-size: 13px;
    color: #999999;
  }
}
.search-content{
  overflow-y: scroll;
  padding: 30px 10px;
  .search-item{
    font-size: 16px;
    padding: 10px 20px;
    &:hover{
      color: #42b983;
      text-decoration: underline;
    }
  }
}
</style>
