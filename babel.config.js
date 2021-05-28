// 这是项目发布阶段需要用到的 babel 插件
const prodPlugins = []
    // 获取当前的编译模式
if (process.env.NODE_ENV === 'production') {
    // production 说明处于产品的发布模式 发布模式就把 console.log 给移除
    prodPlugins.push('transform-remove-console')
}
// 如果不是 production 说明处于开发模式 就不会添加 transform-remove-console 到 prodPlugins 数组中 那么 prodPlugins 就是一个空数组


module.exports = {
    "presets": [
        "@vue/cli-plugin-babel/preset"
    ],
    "plugins": [
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
            }
        ],
        // ...展开运算符 
        // 发布产品时候的插件数组
        ...prodPlugins,
        // 加载路由懒加载组件
        '@babel/plugin-syntax-dynamic-import'
    ]
}