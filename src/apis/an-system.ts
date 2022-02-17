import http from '../apis/http'

export function fetchLogin(params:any){
  return http.post('/login',params)
}

export function fetchTest(){
  return http.post('/test')
}
export function fetchHome(){
  return http.post('/home')
}
export function fetchCesium(){
  return http.post('/cesium')
}