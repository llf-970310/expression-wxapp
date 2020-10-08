module.exports = {
    env: {
        NODE_ENV: '"development"'
    },
    defineConstants: {
    },
    mini: {},
    h5: {
        devServer: {
            proxy: {
                '/api/': {
                    target: 'http://127.0.0.1:5000/api',
                    pathRewrite: {
                        '^/api': ''
                    },
                    changeOrigin: true
                }
            }
        }
    }
}
