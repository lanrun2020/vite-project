import axios from 'axios'
import { ElMessage } from 'element-plus'
import { el } from 'element-plus/lib/locale'
import store from '../store/index'
const http = axios.create()
//请求拦截
http.interceptors.request.use(
  (config: object) => {
    const { baseURL } = store.getters
    config = { ...config, baseURL, timeout: 300000 }
    return config
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

//响应拦截
http.interceptors.response.use(
  (response: any) => {
    if (response.data.code === '200') {
      return response.data.data
    } else {
      ElMessage.error(response.data.message ? response.data.message : '接口异常')
    }
  },
  (error: Error) => {
    ElMessage.error('请求失败')
    return Promise.reject(error)
  }
)

export default http