<template>
  <view>
    <view>
      <text>单价：</text> <text>{{price}}￥</text>
    </view>
    <view>
      <view @click="handelClick('reduce')">-</view>
      <text>个数：</text><text>{{total}}</text>
      <view @click="handelClick('add')">+</view>
    </view>
    <view><text>总价：</text><text>{{totalPrice}}￥</text></view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        total: 1,
        price: 998
      }
    },
    computed:{
      totalPrice() {
        return this.total * this.price
      }
    },
    methods: {
      handelClick(type) {
        if (type === 'reduce') {
          if (this.total === 1) {
            弹窗提示不能少于1
          } else {
            this.total--
          }
        } else {
          if ('判断商品库存') {
            超出库存提示存量不够
          } else {
            this.total++
          }
        }
      }
    },
  }
</script>


