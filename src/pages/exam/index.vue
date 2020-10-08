<template>
    <view class="page page-index">
        <AtSteps
            :items="stepItems"
            :current="stepCurrent"
            :onChange="onChange.bind(this, 'stepCurrent')"
            class="question-step"
        />
        <AtToast :text="toastText" hasMask :isOpened="toastShow" status="error"></AtToast>
        <AtToast text="正在加载..." hasMask :isOpened="dataLoading" status="loading"></AtToast>

        <view class="question-info">
            <view class="at-article">
                <view class="at-article__h1">
                    <text v-if="curQuestionType == 1">朗读题</text>
                    <text v-else-if="curQuestionType == 3">表达题</text>
                    <text v-else>转述题</text>
                </view>
                <view class="at-article__content">
                    <view class="at-article__section">
                        <view v-if="state == 'prepare'">
                            <view class="at-article__p">
                                <text v-html="curQuestionTip.detail"></text>
                            </view>
                            <view class="at-article__p">{{curQuestionTip.tip}}</view>
                        </view>
                        <view v-else>
                            <view class="at-article__p">{{curQuestionRawText}}</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="countdown" v-if="state == 'startAnswer'">
                <text>剩余时间: </text>
                <AtCountdown
                    :seconds="curQuestionAnswerTime"
                    :onTimeUp="onTimeUp"
                    :isShowHour="false"
                />
            </view>
            <view>
                <AtButton
                    type="primary"
                    circle
                    class="btn-start"
                    :onClick="nextStep"
                >{{btnItems[this.stepCurrent]}}</AtButton>
            </view>
        </view>
    </view>
</template>s

<script>
import "./index.scss";
import api from "../../util/api.js";
import Taro from "@tarojs/taro";

const stepItems = [
    { title: "阅读要求" },
    { title: "准备作答" },
    { title: "正在录音" }
];

const stateList = ["prepare", "readQuestion", "startAnswer"];
const btnItems = ["准备作答", "开始录音", "提前结束"];

// const recorderManager = Taro.getRecorderManager();
// recorderManager.onStart(() => {
//   console.log('recorder start')
// })
// recorderManager.onPause(() => {
//   console.log('recorder pause')
// })
// recorderManager.onStop((res) => {
//   console.log('recorder stop', res)
//   const { tempFilePath } = res
// })

export default {
    data() {
        return {
            stepItems,
            btnItems,

            stepCurrent: 0,
            state: "prepare",
            dataLoading: false,
            toastText: "",
            toastShow: false,
            isLastQuestion: false,
            hasFinishExercise: false,

            // 当前题目的相关属性
            curQuestionIndex: 0,
            curQuestionType: 1,
            curQuestionRawText: "",
            curQuestionTip: {
                detail: "",
                tip: ""
            },
            curQuestionPreparationTime: 0,
            curQuestionAnswerTime: 0
        };
    },
    mounted() {
        this.initExam("5eb84af7aaaae82807e5312b");
    },
    methods: {
        onChange(stateName, current) {
            this[stateName] = current;
        },

        nextStep() {
            // endAnswer
            if (this.stepCurrent == 2) {
                // todo: 处理录音文件
                this.nextQuestion();
            }

            this.stepCurrent = (this.stepCurrent + 1) % 3;
            this.state = stateList[this.stepCurrent];
        },

        onTimeUp() {
            Taro.showToast({
                title: "答题时间到",
                icon: "none",
                duration: 1000
            });
            setTimeout(() => {
                this.nextStep();
            }, 1000);
        },

        initExam(paperTemplateID) {
            this.dataLoading = true;
            api.post("/api/exam/new/" + paperTemplateID).then(res => {
                if (res.data.code == 0) {
                    this.nextQuestion();
                } else {
                    if (res.data.code === 4004)
                        this.toastText = "测试次数已用尽";
                    else if (res.data.code === 5101)
                        this.toastText = "题目获取失败";
                    else this.toastText = res.data.msg;

                    this.toastShow = true;
                    setTimeout(() => {
                        this.$taro.redirectTo({
                            url: `/pages/index/index`
                        });
                    }, 1000);
                }
                this.dataLoading = false;
            });
        },

        nextQuestion() {
            if (this.isLastQuestion) {
                // 做题已结束，跳转到 report 页面
                this.$taro.redirectTo({
                    url: `/pages/result/report/index`
                });
            } else {
                // 继续做题
                this.dataLoading = true;
                api.get(
                    "/api/exam/" + this.curQuestionIndex + "/next-question"
                ).then(res => {
                    var code = res.data.code;
                    var data = res.data.data;
                    if (code == 0) {
                        this.curQuestionIndex = data.questionNumber;
                        this.curQuestionType = data.questionType;
                        this.curQuestionDbId = data.questionDbId;
                        this.curQuestionRawText = data.questionContent;
                        this.curQuestionTip.detail = data.questionInfo.detail;
                        this.curQuestionTip.tip = data.questionInfo.tip;
                        this.curQuestionPreparationTime = data.readLimitTime;
                        this.curQuestionAnswerTime = data.questionLimitTime;
                        this.isLastQuestion = data.lastQuestion;
                        this.exerciseLeftTime = data.examLeftTime;
                        this.exerciseTime = data.examTime;
                    } else if (code === 4000) {
                        console.error("请求参数错误");
                    } else if (code === 4003) {
                        console.error("考试时间到");
                    } else if (code === 5100) {
                        // 测试已完成
                        this.hasFinishExercise = true;
                    } else if (code === 5102) {
                        // 获取题目失败
                        this.toastText = "题目获取失败";
                        this.toastShow = true;
                        setTimeout(() => {
                            this.$taro.redirectTo({
                                url: `/pages/index/index`
                            });
                        }, 1000);
                    }
                    this.dataLoading = false;
                });
            }
        }
    }
};
</script>