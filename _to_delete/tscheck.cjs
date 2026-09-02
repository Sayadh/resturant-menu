const ts = require('typescript')
const path = require('path')
const root = process.cwd()
const files = ['data/badges.ts','data/menu.ts','models/types.ts','services/_api-map.ts','data/demoMenu.ts','data/themeCatalog.ts','composables/useLandingI18n.ts','composables/useAdminI18n.ts'].map(f => path.join(root,f))
const options = {
  noEmit: true, strict: true, skipLibCheck: true,
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  baseUrl: root, paths: { '~/*': ['./*'], '@/*': ['./*'] },
  types: [],
}
const program = ts.createProgram(files, options)
const diags = ts.getPreEmitDiagnostics(program).filter(d => {
  const f = d.file && d.file.fileName || ''
  return f.includes('/resturant-menu/frontend/') && !f.includes('node_modules')
})
if (!diags.length) { console.log('TYPECHECK CLEAN for', files.length, 'files'); process.exit(0) }
for (const d of diags) {
  const { line, character } = d.file.getLineAndCharacterOfPosition(d.start)
  console.log(`${path.relative(root, d.file.fileName)}:${line+1}:${character+1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`)
}
