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
            </view>

            <view class="list_view">
                <view class="list">
                    <view class="list_title">VIP 过期时间</view>
                    <view
                        class="list_content"
                    >{{userInfo.vipEndTime == null ? "--" : userInfo.vipEndTime}}</view>
                </view>
                <view class="list">
                    <view class="list_title">剩余测试次数</view>
                    <view
                        class="list_content"
                    >{{userInfo.examNum == null ? "--" : userInfo.examNum}}</view>
                </view>
                <view class="list" @tap="useInvitationCode">
                    <view class="list_title">使用邀请码</view>
                    <AtIcon value="chevron-right" size="20" color="#7f7f7f" />
                </view>
            </view>

            <view class="list_view">
                <view class="list" @tap="navigateToHistory">
                    <view class="list_title">历史成绩</view>
                    <AtIcon value="chevron-right" size="20" color="#7f7f7f" />
                </view>
            </view>

            <!-- <AtFloatLayout :isOpened="floatLayoutOpen" :onClose="onFloatClose">
                <AtForm>
                    <AtInput
                        type="text"
                        placeholder="请输入邀请码"
                        :value="invitationCode"
                        :onChange="handleInput"
                    >
                        <view style="width: 90px" :onClick="updatePrivilege">确定</view>
                    </AtInput>
                </AtForm>
            </AtFloatLayout>-->

            <AtModal :isOpened="isModelOpened">
                <AtModalContent>
                    <text>请输入邀请码：</text>
                    <AtInput
                        type="text"
                        :value="invitationCode"
                        :onChange="handleInput"
                        style="margin-left: 0"
                    ></AtInput>
                </AtModalContent>
                <AtModalAction>
                    <button @tap="closeModal">取消</button>
                    <button @tap="updatePrivilege">确定</button>
                </AtModalAction>
            </AtModal>
        </view>
    </view>
</template>

<script>
import "./index.scss";
import api from "../../util/api.js";
import Taro from "@tarojs/taro";

export default {
    data() {
        return {
            toastText: "",
            toastShow: false,
            userInfo: {},
            dataLoading: true,

            isModelOpened: false,
            invitationCode: ""
        };
    },
    mounted() {
        this.getUserInfo();
    },
    methods: {
        navigateToHistory() {
            this.$taro.navigateTo({
                url: `/subpackages/result/history/index`
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
                    this.userInfo.vipEndTime = res.data.data.vip_end_time;
                }
            });
        },

        closeModal() {
            this.isModelOpened = false;
            this.invitationCode = "";
        },

        useInvitationCode() {
            this.isModelOpened = true;
        },

        handleInput(value) {
            this.invitationCode = value;
        },

        updatePrivilege() {
            api.post(
                "/api/account/update-privilege/" + this.invitationCode
            ).then(res => {
                if (res.data.code != 0) {
                    Taro.showToast({
                        title: res.data.msg,
                        icon: "none",
                        duration: 1300
                    });
                } else {
                    this.closeModal();
                    Taro.showToast({
                        title: "使用成功",
                        icon: "none",
                        duration: 1300
                    });
                    setTimeout(() => {
                        Taro.redirectTo({
                            url: `/pages/user/index`
                        });
                    }, 1300);
                }
            });
        }
    }
};
</script>