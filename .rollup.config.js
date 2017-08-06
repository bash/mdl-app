import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify-es'

const isProduction = process.env['BUILD_TARGET'] === 'release'

const plugins = [
  babel(),
  resolve({ jsnext: true, modulesOnly: true }),
  uglify({ compress: true, mangle: true })
]

export default {
  plugins,
  sourceMap: !isProduction,
  format: 'iife'
}
