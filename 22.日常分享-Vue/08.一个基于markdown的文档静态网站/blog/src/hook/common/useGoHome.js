import { useRouter } from 'vue-router'
export default (emit) => {
  const router = useRouter()
  return {
    goHome: () => {
      router.push('/')
      emit('refreshView')
    }
  }
}
