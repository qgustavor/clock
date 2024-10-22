import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'

export default [
  ...neostandard({
    ignores: ['dist', 'node_modules']
  }),
  ...pluginVue.configs['flat/recommended']
]
