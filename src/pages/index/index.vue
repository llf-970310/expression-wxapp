<template>
    <view class="page page-index">
        <view class="logo">
            <image class="img" :src="logo" />
        </view>
        <view class="page-title">表达能力评测 - 快来测试一下吧</view>
        <view class="module-list">
            <view
                v-for="(item, index) in list"
                :key="index"
                class="module-list__item"
                @tap="jumpTo(item.id)"
            >
                <view class="module-list__icon">
                    <image :src="item.icon" class="img" mode="widthFix" />
                </view>
                <view class="module-list__info">
                    <view class="title">{{ item.title }}</view>
                    <view class="content">{{ item.content }}</view>
                </view>
                <view class="module-list__arrow">
                    <text class="at-icon at-icon-chevron-right" />
                </view>
            </view>
        </view>

        <view style="width: 50%; margin: 0 auto; margin-top: 50px">
            <AtButton type="primary" circle :onClick="loginTmp">登录</AtButton>
        </view>

        <view style="width: 50%; margin: 0 auto; margin-top: 50px">
            <AtButton
                type="primary"
                circle
                :onGetUserInfo="getUserInfoCallback"
                openType="getUserInfo"
            >微信登录</AtButton>
        </view>
    </view>
</template>

<script>
import "./index.scss";
import api from "../../util/api.js";
import Taro from "@tarojs/taro";

import logo from "../../assets/images/logo.png";
import iconExam from "../../assets/images/icon-exam.png";
import iconHistory from "../../assets/images/icon-history.png";
import iconInfo from "../../assets/images/icon-info.png";

const list = [
    {
        id: "new_test",
        title: "新测试",
        content: "开始一次新的表达力评测",
        icon: iconExam
    },
    {
        id: "history_score",
        title: "历史成绩",
        content: "查看历史评测成绩及相应评测报告",
        icon: iconHistory
    },
    {
        id: "info",
        title: "个人信息",
        content: "查看并修改个人信息",
        icon: iconInfo
    }
];
export default {
    data() {
        return {
            logo,
            list
        };
    },
    methods: {
        jumpTo(id) {
            if (id == "new_test") {
                this.$taro.navigateTo({
                    url: `/pages/exam/index`
                });
            } else if (id == "history_score") {
                this.$taro.navigateTo({
                    url: `/pages/result/history/index`
                });
            } else if (id == "info") {
                this.$taro.navigateTo({
                    url: `/pages/user/index`
                });
            }
        },

        getUserInfoCallback(e) {
            /*
            detail:
                encryptedData: "d/AbjrjYHEJS4fyJIgYtM8ZFFJDNr8FcPvyt60KMmHipnNCm7E9bcQndu3P1cOe4v53Gy4fpmuRQRQI+Tss2C6wATd6FOTTPJ9x+C4Uinkce6QINOb2TGesneWGzlxYW+8RHPQZHuZBSMrMl/CcbhBvnTGPgY+vpmXVl5Oeq0ZKuYmT7BXyzF6LVhH7yM0ioEZVy/ur5ZyRaKfRCqmCPX6MQCKhjHm1XkX2KX6E5OCt3CoNAj04TVDdpN8XI3HHyQvuxZxoxmufjg8pR/PxVQ6ofVb0fbGSCgELAaLZJw8GH5L8zPY0IS5gwrvgNYAHQWAs272ZC2CTLu6+WmbfQaC1MZ2WTv+3AYFFqC7vAMpRV+AhBzEP5jdaUg3M6/O/T44lSbEpjhsbHg/fcttT2U1xZpPmeWnQNioi31z4lbID6tu2hRRQ0Rsqya1feKKNTkQ1nQBeDm1vXR9Q7IR4tKQTSdVyS0aboU6dt6hNI3UU="
                errMsg: "getUserInfo:ok"
                iv: "BU96og+pNzzLF/CaTsvHPA=="
                rawData: "{"nickName":"Lifehacker","gender":1,"language":"zh_CN","city":"Nanjing","province":"Jiangsu","country":"China","avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKoe8p7cxHxyHeFsaOg9sttpia0TrGpRZBia5bsDnKgM01v6gv5bTj2z3NkfLwXCt8Gs2lOWtPtQa9g/132"}"
                signature: "f7a69012320777a8422e90089dae37d6f7ee5b1a"
                userInfo:
                    avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKoe8p7cxHxyHeFsaOg9sttpia0TrGpRZBia5bsDnKgM01v6gv5bTj2z3NkfLwXCt8Gs2lOWtPtQa9g/132"
                    city: "Nanjing"
                    country: "China"
                    gender: 1
                    language: "zh_CN"
                    nickName: "Lifehacker"
                    province: "Jiangsu"
            */
            if (e.detail.userInfo) {
                Taro.setStorageSync("userInfo", e.detail.userInfo);
                Taro.login({
                    success: function(res) {
                        if (res.code) {
                            api.post("/api/auth/wxapp/login", {
                                code: res.code,
                                nick_name: e.detail.userInfo.nickName
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
                console.log("用户拒绝授权");
            }
        },

        loginTmp() {
            api.post("/api/auth/login", {
                username: "lf97310@gmail.com",
                password: "123456"
            }).then(res => {
                console.log(res);
            });
        }
    }
};
</script>