const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');
const pkg = require('./package.json');

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['dist/*']));

// Compile source code into a distributable format with Babel

['es', 'cjs', 'umd']
  .forEach((format) => {
    promise = promise.then(() => rollup.rollup({
      input: 'src/index.ts',
      external: Object.keys(pkg.dependencies),
      plugins: [
        resolve(),
        typescript({module: 'CommonJS'}),
        babel(Object.assign(pkg.babel, {
          babelrc: false,
          exclude: 'node_modules/**',
          externalHelpers: false,
          runtimeHelpers: true,
          presets: pkg.babel.presets.map(x => (x === 'latest' ? ['latest', { es2016: { modules: false } }] : x)),
        })),
        commonjs({ extensions: ['.ts', '.js'] }),
      ],
    }))
    .then(bundle => bundle.write({
      file: `dist/${format === 'cjs' ? 'index' : `index.${format}`}.js`,
      format,
      sourcemap: true,
      name: format === 'umd' ? pkg.name : undefined,
    }));
});

// Copy package.json and LICENSE.txt
// promise = promise.then(() => {
//  delete pkg.private;
//  delete pkg.devDependencies;
//  delete pkg.scripts;
//  delete pkg.eslintConfig;
//  delete pkg.babel;
//  // fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
//  // fs.writeFileSync('dist/LICENSE.txt', fs.readFileSync('LICENSE.txt', 'utf-8'), 'utf-8');
// });

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
