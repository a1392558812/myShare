<template>
  <div ref="target" style="z-index: 1" class="relative cell list-cell">
    <div class="relative width100 height100 flex align-items-center justify-content-space-between">
      <div class="relative">
        <div class="input relative">
          <svg class="icon absolute align-center-y" style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3269"><path d="M416 192C537.6 192 640 294.4 640 416S537.6 640 416 640 192 537.6 192 416 294.4 192 416 192M416 128C256 128 128 256 128 416S256 704 416 704 704 576 704 416 576 128 416 128L416 128zM832 864c-6.4 0-19.2 0-25.6-6.4l-192-192c-12.8-12.8-12.8-32 0-44.8s32-12.8 44.8 0l192 192c12.8 12.8 12.8 32 0 44.8C851.2 864 838.4 864 832 864z" p-id="3270"></path></svg>
          <input
            class="search-input"
            v-model="inputValue"
            @focus="ifShowSearchDropDown = true"
            type="text">
        </div>
        <ul class="absolute drop-down" v-if="searchResult.length && ifShowSearchDropDown">
          <li
            class="cursor-pointer drop-down-item"
            :class="item.goSearch ? 'flex align-items-center justify-content-center more-content' : ''"
            v-for="item in searchResult"
            @click="goToDetail(item)"
            :key="item">{{item.name}}</li>
        </ul>
      </div>
      <commonm-btn @click="search">搜索</commonm-btn>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { debouncedWatch, onClickOutside } from '@vueuse/core'
import commonmBtn from '@/components/button'
import { useRouter } from 'vue-router'
export default {
  name: 'left-sidebar-search',
  components: {
    commonmBtn
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    toggleMenu: {
      type: Function,
      default: () => {}
    }
  },
  setup (props, { emit }) {
    const inputValue = ref('')
    const searchResult = ref([])
    const router = useRouter()
    const target = ref(null)
    const ifShowSearchDropDown = ref(false)
    const goToDetail = (item) => {
      console.log('item', item)
      if (item.noResult) return
      if (item.goSearch) return search()
      router.push({
        path: '/',
        query: { indexPage: item.indexPage }
      })
      emit(item.link ? 'searchLinkClick' : 'searchItemClick', item.link ? item.link : item.url)
    }
    const search = () => {
      props.toggleMenu(false)
      router.push({ path: '/search', query: { key: encodeURI(inputValue.value) ? inputValue.value : '' } })
    }
    onClickOutside(target, (event) => { ifShowSearchDropDown.value = false })
    debouncedWatch(
      inputValue,
      () => {
        if (inputValue.value === '') {
          searchResult.value = []
          return
        }
        let limtNum = 5
        const searchArr = []
        const filter = (arr) => {
          if (arr.children && limtNum) {
            for (let index = 0; index < arr.children.length; index++) {
              if (!limtNum) break
              if (arr.children[index].children) {
                filter(arr.children[index])
                break
              }
              if (arr.children[index] &&
                arr.children[index].name &&
                arr.children[index].name.trim().toLowerCase().indexOf(inputValue.value.trim().toLowerCase()) !== -1) {
                limtNum--
                console.log(limtNum)
                searchArr.push(arr.children[index])
              }
            }
          }
        }
        for (let index = 0; index < props.list.length; index++) {
          if (!limtNum) break
          filter(props.list[index])
        }
        if (searchArr.length) {
          if (searchArr.length >= 5) {
            searchArr.push({ name: '更多....', goSearch: true })
          }
          searchResult.value = searchArr
        } else {
          searchResult.value = [{ name: '暂无搜索结果', noResult: true }]
        }
      },
      { debounce: 600 }
    )
    return {
      inputValue,
      target,
      searchResult,
      ifShowSearchDropDown,
      goToDetail,
      search
    }
  }
}
</script>

<style scoped lang="scss">
.drop-down{
  padding: 5px;
  width: calc(100% + 4em);
  border: 1px solid #eee;
  border-radius: 5px;
  background: white;
  top: 2em;
  .drop-down-item{
    background: white;
    font-weight: normal;
    font-size: 16px;
    padding: 5px 10px;
    &:hover{
      color: #00aa88;
    }
  }
  .more-content{
    font-size: 14px;
  }
}
.search-input{
  display: block;
  margin-right: 1.5em;
  padding: 5px 8px 5px 2.3em;
  width: 165px;
  border-radius: 6000px;
  border: none;
  outline: 1px solid #454545;
  &:focus-visible{
    outline: 1px solid #00aa88;
  }
}
.icon{
  left: 0.4em;
}
</style>
