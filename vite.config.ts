import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium';
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
// 配置别名需要的路径模块
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium(), eslintPlugin({
    include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue']
  })],
  base: './',
  // 配置别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'public')
    },
    extensions: [".js", ".ts", ".tsx", ".jsx"],
  },
  server: {
    cors: true,
    open: true,
    host: '0.0.0.0',
    port: 3015,
    proxy: {
      '/map': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/map/, '')
      },
      // '/cesiumtif': {
      //   target: 'http://localhost:8080/geoserver/cesium/wms',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/cesiumtif/, '')
      // }
    }
  },
  css: {
    // css预处理器
    preprocessorOptions: {
      scss: {
        charset: false,
        //需要在assets下创建对应的文件global.scss
        // additionalData: '@import "./src/assets/style/global.scss";',
      },
    },
  }
})
