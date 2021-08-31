<!--<template #chart>
  <bar-chart :data="chartData" id="chart"></bar-chart>
  <test5></test5>
</template>-->
<template>
  <test6></test6>
</template>
<script>
  import test6 from "./components/test6";
export default {
  name: 'App',
  data() {
    return {
      chartData: [
        { title: '青铜', count: 200, color: 'red' },
        { title: '白银', count: 150, color: 'yellow' },
        { title: '黄金', count: 100, color: 'gray' },
        { title: '钻石', count: 80, color: 'green' },
        { title: '王者', count: 50, color: 'gold' }
      ]
    }
  },
  components:{
    test6
  }
}
</script>
