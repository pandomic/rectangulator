const esbuild = require('esbuild');
const path = require('path');

const CopyPlugin = require('esbuild-plugin-copy').default;
const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');

const CURRENT_ENV = process.env.NODE_ENV || 'development';
const BUILD_PATH = path.join(__dirname, 'dist');

const watch = CURRENT_ENV === 'development';

const sharedOptions = {
  outdir: BUILD_PATH,
  bundle: true,
  watch,
  minify: !CURRENT_ENV.includes('development'),
  external: ['electron', 'cpu-features'],
  sourcemap: true,
  metafile: true,
  define: {
    // Define replacements for env vars starting with `REACT_APP_`
    ...Object.entries(process.env).reduce(
      (memo, [name, value]) => name.startsWith('REACT_APP_') ?
        { ...memo, [`process.env.${name}`]: JSON.stringify(value) } :
        memo,
      {},
    ),
    global: 'window',
  },

};

const mainOptions = {
  ...sharedOptions,
  entryPoints: [
    path.join(__dirname, 'src', 'main.ts'),
    path.join(__dirname, 'src', 'preload.ts'),
  ],
  platform: 'node',
  target: 'es2020',
};

const rendererOptions = {
  ...sharedOptions,
  entryPoints: [
    path.join(__dirname, 'src', 'renderer.tsx'),
  ],
  platform: 'browser',
  target: 'es2015',
  format: 'iife',
  inject: [path.join(__dirname, 'esbuild.shims.js')],
  external: [...sharedOptions.external, '*.woff', '*.woff2'],
  define: {
    ...sharedOptions.define,
    global: 'window',
  },
  plugins: [
    CopyPlugin({
      copyOnStart: true,
      // https://github.com/LinbuduLab/nx-plugins/issues/57
      assets: [
        {
          from: ['./public/*'],
          to: ['./'],
        },
        {
          from: ['./public/datasets/*'],
          to: ['./datasets/'],
        },
        {
          from: ['./src/resources/binaries/*'],
          to: ['./binaries/'],
        },
        {
          from: ['./node_modules/@fontsource/roboto/files/*'],
          to: ['./files/'],
        },
      ],
    }),
    NodeModulesPolyfillPlugin(),
  ],
};

Promise.all([
  esbuild.build(mainOptions),
  esbuild.build(rendererOptions),
]).then(() => {
  console.log('Done building, now watching...');
});
