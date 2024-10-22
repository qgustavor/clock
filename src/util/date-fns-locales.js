const locales = import.meta.glob('./../../node_modules/date-fns/locale/[a-z][a-z].js', {
  import: 'default'
})
const remappedLocales = Object.fromEntries(Object.entries(locales).map(e => [
  e[0].match(/\/([a-z]{2})[^/]*\.js$/i)[1],
  e[1]
]))
export default remappedLocales
