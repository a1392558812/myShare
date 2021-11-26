import Vue from 'vue';
import $ from 'jquery'
export default () => {
  Vue.directive('loading',{
    bind:function(el,binding){
      console.log('binding', binding)
      let div = $(`
      <div class='vloading-mask'>
        <div class="vloading-inner">加载中...</div>
      </div>`)[0]
      let posi = window.getComputedStyle(el,null).getPropertyValue('position');
      if(posi == "static" || posi == ""){
        el.style.position = "relative";
      }
      div.style.display="none";
      el.appendChild(div);
      el.loaddiv = div;
      if(binding.value == true){
        div.style.display="flex";
      }else {
        div.style.display="none";
      }
    },
    inserted:function(el){

    },
    update:function(el,binding){
      let posi = window.getComputedStyle(el,null).getPropertyValue('position');
      if(posi == "static"){
        el.style.position = "relative";
      }
      let div = el.loaddiv;
      if(binding.value == true){
        div.style.display="flex";
      }else {
        div.style.display="none";
      }
    },
    unbind:function(el){
      let div = el.loaddiv;
      el.removeChild(div);
      el.dataset.div = null;
    }
  })
}

