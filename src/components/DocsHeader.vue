<template>
    <view class="doc-header">
        <view class="doc-header__title">{{ title }}</view>
    </view>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: "标题"
        }
    }
};
</script>
<style lang="scss">
.doc-header {
    display: flex;
    align-items: center;
    padding: 80px 60px;

    &__title {
        position: relative;
        height: 90px;
        color: #333;
        font-size: 40px;
        font-weight: bold;

        &::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            display: inline-block;
            width: 120px;
            height: 2px;
            border-radius: 1px;
            background-color: #6190e8;
        }
    }
}
</style>
