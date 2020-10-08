import Vue from 'vue'
import './app.scss'

import Taro from '@tarojs/taro'
import TaroUiVue from 'taro-ui-vue/src'
import 'taro-ui-vue/dist/style/index.scss'

import DocsHeader from './components/DocsHeader.vue'
import api from "./util/api.js";

Vue.prototype.$taro = Taro
Vue.component('DocsHeader', DocsHeader)
Vue.use(TaroUiVue)


const App = new Vue({
    render(h) {
        // this.$slots.default 是将要会渲染的页面
        return h('block', this.$slots.default)
    },

    created() {
        Taro.getSetting({
            success: function (res) {
                if (res.authSetting["scope.userInfo"]) {
                    console.log("已授权");
                    Taro.login({
                        success: function (res) {
                            if (res.code) {
                                api.post("/api/auth/wxapp/login", {
                                    code: res.code,
                                    nick_name: ""
                                }).then(res => {
                                    if (res.data.code == 0) {
                                        Taro.setStorageSync(
                                            "cookie",
                                            res.header["Set-Cookie"]
                                        );
                                    }
                                });
                            } else {
                                console.log("登录失败！" + res.errMsg);
                            }
                        }
                    });
                } else {
                    console.log("未授权");
                }
            }
        });
    }
})

export default App


