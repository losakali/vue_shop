<template>
  <el-container class="home-container">
    <!-- el-header 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- el-container 页面主体区域 -->
    <el-container>
      <!-- el-aside 侧边栏 -->
      <!-- 使用三目运算符 来更改折叠的宽度和图标的切换 -->
      <el-aside :width="isCollapse ?'64px':'200px'">
          <!-- toggle-button点击按钮隐藏侧边栏 -->
        <div class="toggle-button" @click="toggleCollapse">
            <i :class="isCollapse ? 'iconfont icon-arrow-right':'iconfont icon-arrow-left'"></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <!-- active-text-color激活的文本颜色 即选中的文本颜色 -->
        <!-- unique-opened	是否只保持一个子菜单的展开 属性为布尔值 所以要属性绑定 -->
        <!-- collapse为el-menu的属性 折叠菜单栏 -->
        <!-- collapse-transition	是否开启折叠动画 -->
        <!-- router	是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
        <!-- :router="true" 简写 router -->
        <!-- 
          default-active	当前激活菜单的 index 点击菜单项或者刷新页面 选中的项依然保持高亮 
          当前index = 接口地址
          所以 :default-active="$route.path"
        -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409BFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="$route.path"
        >
        <!-- el-submenu 是组 一级菜单 -->
        <!-- el-submenu嵌套el-submenu就可以实现多下拉菜单里嵌套下拉菜单 -->
        <!-- index一样的话 点击一个菜单 所有菜单都会展开 -->
        <!-- index里面只接收字符串 所以要转换一下 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
              <!-- template 一级菜单的模板区域 -->
            <template slot="title">
                <!-- i 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- span 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- el-menu-item 是项 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <!-- 二级菜单模板区域 -->
            <template slot="title">
                <!-- i 图标 -->
              <i class="el-icon-menu"></i>
              <!-- span 文本 -->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- el-main 右侧内容主体 -->
      <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// 退出功能实现原理
// 基于 token 的方式实现退出比较简单，只需要销毁本地的 token 即可。这样，后续的请求就不会携带 token，
// 必须重新登录生成一个新的 token 之后才可以访问页面
// 步骤：
//     清空 token
//     window.sessionStorage.clear(); //清空sessionStorage的缓存数据
//     跳转到登录页
//     this.$router.push('/login');   //通过push提交方式 提交到后端 后端操作退出


export default {
  data(){
      return{
        //   左侧菜单数据
        menulist: [],
        // 通过 把循环的id当作对象的key值 从而把图标渲染出来 key:字体图标类名
        iconsObj:{
            '125':'iconfont icon-zhanghuguanli',
            '103':'iconfont icon-parcel',
            '101':'iconfont icon-shopping',
            '102':'iconfont icon-order',
            '145':'iconfont icon-shujufenxi'
        },
        // 是否折叠菜单栏 false不折叠
        isCollapse:false
      }
  },
    // created 挂载生命周期函数 里面的函数页面一加载就会执行
  created(){
      this.getMenuList()
  },
  methods: {
    //   退出功能
    logout() {
        // 清空session然后跳转到登录页
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // getMenuList()获取左侧菜单函数 挂载到了生命周期里 一加载页面就会执行
    async getMenuList(){
        // menus 左侧菜单接口 
        const {data:res} = await this.$http.get('menus');
        //console.log(res);
        // $message是element-ui消息弹框实例对象
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
        // 没有问题 把获取回来的数据给 data的menulist数组
        this.menulist = res.data;
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse(){
        this.isCollapse = !this.isCollapse;
    }
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  // align-items: center; 居中 这里是侧轴 所以是上下居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
      border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    cursor: pointer;
}
</style>