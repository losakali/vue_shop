import Vue from 'vue'
// 导入APP根组件
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标 注意要在全局样式之前导入
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入 nprogress 进度条组件
import NProgress from 'nprogress'
// 导入 nprogress 进度条组件样式
import 'nprogress/nprogress.css'
// 导入 axios 
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://59.110.35.71:8889/api/private/v1/'


// 在 request 请求拦截器中,展示进度条 Nprogress.start()

// 通过 axios 请求拦截器添加 token,保证拥有获取数据的权限
// 步骤：
//     axios 请求拦截
//axios.interceptors.request.use(config=>{
//     为请求头对象，添加 token 验证的 Authorization 字段
//    config.headers.Authorization = window.sessionStorage.getItem('token');
//    return config; 处理完成 return config
//})
// 只要是用axios请求的 都会进行请求预处理 
axios.interceptors.request.use(config => {
    // 展示进度条
    NProgress.start()

    //  config 请求对象 里面包含了请求的各种数据
    //console.log(config);
    // config.headers 请求头对象
    // Authorization后端需要接收的属性 由后端定义而来的
    config.headers.Authorization = window.sessionStorage.getItem('token');
    // 最后必须return config 这是固定写法
    return config
})

// 在 response 响应拦截器中,隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
    // 隐藏进度条
    NProgress.done();

    return config
})

// 把axios挂载到Vue的原型上 使得全局都可以访问
// $http为自定义的名称 代表 axios
Vue.prototype.$http = axios;
Vue.config.productionTip = false
// 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)
// 注册全局的时间过滤器
// originVal时间戳
// dateFormat 过滤器名称
Vue.filter('dateFormat', function (originVal) {
    const dt = new Date(originVal)
    // 年月日
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0') // 月份 因为是从0开始的 所以加1 转换成字符串 padStart 不足两位补0
    const d = (dt.getDate() + '').padStart(2, '0')
    // 时分秒
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    // 返回处理过后的时间
    return `${y}-${m}-${d}-${hh}:${mm}:${ss}`
})
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')