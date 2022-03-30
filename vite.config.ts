import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),cesium()],
  base:'',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'public')
    }
    // 导入时想要省略的扩展名列表。注意，不 建议忽略自定义导入类型的扩展名（例如：.vue），因为它会影响 IDE 和类型支持。
    // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser' // 混淆器
  },
  server: {
    cors: true,
    open: false,
    host: '0.0.0.0',
    port: 3000,
    proxy: {}
  }
})


