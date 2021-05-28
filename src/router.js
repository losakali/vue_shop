import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入登录组件  导入组件不要跟着教程抄 因为老师是把index.js导出外面了的
// import Login from './components/Login.vue'
// 懒加载形式导入 需要配置路由懒加载组件
const Login = () =>
    import ( /* webpackChunkName: "login_home_welcome" */ './components/Login.vue')
    // 导入 Home 组件
    // import Home from './components/Home.vue'
const Home = () =>
    import ( /* webpackChunkName: "login_home_welcome" */ './components/Home.vue')
    // 导入 Welcome 组件
    // import Welcome from './components/Welcome.vue'
const Welcome = () =>
    import ( /* webpackChunkName: "login_home_welcome" */ './components/Welcome.vue')


// 导入用户列表组件
// import User from './components/user/User.vue'
const User = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ './components/user/User.vue')
    // 导入权限列表组件
    // import Rights from './components/power/Rights.vue'
const Rights = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ './components/power/Rights.vue')
    // 导入角色列表组件
    // import Roles from './components/power/Roles.vue'
const Roles = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ './components/power/Roles.vue')


// 导入商品分类组件
// import Cate from './components/goods/Cate.vue'
const Cate = () =>
    import ( /* webpackChunkName: "Cate_Params" */ './components/goods/Cate.vue')
    // 导入分类参数组件
    // import Params from './components/goods/Params.vue'
const Params = () =>
    import ( /* webpackChunkName: "Cate_Params" */ './components/goods/Params.vue')


// 导入商品列表组件
// import GoodsList from './components/goods/List.vue'
const GoodsList = () =>
    import ( /* webpackChunkName: "GoodsList_Add" */ './components/goods/List.vue')
    // 导入添加商品组件
    // import Add from './components/goods/Add.vue'
const Add = () =>
    import ( /* webpackChunkName: "GoodsList_Add" */ './components/goods/Add.vue')

// 导入订单管理组件
// import Order from './components/order/Order.vue'
const Order = () =>
    import ( /* webpackChunkName: "Order_Report" */ './components/order/Order.vue')
    // 导入数据报表组件
    // import Report from './components/report/Report.vue'
const Report = () =>
    import ( /* webpackChunkName: "Order_Report" */ './components/report/Report.vue')
Vue.use(VueRouter)

const routes = [
    // 设置路由重定向 当访问 / 时重定向到 /login
    {
        path: '/',
        redirect: '/login'
    },
    {
        // 当访问 /login的时候 打开Login组件
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        // 当访问home组件时 重定向到 welcome组件
        redirect: '/home/welcome',
        children: [{
            path: '/home/welcome',
            component: Welcome
        }, {
            path: '/users',
            component: User
        }, {
            path: '/rights',
            component: Rights
        }, {
            path: '/roles',
            component: Roles
        }, {
            path: '/categories',
            component: Cate
        }, {
            path: '/params',
            component: Params
        }, {
            path: '/goods',
            component: GoodsList
        }, {
            path: '/goods/add',
            component: Add
        }, {
            path: '/orders',
            component: Order
        }, {
            path: '/reports',
            component: Report
        }]
    }
]

const router = new VueRouter({
        routes
    })
    // 路由导航守卫控制访问权限
    // 如果用户没有登录，但是直接通过URL访问特定页面，需要重新导航到登录页面
    // 例：
    //   为路由对象，添加 beforeEach 导航守卫方法 此方法里面接收一个回调函数
    //router.beforeEach(function(to,from,next){
    // to:将要访问的页面路径
    // from:从哪个路径跳转而来的
    // next:放行的函数 next() 放行 next('/login') 强制跳转
    // 如果用户访问的登录页，直接放行
    //    if(to.path == '/login') return next();
    // 从 sessionStoreage 中获取到 保存的 token 值
    //    const tokenStr = window.sessionStorage.getItem('token');
    // 没有token,强制跳转到登录页
    //    if(!tokenStr) return next('/login');
    // 有token 放行即可
    //    next();
    //});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login');
    next();
})
export default router