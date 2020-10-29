export default {
  pages: [
    'pages/index/index',
    // 'pages/exam/index',
    // 'pages/result/history/index',
    // 'pages/result/report/index',
    // 'pages/result/statistic/index',
    'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subpackages: [
    {
      "root": "subpackages/result",
      "name": "result",
      "pages": [
        'history/index',
        'report/index',
      ]
    },
    {
      "root": "subpackages/exam",
      "name": "exam",
      "pages": [
        'index',
      ]
    }
  ]
}
