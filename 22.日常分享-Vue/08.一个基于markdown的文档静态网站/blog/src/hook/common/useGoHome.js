import { useRoute } from 'vue-router'
export default (emit) => {
  const route = useRoute()
  return {
    goHome: () => {
      location.replace(location.href.replace(location.hash, `#${route.path}`))
      setTimeout(() => {
        emit('refreshView')
      }, 0)
    }
  }
}
