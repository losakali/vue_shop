<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <!-- el-row el-col 属于element-ui中的Layout布局 -->
      <!-- el-row 行  :gutter 列与列的间距-->
      <!-- el-col 列  :span="宽度"-->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 
              搜索框
              clearable 可清空输入框的数据
              clear事件	在点击由 clearable 属性生成的清空按钮时触发
              给他绑定页码事件 把页码设为1 即可重新获取数据并跳转到第一页
           -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="handleCurrentChange(1)"
          >
            <!-- 把搜索事件绑定到getUserList获取列表数据函数中 因为里面有个query属性 是根据这个属性的值查询的 -->
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>

        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <!-- 点击添加按钮显示对话框 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!-- el-table 表格 :data="数据对象数组" -->
      <!-- el-table-column 表格的列 label列名  prop列数据-->
      <!-- border 表格边框线 -->
      <!-- stripe 表格隔行变色 -->
      <!-- type="index" 把当前列变为索引列 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 可以去了解一下 element-ui里做了相应的操作 所以这里可以拿到值 -->
          <!-- scope.row拿到当前行的每一项数据 -->
          <template slot-scope="scope">
            <!-- 
                  change事件 element-ui提供的事件函数	switch 状态发生变化时的回调函数	可以获取新状态的值
                  把当前行数据传进去即可 会获取到改变后的数据
              -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <!-- size="mini" 按钮的大小 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id, scope.row.username)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <!-- el-tooltip文本提示框 -->
            <!-- placement显示的位置 -->
            <!-- effect 文本框的颜色 -->
            <!-- content 提示文字 -->
            <!-- enterable	鼠标是否可进入到 tooltip 中 默认时true 即鼠标是否可以进入到提示框中 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <!-- 
          current-page 当前页码 
          page-sizes 每页显示的条数
          page-size  当前每页显示多少条
          total 共xx条
          layout 要在页面显示哪些组件
      -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 
        添加用户的对话框 当点击添加用户的时候会弹出此对话框
        visible.sync 控制对话框的显示和隐藏 绑定的是一个布尔值
        before-close 对话框关闭之前触发的事件
        @close 对话框关闭时调用的事件
     -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <!-- :rules验证规则对象 -->
      <!-- prop验证规则属性 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- slot="footer" 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <!-- 点击取消隐藏对话框 -->
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框主体 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <!-- disabled="" 禁用输入框 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 对话框底部区域 -->
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="selectedRoleId=''"
    >
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.role_name }}</p>
      <p>
        分配新角色：
        <!-- 
          el-select 下拉菜单组件
          el-option 下拉菜单选项
          v-model="选中的值"  保存到data中
          :value  要记录的值 即选中之后要记录的值
        -->
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //   自定义验证规则
    //   验证手机号的规则
    //   直接调用callback回调函数代表校验通过
    var checkMobile = (rule, value, callback) => {
      //   定义验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      // value是输入的值
      // 验证输入的数据是否符合正则表达式
      if (regMobile.test(value)) {
        // 没有问题 返回回调函数即可
        return callback()
      }
      // 输入的值不合法
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      // pagenum当前页码
      // pagesize 每页显示多少条
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      //   用户数据
      userlist: [],
      //   总条数
      total: 0,
      //   控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //   添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //   添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur',
          },
          {
            //   添加自定义验证规则 checkMobile
            validator: checkMobile,
            trigger: ['blur', 'change'],
          },
        ],
      },
      //   控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //   查询到的用户信息对象
      editForm: {},
      //   修改表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur',
          },
          {
            //   添加自定义验证规则 checkMobile
            validator: checkMobile,
            trigger: ['blur', 'change'],
          },
        ],
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: [],
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色id
      selectedRoleId:''
    }
  },
  created() {
    // 发起用户列表数据请求
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 请求地址 users
      //   params传参的参数名需要与后台接收的参数名一致
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      //console.log(res);
      //   判断状态码可以在响应拦截器里做 不提示一样消息的话
      if (res.meta.status != 200) return this.$message.error('获取用户列表失败')
      this.userlist = res.data.users
      this.total = res.data.total
    }, // 监听 pagesize 改变的事件 每页显示多少条
    handleSizeChange(newSize) {
      //   console.log(newSize)  newSize拿到的是下拉菜单每页显示多少条的数据 显示1条 得到1 ...
      this.queryInfo.pagesize = newSize
      // 当data的queryInfo的值发生了变化 此时可以重新请求更新数据
      this.getUserList()
    },
    //  监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      //   console.log(newPage) newPage获取到的是当前的页码 比如当前页码是1 点击2 就会变成2
      this.queryInfo.pagenum = newPage
      // data的querInfo数据更新 重新获取数据
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
      //console.log(userinfo); 获取到的是当前行改变后的数据
      // 请求 修改用户状态 接口 请求路径 users/:uid/state/:type 类型put
      // 为了方便字符串拼接 使用反引号 ``
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        //   修改失败 把开关状态重置回来
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      //   更新成功 弹出成功提示框
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 调用form表单的实例对象ref里自带的resetFields方法来清空表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新用户
    addUser() {
      // 调用form表单的实例对象ref里自带的validate方法来检查输入项有没有出错
      // 没有出错返回true 有错返回false
      this.$refs.addFormRef.validate(async (valid) => {
        //console.log(valid);
        // 校验失败 直接结束函数
        if (!valid) return
        // 校验成功 可以发起添加用户的请求
        // 添加用户: 路径:users 方法:post 参数username password email mobile
        // 接口校验成功statuts值为201
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          // res.meta.msg返回的提示信息
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 刷新用户列条 重新获取用户的列表数据
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // 根据id查询用户信息
      // 路径: users/:id
      // 方法: get
      // 参数: id
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败!')
      }
      // 给data的 editForm 对象赋值
      this.editForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      // 重置表单
      // 这里用resetFields清空的话会给editForm加个初始值
      // 所以用clearValidate 对部分表单字段进行校验的方法
      // 这两个都是element-ui的form表单的实例方法
      this.$refs.editFormRef.clearValidate()
    },
    // 修改用户信息并提交
    editUserInfo() {
      // 对表单进行预验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 校验通过发起用户信息的数据请求
        // 路径: users/:id
        // 方法: put
        // 参数 id email mobile
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        // 修改成功 隐藏对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById(id, name) {
      // 弹框询问用户是否删除数据 $confirm
      //返回的对象是一个Promise 所以可以用 async来修饰
      const confirmResult = await this.$confirm(
        '此操作将永久删除' + name + '用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          //   type 图标类型
          type: 'warning',
        }
      ).catch((err) => {
        // 点击取消按钮会触发错误信息 直接把它给return掉就好
        // 即不要提示错误
        return err //此时confirmResult会接收err
      })
      // 如果用户确认删除,则返回值为字符串 confirm
      // 如果用户取消删除,则返回值为字符串 cancel
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发起删除用户请求
      // 路径: users/:id
      // 方法: delete
      // 参数: id
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除' + name + '用户失败')
      }
      this.$message.success('删除' + name + '用户成功')
      // 因为在最后一页删除最后一条数据后会出现无数据的问题
      // 调用监听页码值的改变事件即可 里面有重新获取数据的调用
      this.handleCurrentChange(1)
    },
    // 展示分配角色对话框
    // userInfo scope.row传过来的
    async setRole(userInfo) {
      // 把当前角色信息保存到data的userInfo中
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色的列表
      // 路径：roles
      // 方法：get
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取成功 把获取到的数据保存到data的rolesList中
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮分配角色
    async setRoleInfo(){
      // 如果用户没有选中新的角色直接return提示消息
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色');
      }
      // 发起分配角色请求
      // 路径：users/:id/role
      // 方法：put
      // id 用户id rid 角色id
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid:this.selectedRoleId
      });
      // 提交失败
      if(res.meta.status !== 200){
        return this.$message.error(res.meta.msg);
      }
      // 提交成功
      this.$message.success('更新角色成功');
      // 刷新列表
      this.getUserList();
      // 隐藏对话框
      this.setRoleDialogVisible = false;
      // 记得在对话框关闭事件中重置selectedRoleId
    }
  },
}
</script>

<style lang="less" scoped>
</style>