<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <!-- :model="表单对象data数据" -->
      <!-- :rules="rules" rules属性 值为表单验证规则对象 -->
      <!-- ref Vue中用来操作DOM元素对象的 引用该元素 -->
      <el-form
        ref="loginFormRef"
        :model="loginFrom"
        :rules="loginFormRules"
        label-width="0px"
        class="login_from"
      >
        <!-- 用户名 -->
        <!-- prop="表单验证规则" -->
        <el-form-item prop="username">
          <!-- prefix-icon在输入框前面加图标 -->
          <!-- 这里用老师的图标 在prefix-icon输入名字就行 -->
          <el-input
            v-model="loginFrom.username"
            prefix-icon="iconfont icon-live-spiker"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <!-- 通过type属性选择输入框的类型 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginFrom.password"
            type="password"
            prefix-icon="iconfont icon-unlock"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <!-- type是按钮颜色 -->
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginFrom('loginFormRef')"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
  <!-- 
      box-sizing: border-box; 
      border-box: border + padding = 实际的宽度
      即根据盒子大小 自动把超出的部分缩回来 所谓的弹性盒子模型
   -->
</template>

<script>
export default {
  data() {
    return {
      // 登录表单数据绑定的对象
      loginFrom: {
        username: 'admin',
        password: '123456',
      },
      // :rules element-ui的属性 绑定表单验证规则对象
      // 表单验证规则 loginFormRules
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          {
            required: true, //required true表示必填项
            message: '请输入用户名', //message 错误提示消息
            trigger: 'blur', //trigger 什么时候触发  blur失去焦点的时候
          },
          {
            min: 3, // 可输入小长度
            max: 10, // 可输入最大长度
            message: '长度在 3 到 10 个字符', // 错误 提示消息
            trigger: 'blur', //触发时机
          },
        ],
        // 验证密码是否合法
        password: [
          {
            required: true, //required true表示必填项
            message: '请输入登录密码', //message 错误提示消息
            trigger: 'blur', //trigger 什么时候触发  blur失去焦点的时候
          },
          {
            min: 6, // 可输入小长度
            max: 15, // 可输入最大长度
            message: '长度在 6 到 15 个字符', // 错误 提示消息
            trigger: 'blur', //触发时机
          },
        ],
      },
    }
  },
  methods: {
    // 点击重置按钮 重置登录表单
    // formName 表单实例对象
    resetLoginFrom(formName) {
      //console.log(this);// 其中的一项$refs: {loginFormRef: VueComponent} 则通过this.$refs就可获得组件的实例对象loginFormRef
      this.$refs[formName].resetFields() // resetFields element-ui提供的表单方法 通过表单实例对象调用
    },
    login() {
      // 箭头函数 形参只有一个可以省略小括号
      // validate 是element-ui的表单验证方法 形参为一个回调函数
      // 回调函数的形参一：是否验证成功 成功返回true否则false 布尔值
      //          形参二：未通过校验的字段 是一个对象
      this.$refs.loginFormRef.validate(async (valid, obj) => {
        //console.log(valid);
        //console.log(obj);
        if (!valid) return // 如果为 false 则直接退出函数 不发起请求
        // 发起axios请求
        // {data:res} 为es6语法 解构赋值 这里把 返回的对象中的data属性赋值给了res
        const { data: res } = await this.$http.post('login', this.loginFrom)
        //console.log(res);
        // 根据返回的数据来实行下面的操作
        // error为$message实例对象的方法里面填消息框的内容 是element-ui提供的 需要导入message弹框组件
        //状态码不等于200表示登录失败
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 等于200 登录成功
        this.$message.success(res.meta.msg)
        // 1.将登录成功之后的 token,保存到客户端的 sessionStorage 中 sessionStorage：浏览器会话期间的存储机制
        // 2.项目中除了登录之外的其它API接口，必须在登录之后才能访问
        // 3.token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token) // 把token保存到sessionStroage中 语法： window.sessionStorage.setItem('键名',值);
        // 4.通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home') // $router vue路由的实例对象 挂载到vue之后通过 $的方式调用
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns {
  display: flex;
  justify-content: center;
}
.login_from {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>