<template>
    <view class="page page-index">
        <DocsHeader title="个人信息" />
        <AtToast :text="toastText" hasMask :isOpened="toastShow" status="error"></AtToast>
        <AtToast text="正在加载..." hasMask :isOpened="dataLoading" status="loading"></AtToast>

        <AtAvatar class="avatar" size="large" circle :image="userInfo.avatarUrl" />
        <view class="content">
            <view class="list_view">
                <view class="list">
                    <view class="list_title">昵称</view>
                    <view
                        class="list_content"
                    >{{userInfo.nickName == null ? "--" : userInfo.nickName}}</view>
                </view>
                <view class="list">
                    <view class="list_title">注册时间</view>
                    <view
                        class="list_content"
                    >{{userInfo.registerTime == null ? "--" : userInfo.registerTime}}</view>
                </view>
                <view class="list">
                    <view class="list_title">上次登录时间</view>
                    <view
                        class="list_content"
                    >{{userInfo.lastLoginTime == null ? "--" : userInfo.lastLoginTime}}</view>
                </view>
                <view class="list">
                    <view class="list_title">剩余测试次数</view>
                    <view
                        class="list_content"
                    >{{userInfo.examNum == null ? "--" : userInfo.examNum}}</view>
                </view>
            </view>

            <view class="list_view">
                <view class="list" @tap="navigateToHistory">
                    <view class="list_title">历史成绩</view>
                    <AtIcon value="chevron-right" size="20" color="#7f7f7f" />
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import "./index.scss";
import api from "../../util/api.js";

export default {
    data() {
        return {
            toastText: "",
            toastShow: false,
            userInfo: {},
            dataLoading: true
        };
    },
    mounted() {
        this.getUserInfo();
    },
    methods: {
        navigateToHistory() {
            this.$taro.navigateTo({
                url: `/pages/result/history/index`
            });
        },

        getUserInfo() {
            this.userInfo = this.$taro.getStorageSync("userInfo");

            api.get("/api/account/info").then(res => {
                this.dataLoading = false;
                if (res.data.code != 0) {
                    this.toastText = res.data.msg;
                    this.toastShow = true;
                    setTimeout(() => {
                        this.$taro.redirectTo({
                            url: `/pages/index/index`
                        });
                    }, 1000);
                } else {
                    this.userInfo.registerTime = res.data.data.register_time;
                    this.userInfo.lastLoginTime = res.data.data.last_login_time;
                    this.userInfo.examNum = res.data.data.remaining_exam_num;
                }
            });
        }
    }
};
</script>