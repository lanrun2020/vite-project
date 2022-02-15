import Mock from 'mockjs'
import anSystem from './modules/an-system'

const mocks = [...anSystem]
const paramObj = (url: any) => {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace('/\+/g', ' ') +
    '"}'
  )
}

const XHR2RequestWrap = (response: any) => {
  return (options: any) => {
    let result
    if (response instanceof Function) {
      const { body, url } = options
      result = response({ body: JSON.parse(body), query: paramObj(url) })
    } else {
      result = response
    }
    return Mock.mock(result)
  }
}
//重写mock的send方法
Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
Mock.XHR.prototype.send = function() {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials || false
    if (this.responseType) {
      this.custom.xhr.responseType = this.responseType
    }
  }
  this.proxy_send(...arguments)
}

mocks.forEach(({ url, type, response }) => {
  Mock.mock(new RegExp(url), type, XHR2RequestWrap(response))
})
