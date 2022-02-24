import { createApp } from 'vue'
export default function createLoadingLikeDirective (Comp) {
  let instance
  return {
    mounted (el, binding) {
      const app = createApp(Comp, { showModal: binding.value })
      instance = app.mount(document.createElement('div'))
      el.instance = instance
      if (binding.value) {
        append(el)
      }
    },
    updated (el, binding) {
      if (binding.value !== binding.oldValue) {
        instance.setShowModal(binding.value)
      }
    },
    unmounted (el, binding) {
      remove(el)
    }
  }
  function append (el) {
    el.appendChild(el.instance.$el)
  }
  function remove (el) {
    el.removeChild(el.instance.$el)
  }
}
