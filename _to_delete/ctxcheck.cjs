const { parse, compileScript } = require('@vue/compiler-sfc')
const fs = require('fs')
const files = process.argv.slice(2)
for (const f of files) {
  const { descriptor } = parse(fs.readFileSync(f, 'utf8'), { filename: f })
  const out = compileScript(descriptor, { id: 'x', inlineTemplate: true })
  const ids = [...new Set([...out.content.matchAll(/_ctx\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]))].sort()
  console.log(f, '→', ids.join(', ') || '(none)')
}
