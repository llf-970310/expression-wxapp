const path = require('path')

const config = {
    projectName: 'expression-wx',
    date: '2020-8-13',
    designWidth: 750,
    deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    alias: {
        '@/util': path.resolve(__dirname, '..', 'src/util'),
        '@': path.resolve(__dirname, '..', 'src'),
    },
    defineConstants: {
    },
    copy: {
        patterns: [
        ],
        options: {
        }
    },
    framework: 'vue',
    mini: {
        webpackChain(chain, webpack) {
            // chain.plugin('analyzer')
            //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, []);
            chain.merge({
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            echarts: {
                                name: "subpackages/result/components/echarts",  // 打包后的文件名
                                priority: 50,
                                test(module) {
                                    return /subpackages[\\/]result[\\/]components[\\/]ec-canvas/.test(module.resource);
                                }
                            }
                        }
                    }
                }
            });
        },
        addChunkPages(pages, pagesNames) {
            pages.set('subpackages/result/history/index', ['subpackages/result/components/echarts'])
            pages.set('subpackages/result/report/index', ['subpackages/result/components/echarts'])
        },
        postcss: {
            pxtransform: {
                enable: true,
                config: {

                }
            },
            autoprefixer: {
                enable: true
            },
            url: {
                enable: true,
                config: {
                    limit: 10240 // 设定转换尺寸上限
                }
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        }
    },
    h5: {
        publicPath: '/',
        staticDirectory: 'static',
        esnextModules: ['taro-ui-vue'],
        postcss: {
            autoprefixer: {
                enable: true,
                config: {
                }
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        }
    }
}

module.exports = function (merge) {
    if (process.env.NODE_ENV === 'development') {
        return merge({}, config, require('./dev'))
    }
    return merge({}, config, require('./prod'))
}
