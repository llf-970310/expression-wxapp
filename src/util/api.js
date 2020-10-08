import Taro from '@tarojs/taro'
import { HTTP_STATUS } from './status'
import { config } from './config'

export default {
    baseOptions(params, method = 'GET') {
        let { url, data } = params
        console.log('params', params)
        let contentType = 'application/x-www-form-urlencoded'
        contentType = params.contentType || contentType
        const option = {
            // url: url.indexOf('http') !== -1 ? url : config.requestUrl + url,
            url: url,
            data: data,
            method: method,
            header: {
                'content-type': contentType,
                // 'Authorization': Taro.getStorageSync('Authorization'),
                'Cookie': Taro.getStorageSync('cookie'),
            },
            success(res) {
                console.log('res', res)
                if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
                    return console.log('请求资源不存在')
                } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
                    return console.log('服务端出现了问题')
                } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
                    Taro.setStorageSync('Authorization', '')
                    let path = ""
                    if (path !== 'pages/login/login') {
                        Taro.navigateTo({
                            url: '/pages/login/login'
                        })
                    }
                    return console.log('没有权限访问')
                } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
                    Taro.setStorageSync('Authorization', '')
                    let path = ""
                    if (path !== 'pages/login/login') {
                        Taro.navigateTo({
                            url: '/pages/login/login'
                        })
                    }
                    return console.log('需要鉴权')
                } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
                    return res.data
                }
            },
            fail(e) {
                console.log('请求接口出现问题', e)
            }
        }
        return Taro.request(option)
    },
    get(url, data = '') {
        let option = { url, data }
        return this.baseOptions(option)
    },
    post: function (url, data, contentType) {
        let params = { url, data, contentType }
        return this.baseOptions(params, 'POST')
    },
    put(url, data = '') {
        let option = { url, data }
        return this.baseOptions(option, 'PUT')
    },
    delete(url, data = '') {
        let option = { url, data }
        return this.baseOptions(option, 'DELETE')
    }
}