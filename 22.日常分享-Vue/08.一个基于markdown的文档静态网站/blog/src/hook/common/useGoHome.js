import { useRoute, useRouter } from 'vue-router'
export default (emit) => {
  const route = useRoute()
  const router = useRouter()
  return {
    goHome: () => {
      if (route.path === '/') {
        location.replace(location.href.replace(location.hash, `#${route.path}`))
        setTimeout(() => {
          emit('refreshView')
        }, 0)
      } else {
        router.push('/')
      }
    }
  }
}
