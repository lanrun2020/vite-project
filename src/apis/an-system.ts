import http from '../apis/http'

export function fetchLogin(params:any){
  return http.post('/login',params)
}