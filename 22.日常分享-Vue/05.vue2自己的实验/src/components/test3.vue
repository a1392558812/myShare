<script>
  import test2 from "./test2";
  export default {
    name: "test3",
    data() {
      return{
        data: 666
      }
    },
    methods:{
      click() {
        alert(666)
        console.log('你好')
      }
    },
    render () {
      return <div>
        <p>你好啊</p>
        <p>你好啊</p>
        <test2 onClick={this.click}></test2>
        <p>你好啊</p>
        <p>{this.data}</p>
      </div>
    }
  }
</script>

<style scoped>

</style>
