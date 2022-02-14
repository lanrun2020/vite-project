import axios from 'axios'
import store from '../store'
const http = axios.create()
//请求拦截
http.interceptors.request.use(
  (config:any) => {
    const { baseUrl } = store.getters
    config = { ...config, baseUrl, timeout:300000 }
    return config
  },
  (error:Error)=>{
    return Promise.reject(error)
  }
)

//响应拦截
http.interceptors.response.use(
  (response:any)=>{
    const res = response.data
    return res.data
  },
  (error:Error)=>{
    return Promise.reject(error)
  }
)
export default http