<template>
    <view class="page page-index">
        <view class="total-countdown" v-if="exerciseLeftTime != null">
            <text>评测剩余时间:</text>
            <AtCountdown
                :seconds="exerciseLeftTime"
                :onTimeUp="onTimeUp.bind(this, 2)"
                :isShowHour="false"
            />
        </view>

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
                <view class="at-article__h1 at-row">
                    <view class="at-col">
                        <text v-if="curQuestionType == 1">朗读题</text>
                        <text v-else-if="curQuestionType == 3">表达题</text>
                        <text v-else>转述题</text>
                    </view>
                    <view class="at-col" v-if="state != 'prepare'">
                        <AtButton class="like-button" size="small" :onClick="onClickLikeButton">
                            <AtIcon value="heart-2" size="24" color="#EE7785" v-if="isLike"></AtIcon>
                            <AtIcon value="heart" size="24" v-else></AtIcon>
                        </AtButton>
                    </view>
                </view>
                <view class="at-article__content">
                    <view class="at-article__section">
                        <!-- 阅读题目要求 -->
                        <view v-if="state == 'prepare'">
                            <view class="at-article__p">
                                <text>{{curQuestionTip.detail}}</text>
                            </view>
                            <view class="at-article__p">{{curQuestionTip.tip}}</view>
                        </view>
                        <!-- 阅读文本 -->
                        <view v-else-if="state == 'readQuestion'">
                            <view class="at-article__p">{{curQuestionRawText}}</view>
                        </view>
                        <!-- 开始答题且为阅读题或表达题 -> 显示题目文本
                             开始答题且为转述题 -> 不显示题目文本 
                        -->
                        <view v-else-if="curQuestionType == 1 || curQuestionType == 3">
                            <view class="at-article__p">{{curQuestionRawText}}</view>
                        </view>
                        <view v-else>
                            <view class="at-article__p">请用自己的语言转述前一阶段阅读的文本</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="countdown" v-if="state == 'startAnswer'">
                <text>答题剩余时间:</text>
                <AtCountdown
                    :seconds="curQuestionAnswerTime"
                    :onTimeUp="onTimeUp.bind(this, 1)"
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
            <view class="btn-feedback" v-if="state != 'prepare'">
                <view
                    :class="{'feedback-item' : true, 'active': upActive}"
                    @tap="onClickFeedbackButton(1)"
                >
                    <AtIcon prefixClass='iconfont' value='dianzan' size='25'></AtIcon>
                </view>
                <view
                    :class="{'feedback-item' : true, 'active': downActive}"
                    @tap="onClickFeedbackButton(2)"
                >
                    <AtIcon prefixClass='iconfont' value='cai' size='25'></AtIcon>
                </view>
            </view>
        </view>
    </view>
</template>s

<script>
import "./index.scss";
import api from "@/util/api.js";
import Taro from "@tarojs/taro";
import { uploadSoundToBOS } from "@/util/bos.js";
import "@/components/iconfont/iconfont.scss";

const stepItems = [
    { title: "阅读要求" },
    { title: "准备作答" },
    { title: "正在录音" }
];

const stateList = ["prepare", "readQuestion", "startAnswer"];
const btnItems = ["准备作答", "开始录音", "提前结束"];

const recorderManager = Taro.getRecorderManager();
const options = {
    duration: 300000,
    sampleRate: 8000,
    numberOfChannels: 1,
    format: "wav"
};
var tempFilePath = "";

const FeedbackActions = {
    like: ["/like", "post"],
    up: ["/up", "post"],
    down: ["/down", "post"],
    cancelLike: ["/like", "delete"],
    cancelUp: ["/up", "delete"],
    cancelDown: ["/down", "delete"],
    upToDown: ["/up2down", "post"],
    downToUp: ["/down2up", "post"]
};

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

            // 本次评测的相关属性
            exerciseTime: null,
            exerciseLeftTime: null,
            isLastQuestion: false,
            hasFinishExercise: false,

            // 当前题目的相关属性
            curQuestionDbId: "",
            curQuestionIndex: 0,
            curQuestionType: 1,
            curQuestionRawText: "",
            curQuestionTip: {
                detail: "",
                tip: ""
            },
            curQuestionPreparationTime: 0,
            curQuestionAnswerTime: 0,
            isLike: false,
            upActive: false,
            downActive: false,

            // 重试相关的参数
            retryCount: 0,
            maxRetry: 5
        };
    },
    mounted() {
        // recorderManager为全局唯一，所以在mounted中设置onStop()函数，
        // 否则会和预测试页面的产生混乱，导致tempFilePath变量取不到值
        recorderManager.onStop(res => {
            console.log("[exam] recorder stop", res);
            tempFilePath = res.tempFilePath;
        });
        this.checkUnfinishedExam();
    },
    methods: {
        onChange(stateName, current) {
            this[stateName] = current;
        },

        nextStep() {
            // startAnswer
            if (this.stepCurrent == 1) {
                recorderManager.start(options);
            }

            // endAnswer
            if (this.stepCurrent == 2) {
                recorderManager.stop();
                // 处理录音文件
                this.dataLoading = true;
                api.get("/api/exam/" + this.curQuestionIndex + "/upload-url")
                    .then(res => {
                        let uploadLocation = res.data.data.fileLocation;
                        let uploadUrl = res.data.data.url;
                        this.uploadRecording(
                            uploadLocation,
                            uploadUrl,
                            tempFilePath
                        );
                    })
                    .catch(err => {
                        console.log("err: ", err);
                    });
            }

            this.stepCurrent = (this.stepCurrent + 1) % 3;
            this.state = stateList[this.stepCurrent];
        },

        // 1: 该题目时间到  2：评测时间到
        onTimeUp(type) {
            Taro.showToast({
                title: "答题时间到",
                icon: "none",
                duration: 1000
            });
            if (type == 1) {
                setTimeout(() => {
                    this.nextStep();
                }, 1000);
            } else if (type == 2) {
                setTimeout(() => {
                    Taro.redirectTo({
                        url: `/subpackages/result/report/index`
                    });
                }, 1000);
            }
        },

        checkUnfinishedExam() {
            const _this = this;

            api.get("/api/exam/left").then(res => {
                if (res.data.code == 0) {
                    this.initExam("5ec67fb360e1ec808ee2ad47");
                } else if (res.data.code === 2) {
                    Taro.showModal({
                        // title: "提示",
                        content:
                            "监测到您有正在进行的测试，请问是否需要继续测试？",
                        cancelText: "重新测试",
                        success: function(select) {
                            if (select.confirm) {
                                const questionData = res.data.data;
                                _this.curQuestionIndex =
                                    parseInt(questionData["next_q_num"]) - 1;
                                _this.nextQuestion();
                            } else if (select.cancel) {
                                _this.initExam("5ec67fb360e1ec808ee2ad47");
                            }
                        }
                    });
                } else {
                    this.toastText = res.data.msg;
                    this.toastShow = true;
                    setTimeout(() => {
                        this.$taro.redirectTo({
                            url: `/pages/index/index`
                        });
                    }, 1000);
                }
            });
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
                this.dataLoading = false;
                setTimeout(() => {
                    Taro.showToast({
                        title: "评测已结束，报告生成中...",
                        icon: "none",
                        duration: 2000
                    });
                }, 500);

                setTimeout(() => {
                    this.$taro.redirectTo({
                        url: `/subpackages/result/report/index`
                    });
                }, 2000);
            } else {
                // 继续做题
                this.dataLoading = true;
                this.isLike = false;
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
                        this.curQuestionTip.detail = data.questionInfo.detail.replace(
                            /<br>/g,
                            "\n"
                        );
                        this.curQuestionTip.tip = data.questionInfo.tip;
                        this.curQuestionPreparationTime = data.readLimitTime;
                        this.curQuestionAnswerTime = data.questionLimitTime;
                        this.isLastQuestion = data.lastQuestion;
                        this.exerciseLeftTime = data.examLeftTime;
                        this.exerciseTime = data.examTime;
                    } else if (code === 4000) {
                        console.error("请求参数错误");
                    } else if (code === 4003) {
                        this.toastText = "考试时间到";
                        this.toastShow = true;
                        setTimeout(() => {
                            this.$taro.redirectTo({
                                url: `/pages/index/index`
                            });
                        }, 1000);
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
        },

        reTry(func, arg) {
            this.retryCount++;
            setTimeout(() => func(arg), 500);
        },

        uploadRecording(uploadLocation, uploadUrl, tempFilePath) {
            const _this = this;

            if (uploadLocation === "BOS") {
                uploadSoundToBOS(tempFilePath, uploadUrl, function() {
                    // 上传成功调用，告知服务器进行分析
                    api.post(
                        "/api/exam/" +
                            _this.curQuestionIndex +
                            "/upload-success"
                    )
                        .then(res => {
                            console.log("已通知服务器上传成功");
                            _this.nextQuestion();
                        })
                        .catch(err => {
                            if (_this.retryCount < _this.maxRetry) {
                                _this.reTry(
                                    ([location, url, localPath, index]) =>
                                        uploadRecording(
                                            location,
                                            url,
                                            localPath
                                        ),
                                    [uploadLocation, uploadUrl, tempFilePath]
                                );
                            } else {
                                console.log("Try uploadRecording() max times!");
                                console.error(err);
                                _this.nextQuestion();
                            }
                        });
                });
            }
        },

        onClickLikeButton() {
            if (this.isLike) {
                this.isLike = false;
                this.feedback(FeedbackActions.cancelLike, this.curQuestionDbId);
            } else {
                this.isLike = true;
                this.feedback(FeedbackActions.like, this.curQuestionDbId);
            }
        },

        onClickFeedbackButton(type) {
            // up
            if (type == 1) {
                if (!this.upActive) {
                    this.upActive = true;
                    if (this.downActive) {
                        this.downActive = false;
                        this.feedback(
                            FeedbackActions.downToUp,
                            this.curQuestionDbId
                        );
                        console.log("down2up:", this.curQuestionDbId);
                    } else {
                        this.feedback(FeedbackActions.up, this.curQuestionDbId);
                        console.log("up:", this.curQuestionDbId);
                    }
                } else {
                    this.upActive = false;
                    this.feedback(
                        FeedbackActions.cancelUp,
                        this.curQuestionDbId
                    );
                    console.log("up canceled:", this.curQuestionDbId);
                }
            }
            // down
            else if (type == 2) {
                if (!this.downActive) {
                    this.downActive = true;
                    if (this.upActive) {
                        this.upActive = false;
                        this.feedback(
                            FeedbackActions.upToDown,
                            this.curQuestionDbId
                        );
                        console.log("up2down:", this.curQuestionDbId);
                    } else {
                        console.log("down:", this.curQuestionDbId);
                        this.feedback(
                            FeedbackActions.down,
                            this.curQuestionDbId
                        );
                    }
                } else {
                    this.downActive = false;
                    this.feedback(
                        FeedbackActions.cancelDown,
                        this.curQuestionDbId
                    );
                    console.log("down canceled:", this.curQuestionDbId);
                }
            }
        },

        feedback(feedbackAction, qDbId) {
            let [action, method] = feedbackAction;
            let url = "/api/questions/" + qDbId + action;
            if (method === "post") {
                api.post(url).then(res => {
                    if (res.data.code != 0) {
                        Taro.showToast({
                            title: "标记失败",
                            icon: "none",
                            duration: 1500
                        });
                        console.log(res.data.msg);
                    }
                });
            } else if (method === "delete") {
                api.delete(url).then(res => {
                    if (res.data.code != 0) {
                        Taro.showToast({
                            title: "标记失败",
                            icon: "none",
                            duration: 1500
                        });
                        console.log(res.data.msg);
                    }
                });
            }
        }
    }
};
</script>