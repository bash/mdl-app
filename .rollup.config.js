import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify-es'
import commonjs from 'rollup-plugin-commonjs'

const isProduction = process.env['BUILD_MODE'] === 'release'

const plugins = [
  commonjs({ include: 'node_modules/**' }),
  babel(),
  resolve({ jsnext: true, modulesOnly: true }),
  uglify({ compress: true, mangle: false }),
]

export default {
  plugins,
  sourceMap: !isProduction,
  format: 'iife'
}
