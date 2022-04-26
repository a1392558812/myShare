module.exports = {
  root: true,

  env: {
    node: true,
    jquery: true
  },

  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-v-model-argument': 0
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
