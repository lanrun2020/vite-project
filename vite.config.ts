import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium';
import vue from '@vitejs/plugin-vue'
// 配置别名需要的路径模块
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
  // 配置别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'public')
    }
  },
  server: {
    cors: true,
    open: false,
    host: '0.0.0.0',
    port: 3015,
    proxy: {}
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
