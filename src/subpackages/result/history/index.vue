<template>
    <view class="page page-index">
        <AtNoticebar icon="volume-plus">点击卡片可以查看历史报告哦~</AtNoticebar>

        <DocsHeader title="历史成绩" />

        <AtToast :text="toastText" hasMask :isOpened="toastShow" status="error"></AtToast>
        <AtToast text="正在加载..." hasMask :isOpened="dataLoading" status="loading"></AtToast>

        <view class="doc-body">
            <view class="panel">
                <view class="panel__title">近五次测试变化趋势</view>
                <view class="panel__content">
                    <view class="chart">
                        <e-chart ref="chart" canvas-id="total-chart-canvas" />
                    </view>
                </view>
            </view>

            <view class="panel">
                <view class="panel__title">详细成绩信息</view>
                <view class="panel__content">
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
                </view>
            </view>
        </view>

        <AtDivider style="width: 40%; margin: 0 auto;" />
    </view>
</template>

<script>
import "./index.scss";
import api from "@/util/api.js";

import Taro from "@tarojs/taro";
import { EChart } from "echarts-taro3-vue";

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
    components: { EChart },
    methods: {
        handleClick(id) {
            this.$taro.navigateTo({
                url: `/subpackages/result/report/index?id=` + id
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
                    this.getChart(this.historyScoreList);
                }
            });
        },

        getChart(historyScore) {
            let recent = historyScore.slice(0, 5).reverse();

            let chartOption = {
                legend: {
                    data: ["总分", "音质", "主旨", "细节", "结构", "逻辑"],
                    orient: "vertical",
                    top: 50,
                    left: "right",
                    selected: {
                        总分: true,
                        音质: false,
                        主旨: false,
                        细节: false,
                        结构: false,
                        逻辑: false
                    }
                },
                tooltip: {
                    show: true,
                    trigger: "axis"
                },
                xAxis: {
                    type: "category",
                    data: recent.map(a => a.test_start_time),
                    show: false
                    // axisLabel: {
                    //     interval: 0, // 标签设置为全部显示
                    //     rotate: 40,
                    //     formatter: function(str) {
                    //         let strList = str.split(" ");
                    //         return strList[0] + "\n" + strList[1];
                    //     }
                    // }
                },
                yAxis: {
                    type: "value"
                },
                series: [
                    {
                        name: "总分",
                        type: "line",
                        data: recent.map(a => a.score_info.total),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#60acfc",
                            shadowColor: "#60acfc",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#60acfc",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    },
                    {
                        name: "音质",
                        type: "line",
                        data: recent.map(a => a.score_info.音质),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#32d3eb",
                            shadowColor: "#32d3eb",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#32d3eb",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    },
                    {
                        name: "主旨",
                        type: "line",
                        data: recent.map(a => a.score_info.主旨),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#5bc49f",
                            shadowColor: "#5bc49f",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#5bc49f",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    },
                    {
                        name: "细节",
                        type: "line",
                        data: recent.map(a => a.score_info.细节),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#feb64d",
                            shadowColor: "#feb64d",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#feb64d",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    },
                    {
                        name: "结构",
                        type: "line",
                        data: recent.map(a => a.score_info.结构),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#ff7c7c",
                            shadowColor: "#ff7c7c",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#ff7c7c",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    },
                    {
                        name: "逻辑",
                        type: "line",
                        data: recent.map(a => a.score_info.逻辑),
                        smooth: true,
                        symbol: "circle", //折线点设置为实心点
                        symbolSize: 8,
                        itemStyle: {
                            color: "#9287e7",
                            shadowColor: "#9287e7",
                            shadowBlur: 10
                        },
                        lineStyle: {
                            shadowColor: "#9287e7",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            opacity: 1,
                            shadowBlur: 8,
                            type: "solid",
                            width: 2
                        }
                    }
                ]
            };

            Taro.nextTick(() => {
                this.$refs.chart.refresh(chartOption);
            });
        }
    }
};
</script>