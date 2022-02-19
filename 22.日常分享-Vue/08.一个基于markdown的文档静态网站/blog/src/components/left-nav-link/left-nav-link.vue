<template>
  <div
    v-if="!ifLarger"
    :class="showNavLink ? 'translateX-0' : 'translateX-100'"
    class="absolute height100 bg-white left-nav-link">
    <commonNavLink
      @goHome="goHome"
      @toggleShowNavLink="toggleShowNavLink"
      :ifLarger="ifLarger"></commonNavLink>
  </div>
</template>

<script>
import commonNavLink from '@/components/common/nav-link'
import useGoHome from '@/hook/common/useGoHome'
export default {
  name: 'left-nav-link',
  components: {
    commonNavLink
  },
  props: {
    showNavLink: {
      type: Boolean,
      default: false
    },
    ifLarger: {
      type: Boolean,
      default: true
    },
    leftSidebarW: {
      type: String,
      default: '320px'
    }
  },
  setup (props, { emit }) {
    const { goHome } = useGoHome(emit)
    return {
      goHome,
      toggleShowNavLink: (state) => {
        emit('toggleShowNavLink', state)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.left-nav-link{
  width: v-bind(leftSidebarW);
  flex-shrink: 0;
  font-size: 16px;
  transition: transform 0.3s;
  border-right: 1px solid #eee;
  padding-left: 20px;
  box-sizing: content-box;
  z-index: 10;
}
</style>
