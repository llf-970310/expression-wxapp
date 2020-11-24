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
            url: url.indexOf('http') !== -1 ? url : config.requestUrl + url,
            data: data,
            method: method,
            header: {
                'content-type': contentType,
                'Authorization': Taro.getStorageSync('Authorization'),
                // 'Cookie': Taro.getStorageSync('cookie'),
            },
            success(res) {
                console.log('res', res)
                if (res.data.code === HTTP_STATUS.FORBIDDEN || res.data.code === HTTP_STATUS.AUTHENTICATE) {
                    Taro.setStorageSync('Authorization', '')
                }
                return res.data
            },
            fail(e) {
                console.log('请求接口出现问题', e)
                setTimeout(() => {
                    Taro.showToast({
                        title: "网络请求异常，请稍后重试",
                        icon: "none",
                        duration: 1500
                    });
                }, 3000);
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