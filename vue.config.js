module.exports = {
    publicPath: './',
    assetsDir: 'static',
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/':{
                target:'http://127.0.0.1',
                changeOrigin:true
                // pathRewrite:{
                //     '/':''
                // }
            }
        }
    }
}