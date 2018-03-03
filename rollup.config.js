import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
  resolve({
    browser: true,
    jsnext: true,
  }),
  commonjs({
    namedExports: {
      'react': ['Children', 'Component', 'createElement'],
      'react-dom': ['render', 'findDOMNode', 'unstable_batchedUpdates'],
      'kurento-client': ['kurentoClient']
    }
  }),
  builtins(),
  globals(),
];

const external = [
  'react',
  'react-dom',
  'mobx',
  'mobx-react',
];

export default [{
  input: './dist/peggy.js',
  output: [{
    format: 'es',
    file: './peggy_bundle.js',
    sourcemap: true,
    interop: false,
  }],
  plugins,
  // external
}, {
  input: './dist/pokey.js',
  output: [{
    format: 'es',
    file: './pokey_bundle.js',
    sourcemap: true,
    interop: false,
  }],
  plugins,
  // external
}, {
  input: './dist/XLMS_loader.js',
  output: [{
    format: 'es',
    file: './XLMS_loader_bundle.js',
    sourcemap: true,
    interop: false,
  }],
  plugins,
  // external
}];
