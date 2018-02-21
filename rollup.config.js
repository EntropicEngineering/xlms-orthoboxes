import resolve from 'rollup-plugin-node-resolve';

export default {
  input: './dist/App.js',
  output: [{
    file: './dist/bundle.js',
    format: 'es'
  }],
  sourcemap: true,
  interop: false,
  plugins: [
    resolve()
  ]
};