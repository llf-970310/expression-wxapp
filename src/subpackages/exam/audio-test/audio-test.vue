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

        <!-- 结果 -->
        <view v-if="state == 'showResult'">
            <view v-if="resultLoading">
                <AtActivityIndicator content="音频分析中..." mode="center" size="50"></AtActivityIndicator>
            </view>
            <view v-else>
                <view style="margin-top: 50px;">
                    <view class="at-article__p" style="text-align: center">{{analysisResult.msg}}</view>
                </view>

                <view class="module-list">
                    <view class="module-list__item">
                        <view class="module-list__info">
                            <view class="title">能否识别</view>
                        </view>

                        <view
                            v-if="analysisResult.canRcg"
                            class="module-list__arrow"
                            style="background: #75D701;"
                        >
                            <text class="at-icon at-icon-check" />
                        </view>
                        <view v-else class="module-list__arrow" style="background: #EC6A5C;">
                            <text class="at-icon at-icon-close" />
                        </view>
                    </view>

                    <view class="module-list__item">
                        <view class="module-list__info">
                            <view class="title">声音质量</view>
                        </view>

                        <view
                            v-if="analysisResult.qualityIsOk"
                            class="module-list__arrow"
                            style="background: #75D701;"
                        >
                            <text class="at-icon at-icon-check" />
                        </view>
                        <view v-else class="module-list__arrow" style="background: #EC6A5C;">
                            <text class="at-icon at-icon-close" />
                        </view>
                    </view>
                </view>

                <AtButton
                    v-if="!analysisResult.canRcg || !analysisResult.qualityIsOk"
                    type="primary"
                    circle
                    class="btn-start"
                    :onClick="reTest"
                >重新测试</AtButton>
                <AtButton v-else type="primary" circle class="btn-start" :onClick="jumpToExam">开始评测</AtButton>
            </view>
        </view>

        <!-- 题目 -->
        <view v-else>
            <view class="question-info">
                <view class="at-article">
                    <view class="at-article__h1">
                        <text>音频环境测试</text>
                    </view>
                    <view class="at-article__content">
                        <view class="at-article__section">
                            <view v-if="state == 'prepare'">
                                <view class="at-article__p">
                                    <text>{{questionTipDetail}}</text>
                                </view>
                                <view class="at-article__p">{{questionTip}}</view>
                            </view>
                            <view v-else>
                                <view class="at-article__p">{{questionRawText}}</view>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="countdown" v-if="state == 'startAnswer'">
                    <text>剩余时间:</text>
                    <AtCountdown
                        :seconds="questionAnswerTime"
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
    </view>
</template>s

<script>
import "./audio-test.scss";
import api from "@/util/api.js";
import Taro from "@tarojs/taro";
import { uploadSoundToBOS } from "@/util/bos.js";

const stepItems = [
    { title: "阅读要求" },
    { title: "准备作答" },
    { title: "正在录音" },
    { title: "查看结果" }
];

const stateList = ["prepare", "readQuestion", "startAnswer", "showResult"];
const btnItems = ["准备作答", "开始录音", "提前结束"];

const recorderManager = Taro.getRecorderManager();
const options = {
    duration: 300000,
    sampleRate: 8000,
    numberOfChannels: 1,
    format: "wav"
};
var tempFilePath = "";
recorderManager.onStart(() => {
    console.log("recorder start");
});
recorderManager.onPause(() => {
    console.log("recorder pause");
});

export default {
    data() {
        return {
            stepItems,
            btnItems,

            stepCurrent: 0,
            state: "prepare",
            dataLoading: false,
            resultLoading: true, // 获取结果专用
            toastText: "",
            toastShow: false,

            // 预测试的问题原文
            questionRawText: "",
            // 预测试的问题提示
            questionTipDetail: "",
            questionTip: "",
            // 预测试的问题时间限制，以秒为单位
            questionAnswerTime: 0,
            // 文件上传位置：bos or local
            uploadLocation: "",
            // 文件上传 url
            uploadUrl: "",

            // 重试相关的参数
            retryCount: 0,
            maxRetry: 10,

            // 预测试之后的结果展示
            analysisResult: {
                canRcg: false,
                qualityIsOk: false,
                msg: ""
            }
        };
    },
    mounted() {
        recorderManager.onStop(res => {
            console.log("[audio_test] recorder stop", res);
            tempFilePath = res.tempFilePath;
        });
        this.initAudioTest();
    },
    methods: {
        onChange(stateName, current) {
            this[stateName] = current;
        },

        reTest() {
            this.resultLoading = true;
            this.stepCurrent = 0;
            this.state = "prepare";
            this.initAudioTest();
        },

        jumpToExam() {
            Taro.redirectTo({
                url: `/subpackages/exam/index`
            });
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
                api.get("/api/exam/pretest-wav-url")
                    .then(res => {
                        if (res.data.code == 0) {
                            this.uploadLocation = res.data.data.fileLocation;
                            this.uploadUrl = res.data.data.url;
                            this.uploadRecording(
                                this.uploadLocation,
                                this.uploadUrl,
                                tempFilePath
                            );
                        } else {
                            this.toastText = res.data.msg;
                            this.toastShow = true;
                            setTimeout(() => {
                                this.$taro.redirectTo({
                                    url: `/pages/index/index`
                                });
                            }, 1000);
                        }
                    })
                    .catch(err => {
                        console.log("err: ", err);
                    });
            }

            this.stepCurrent = (this.stepCurrent + 1) % 4;
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

        initAudioTest() {
            this.dataLoading = true;
            api.get("/api/exam/pretest-wav-info").then(res => {
                if (res.data.code == 0) {
                    this.questionRawText = res.data.data.questionContent;
                    this.questionTipDetail = res.data.data.questionInfo.detail.replace(
                        /<br>/g,
                        "\n"
                    );
                    this.questionTip = res.data.data.questionInfo.tip;
                    this.questionAnswerTime = res.data.data.questionLimitTime;
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

        reTry(func, arg) {
            this.retryCount++;
            setTimeout(() => func(arg), 500);
        },

        uploadRecording(uploadLocation, uploadUrl, tempFilePath) {
            const _this = this;

            if (uploadLocation === "BOS") {
                uploadSoundToBOS(tempFilePath, uploadUrl, function() {
                    // 上传成功调用，告知服务器进行分析
                    let params = {
                        filePath: _this.uploadUrl,
                        stdText: _this.questionRawText
                    };
                    api.post("/api/exam/pretest-analysis", params)
                        .then(res => {
                            console.log("已通知服务器上传成功");
                            _this.getAudioTestResult();
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

                                this.toastText =
                                    "系统出了点状况，请联系管理员解决噢～";
                                this.toastShow = true;
                                setTimeout(() => {
                                    Taro.redirectTo({
                                        url: `/pages/index/index`
                                    });
                                }, 1500);
                            }
                        });
                });
            }
        },

        // 获取测试结果
        getAudioTestResult() {
            api.get("/api/exam/pretest-result")
                .then(res => {
                    if (res.data.code == 0) {
                        // 分析结果，判断是否需要重做
                        this.resultLoading = false;
                        this.analysisResult.canRcg = res.data.data["canRcg"];
                        this.analysisResult.qualityIsOk =
                            res.data.data["qualityIsOk"];

                        if (this.analysisResult.canRcg) {
                            // 能识别
                            if (this.analysisResult.qualityIsOk) {
                                // 声音预测试通过
                                this.analysisResult.msg =
                                    "音频环境测试结束，您的环境符合要求。";
                            } else {
                                // 声音预测试不通过，重新测试
                                this.analysisResult.msg =
                                    "您的声音质量不高，这可能由环境或麦克风记录导致。";
                            }
                        } else {
                            // 不能识别，重新测试
                            this.analysisResult.msg =
                                "您的声音暂不能识别，请尽可能说清楚，并保持环境安静。";
                        }
                    } else if (res.data.code === 5104) {
                        // 处理中
                        if (this.retryCount < this.maxRetry) {
                            this.reTry(() => this.getAudioTestResult());
                        } else {
                            console.log(
                                "Try checkPreparation() max times! But the task is still waiting"
                            );
                        }
                    } else {
                        // test_id 错误，不应该出现的情况
                        this.toastText = "系统出了点状况，请联系管理员解决噢～";
                        this.toastShow = true;
                        setTimeout(() => {
                            this.$taro.redirectTo({
                                url: `/pages/index/index`
                            });
                        }, 1000);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};
</script>