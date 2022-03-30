import http from '../apis/http'

export function fetchLogin(params:any){
  return params
  // return http.post('/login',params)
}

export function fetchTest(){
  return true
  // return http.post('/test')
}
export function fetchHome(){
  return true
  // return http.post('/home')
}
export function fetchCesium(){
  return true
  // return http.post('/cesium')
}