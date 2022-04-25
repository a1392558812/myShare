export default {
  leftSidebarW: {
    type: String,
    default: '300px'
  },
  ifLarger: {
    type: Boolean,
    default: true
  },
  ifShowMenu: {
    type: Boolean,
    default: true
  },
  toggleMenu: {
    type: Function,
    default: () => {}
  },
  headerH: {
    type: String,
    default: '70px'
  }
}
