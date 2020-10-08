<template>
    <view class="page page-index">
        <AtNoticebar icon="volume-plus">点击卡片可以查看历史报告哦~</AtNoticebar>

        <DocsHeader title="历史成绩" />

        <AtToast :text="toastText" hasMask :isOpened="toastShow" status="error"></AtToast>
        <AtToast text="正在加载..." hasMask :isOpened="dataLoading" status="loading"></AtToast>

        <view class="content" v-for="(item, index) in historyScoreList" :key="index">
            <view class="panel__content no-padding">
                <view class="example-item">
                    <AtCard
                        :title="paperTemplateMap[item.paper_tpl_id] != null ? paperTemplateMap[item.paper_tpl_id] : '经典表达力评测'"
                        :extra="'总分：' + item.score_info.total"
                        :note="'测试时间：' + item.test_start_time"
                        :onClick="handleClick.bind(this, item.test_id)"
                    >
                        主旨：{{ item.score_info.主旨 }}　
                        细节：{{ item.score_info.细节 }}　
                        音质：{{ item.score_info.音质 }}
                        <text>{{'\n'}}</text>
                        结构：{{ item.score_info.结构 }}　
                        逻辑：{{ item.score_info.逻辑 }}
                    </AtCard>
                </view>
            </view>
        </view>
        <AtDivider style="width: 40%; margin: 0 auto;" />
    </view>
</template>

<script>
import "./index.scss";
import api from "../../../util/api.js";

export default {
    data() {
        return {
            historyScoreList: [],
            paperTemplateMap: {},
            toastText: "",
            toastShow: false,
            dataLoading: true
        };
    },
    mounted() {
        this.getPaperTemplate();
    },
    methods: {
        handleClick(id) {
            this.$taro.navigateTo({
                url: `/pages/result/report/index?id=` + id
            });
        },

        getPaperTemplate() {
            api.get("/api/exam/paper-templates").then(res => {
                if (res.data.code != 0) {
                    this.dataLoading = false;
                    this.toastText = res.data.msg;
                    this.toastShow = true;
                    setTimeout(() => {
                        this.$taro.redirectTo({
                            url: `/pages/index/index`
                        });
                    }, 1000);
                } else {
                    res.data.data.paperTemplates.forEach(tpl => {
                        this.paperTemplateMap[tpl["tpl_id"]] = tpl["name"];
                    });
                    this.getHistoryScore();
                }
            });
        },

        getHistoryScore() {
            api.get("/api/account/history-scores").then(res => {
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
                    this.historyScoreList = res.data.data.history.reverse();
                }
            });
        }
    }
};
</script>