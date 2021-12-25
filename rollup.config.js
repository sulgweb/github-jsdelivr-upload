import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import prettier from 'rollup-plugin-prettier'

import {
  eslint
} from "rollup-plugin-eslint"
import {
  terser
} from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts', // 打包入口
  output: [{
    file: pkg.main,
    format: 'cjs',
    name: 'index'
  }, ],
  plugins: [ // 打包插件
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true
    }),
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    eslint(),
    typescript(), // 解析TypeScript
    prettier(),
    resolve(), // 查找和打包node_modules中的第三方模块
    terser(), // 压缩js文件
  ]
};