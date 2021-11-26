<template>
  <div>
    <test5 v-for="item in 10" :key="item">
      <template v-slot:header>
        <p>1--{{item}}</p>
      </template>
      <template v-slot:content>
        <p>2--{{item}}</p>
      </template>
    </test5>
  </div>
</template>

<script>
  import test5 from "./test5";
  export default {
    components: {
      test5
    }
  }
</script>


