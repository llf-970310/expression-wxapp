<template>
    <view class="page page-index">
        <AtNoticebar icon="volume-plus">点击标签，查看对应维度的分析报告</AtNoticebar>
        <DocsHeader title="评测报告" />

        <AtToast :text="toastText" hasMask :isOpened="toastShow" status="error"></AtToast>
        <AtToast text="正在加载..." hasMask :isOpened="dataLoading" status="loading"></AtToast>

        <view class="chart" style="width: 100%;height: 40vh">
            <ec-canvas ref="chart" canvas-id="radar-canvas" :ec="ec" />
        </view>

        <view class="content">
            <view class="item_view">
                <view class="item">
                    <view class="title">{{score.total | TwoDecimal}}</view>
                    <view class="desc">总分</view>
                </view>
                <view class="line" />
                <view class="item">
                    <view class="title">{{score.主旨 | TwoDecimal}}</view>
                    <view class="desc">主旨</view>
                </view>
                <view class="line" />
                <view class="item">
                    <view class="title">{{score.细节 | TwoDecimal}}</view>
                    <view class="desc">细节</view>
                </view>
            </view>
            <view class="item_view">
                <view class="item">
                    <view class="title">{{score.音质 | TwoDecimal}}</view>
                    <view class="desc">音质</view>
                </view>
                <view class="line" />
                <view class="item">
                    <view class="title">{{score.结构 | TwoDecimal}}</view>
                    <view class="desc">结构</view>
                </view>
                <view class="line" />
                <view class="item">
                    <view class="title">{{score.逻辑 | TwoDecimal}}</view>
                    <view class="desc">逻辑</view>
                </view>
            </view>
        </view>

        <view class="doc-body">
            <view class="panel" v-if="scoreSelected == '音质'">
                <view class="panel__title">音质</view>
                <view class="panel__content">
                    <view class="at-article">
                        <view
                            class="at-article__p"
                        >音质并非指你的声音是否好听，也跟你说话的口音没有太大关系。音质的意思，是声音的整体素质，包括你的语速、重音、停顿、节奏等等，是一个多重维度综合作用的结果。</view>
                        <view
                            class="at-article__p"
                        >在表达的时候，最基本的层次是确保对方能够听清你说的话，也就是说，一个人的说话方式不能让对方的理解产生障碍，在确保了这一点之后，其次才是怎么能够让对方更好地理解你所表达的意思。好听的声音，是加分项，但并不是必然导致表达力好的因素。</view>
                    </view>

                    <view class="tabs" v-if="report.音质 != null">
                        <AtTabs
                            :current="tabCurrent"
                            :tabList="tabList"
                            :onClick="handleClick.bind(this, 'tabCurrent')"
                            scroll
                        >
                            <AtTabsPane :current="tabCurrent" :index="0">
                                <view
                                    class="tab-content"
                                    v-if="report.音质.无效表达率 != ''"
                                >{{report.音质.无效表达率}}</view>
                                <view class="tab-content" v-else>无</view>
                            </AtTabsPane>
                            <AtTabsPane :current="tabCurrent" :index="1">
                                <view class="tab-content">{{report.音质.清晰度}}</view>
                            </AtTabsPane>
                            <AtTabsPane :current="tabCurrent" :index="2">
                                <view class="tab-content">{{report.音质.语速}}</view>
                            </AtTabsPane>
                            <AtTabsPane :current="tabCurrent" :index="3">
                                <view class="tab-content">{{report.音质.间隔}}</view>
                            </AtTabsPane>
                        </AtTabs>
                    </view>
                </view>
            </view>
            <view class="panel" v-else-if="scoreSelected == '主旨'">
                <view class="panel__title">主旨</view>
                <view class="panel__content">
                    <view class="at-article">
                        <!-- <view class="at-article__h2">这是二级标题</view> -->
                        <view
                            class="at-article__p"
                        >主旨确定表达内容的方向。如果把一段谈话比作一次旅行，那么主旨就是这次旅行的目的地，你希望通过表达，让对方没有歧义地理解某个核心的要点。注意，表达时要点可以有很多个，但主旨只能有一个，否则就不称之为主旨了。我们常说一个人说不到点子上，往往意思是这个人讲话的时候丢失了主旨。</view>
                        <view
                            class="at-article__p"
                        >假如其他内容全部丢失，你只能让对方听到一句话，这句话涵盖了你所有其他想要表达的内容，唯有这句话不能丢失，这就是主旨。提炼并准确表达主旨，能让对方感觉到你是个能抓住重点，提纲挈领的人。</view>
                        <view class="at-article__p">{{report.主旨}}</view>
                    </view>
                </view>
            </view>
            <view class="panel" v-else-if="scoreSelected == '细节'">
                <view class="panel__title">细节</view>
                <view class="panel__content">
                    <view class="at-article">
                        <!-- <view class="at-article__h2">这是二级标题</view> -->
                        <view
                            class="at-article__p"
                        >细节决定听众对表达内容的清晰度。如果主旨是一次旅行的目的地，那么细节就是这次旅行中的景点。丰富的细节能够给听众创造良好且印象深刻的感受。</view>
                        <view
                            class="at-article__p"
                        >一次没有包含任何细节的表达，听众无法清晰的感知，会觉得枯燥。但太过丰富的细节又会造成听众的认知负担，产生模糊不清的印象。因此细节的传达需要有挑选，有主次，有取舍，不能完全没有，也不能胡子眉毛一把抓。</view>
                        <view class="at-article__p">{{report.细节}}</view>
                    </view>
                </view>
            </view>
            <view class="panel" v-else-if="scoreSelected == '结构'">
                <view class="panel__title">结构</view>
                <view class="panel__content">
                    <view class="at-article">
                        <!-- <view class="at-article__h2">这是二级标题</view> -->
                        <view
                            class="at-article__p"
                        >结构指的是内容各部分在表达中的位置安排。最容易理解的类比就是建筑。糟糕的结构不但对听众的理解会造成极大的负担，甚至会把一次表达索要传达的内容彻底破坏，如同一栋建筑物的垮塌。</view>
                        <view
                            class="at-article__p"
                        >好的表达结构，就是把所有的内容分门别类之后，把相同的或者相似的内容，安排在一起，并放在合适的位置上。方便听众以整块内容未单位来理解所要表达的内容。在表达中，清晰的内容组织结构，能够让你的表达更清晰易懂，对方也能迅速地把握你要传递的重点信息。</view>
                    </view>
                    <AtTimeline class="timeline" :items="structureItems"></AtTimeline>
                </view>
            </view>
            <view class="panel" v-else-if="scoreSelected == '逻辑'">
                <view class="panel__title">逻辑</view>
                <view class="panel__content">
                    <view class="at-article">
                        <!-- <view class="at-article__h2">这是二级标题</view> -->
                        <view
                            class="at-article__p"
                        >逻辑指的是串联内容的方式，要遵循基本的思维规则和规律。在分门别类组织好素材搭建合理的结构之后，就需要逻辑来把素材清晰地串联起来，还是拿建筑物打比方，逻辑就好像是通往建筑各个部分地通道。只有合理地连接方式，才能让进入建筑的人更容易进入不同的部分。</view>
                        <view
                            class="at-article__p"
                        >在表达中，逻辑既可以通过连词来体现，也通过内容之间正确出现的顺序来体现。拥有好的逻辑，可以让人感觉你是个头脑敏捷，思路清晰的人。在表达中，如果表达者能较号地利用逻辑能力合理推导出自己的观点，这样的表达观点会更有说服力。过程越充分，越容易被理解，观点被接受的可能性也越高。</view>
                    </view>
                    <AtTimeline class="timeline" :items="logicItems"></AtTimeline>
                </view>
            </view>
            <view class="panel" v-else>
                <view class="at-article">
                    <view class="at-article__p">表达力是一个人生活在社会中所必须的基础能力。它会对一个人的人际关系、情感质量、薪酬和职位产生巨大影响。</view>
                    <view
                        class="at-article__p"
                    >在这样一个媒体碎片化、传播渠道极其丰富的时代，好的表达离对个人的加成，远超以往任何时代，可能一次好的表达，就能让你获得关注和瞩目，提升社会会地位，而一次糟糕的表达有可能会断送一个人的职业生涯，或者在社交中所积累的良好形象。</view>
                    <view
                        class="at-article__p"
                    >帮助你准确评判自我的表达能力，精准定位自我在人群中的表达水平，是这个测试的目的。有了准确的表达能力图谱，可以帮助你有的放矢地进行针对性地提高，提升自己的竞争力。</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import "./index.scss";
import api from "@/util/api.js";

import Taro from "@tarojs/taro";
import { getCurrentInstance } from "@tarojs/taro";

import EcCanvas from "../components/ec-canvas";
import * as echarts from "../components/ec-canvas/echarts";

const testId = -1;

export default {
    data() {
        return {
            report: {},
            score: {},

            toastText: "",
            toastShow: false,
            dataLoading: true,

            counter: 0,
            timer: 0,
            queryTime: 3000, //每3秒轮询一次
            limitTime: 120000, //120秒超时

            tabCurrent: 0,
            tabList: [
                { title: "无效表达率" },
                { title: "清晰度" },
                { title: "语速" },
                { title: "间隔" }
            ],

            structureItems: [],
            logicItems: [],

            ec: {
                lazyLoad: true
            },

            scoreSelected: ""
        };
    },
    mounted() {
        this.testId = getCurrentInstance().router.params.id;

        if (this.testId == null) this.getCurrentExamResult();
        else this.getHistoryExamResult(this.testId);

        this.Chart = this.$refs.chart;
    },
    components: {
        EcCanvas
    },
    filters: {
        TwoDecimal: function(value) {
            value = Number(value);
            return value.toFixed(2);
        }
    },
    methods: {
        handleClick(stateName, value) {
            this[stateName] = value;
        },

        getCurrentExamResult() {
            this.getResult("/api/exam/result");
        },

        getHistoryExamResult(id) {
            this.getResult("/api/account/history-report/" + id);
        },

        getResult(url) {
            api.get(url).then(res => {
                let data = res.data;
                this.dataLoading = false;

                if (data.code == 0) {
                    this.report = data.data.report;
                    this.score = data.data.data;
                    this.dataFormat();
                    this.getChart(this.score);
                } else {
                    this.toastText = data.msg;
                    this.toastShow = true;

                    if (data.code == 5104) {
                        this.toastText = "报告暂未生成，请稍后查看";
                    }

                    setTimeout(() => {
                        this.$taro.redirectTo({
                            url: `/subpackages/result/history/index`
                        });
                    }, 1000);
                }
            });
        },

        dataFormat() {
            this.report.结构.forEach(element => {
                this.structureItems.push({ title: element });
            });

            this.report.逻辑.forEach(element => {
                this.logicItems.push({ title: element });
            });
        },

        getChart(scoreInfo) {
            let chartOption = {
                tooltip: {},
                radar: {
                    // shape: 'circle',
                    name: {
                        textStyle: {
                            color: "#fff",
                            backgroundColor: "#999",
                            borderRadius: 3,
                            padding: [3, 5]
                        }
                    },
                    indicator: [
                        { name: "主旨", max: 100 },
                        { name: "细节", max: 100 },
                        { name: "音质", max: 100 },
                        { name: "结构", max: 100 },
                        { name: "逻辑", max: 100 }
                    ],
                    triggerEvent: true
                },
                series: [
                    {
                        name: "各维度得分情况",
                        type: "radar",
                        symbolSize: 6,
                        data: [
                            {
                                value: [
                                    scoreInfo["主旨"],
                                    scoreInfo["细节"],
                                    scoreInfo["音质"],
                                    scoreInfo["结构"],
                                    scoreInfo["逻辑"]
                                ]
                            }
                        ],
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
                        },
                        areaStyle: {
                            color: "rgba(96, 172, 252, 0.5)"
                        }
                    }
                ]
            };

            this.Chart.init((canvas, width, height, canvasDpr) => {
                const chart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: canvasDpr
                });
                chart.on("click", params => {
                    if (params.componentType == "radar") {
                        this.scoreSelected = params.name;
                    }
                });
                canvas.setChart(chart);
                chart.setOption(chartOption);
                return chart;
            });
        }
    }
};
</script>