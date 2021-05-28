<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <!-- 
          el-alert 警告组件
          closable属性决定是否可关闭
          show-icon 根据type类型展示其默认的图标
       -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <!-- 
          el-row 行
          el-col 列
       -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- 
            el-cascader 级联选择器
            :props="{ expandTrigger: 'hover' }" 鼠标经过展开子菜单
            :options 级联选择器数据源
            :props 配置项 太多了 自己看element-ui官网
            v-model="数组" 绑定数组 选中的数据会保存到该数组中
            change	当选中节点变化时触发
            clearable	是否支持清空选项
            checkStrictly 是否允许选中父级分类 在props中设置
          -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="{
              expandTrigger: 'hover',
              value: cateProps.value,
              label: cateProps.label,
              children: cateProps.children,
            }"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 
          tab 页签区域
          label 标题
          name 点击获取到的数据 这里根据接口取值
      -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 type="expand" -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <!-- 
                  el-tag 标签
                  closable 标签的关闭按钮
                 -->
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <!-- 
                  v-if="inputVisible" 文本框与按钮的显示与隐藏
                  v-model="inputValue" 文本框双向绑定的内容
                  ref 文本框实例对象
                  size 文本框的尺寸
                  @keyup.enter.native 按下回车键触发的事件
                  @blur 失去焦点触发的事件
                 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  >编辑</el-button
                >
                <el-button
                  @click="removeParams(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 type="expand" -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <!-- 
                  el-tag 标签
                  closable 标签的关闭按钮
                 -->
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <!-- 
                  v-if="inputVisible" 文本框与按钮的显示与隐藏
                  v-model="inputValue" 文本框双向绑定的内容
                  ref 文本框实例对象
                  size 文本框的尺寸
                  @keyup.enter.native 按下回车键触发的事件
                  @blur 失去焦点触发的事件
                 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  >编辑</el-button
                >
                <el-button
                  @click="removeParams(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      catelist: [],
      //   级联选择框的配置对象
      cateProps: {
        value: 'cat_id', // 选中的值
        label: 'cat_name', // 当前联的名字
        children: 'children', // 父子嵌套的属性 即返回的 children 数组
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //   被激活的页签名称
      activeName: 'many',
      //   动态参数列表数据
      manyTableData: [],
      // 静态属列表数据
      onlyTableData: [],
      //   控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //   添加参数的表单的数据对象
      addForm: {
        attr_name: '',
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur',
          },
        ],
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    //   获取商品分类数据列表
    //    - 请求路径：categories
    //    - 请求方法：get
    //    - 请求参数
    //
    //| 参数名   | 参数说明           | 备注                                                         |
    //| -------- | ------------------ | ------------------------------------------------------------ |
    //| type     | [1,2,3]            | 值：1，2，3 分别表示显示一层二层三层分类列表<br />【可选参数】如果不传递，则默认获取所有级别的分类 |
    //| pagenum  | 当前页码值         | 【可选参数】如果不传递，则默认获取所有分类                   |
    //| pagesize | 每页显示多少条数据 | 【可选参数】如果不传递，则默认获取所有分类                   |
    this.getCateList()
  },
  methods: {
    //   获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 获取成功
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择框中选项变化，会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 因为这里只允许选中三级分类 如果选中的不是三级分类直接return出去
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)
      // 根据所选分类的Id,和当前所处的面板，获取对应的参数
      // - 请求路径：categories/:id/attributes
      // - 请求方法：get
      // - 请求参数
      //
      // | 参数名 | 参数说明    | 备注                                                      |
      // | ------ | ----------- | --------------------------------------------------------- |
      // | :id    | 分类 ID     | 不能为空`携带在url中`                                     |
      // | sel    | [only,many] | 不能为空,通过 only 或 many 来获取分类静态参数还是动态参数 |
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      //   获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //    获取成功
      // 把attr_vals字符串转换成数组
      res.data.forEach((item) => {
        // 判断 attr_vals 是否为空 为空返回一个空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [] //这里要空格
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      //   判断获取的是动态参数的数据还是静态参数的数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab 页签点击事件的处理函数
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //    ### 添加动态参数或者静态属性
    //
    //- 请求路径：categories/:id/attributes
    //- 请求方法：post
    //- 请求参数
    //
    //| 参数名    | 参数说明                                   | 备注                  |
    //| --------- | ------------------------------------------ | --------------------- |
    //| :id       | 分类 ID                                    | 不能为空`携带在url中` |
    //| attr_name | 参数名称                                   | 不能为空              |
    //| attr_sel  | [only,many]                                | 不能为空              |
    //| attr_vals | 如果是 many 就需要填写值的选项，以逗号分隔 | 【可选参数】          |

    // 点击按钮添加参数  成功状态码 201
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        // 获取失败
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 提交成功
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.addDialogVisible = false
        // 刷新数据
        this.getParamsData()
      })
    },
    // ### 根据 ID 查询参数
    //
    // - 请求路径：categories/:id/attributes/:attrId
    // - 请求方法：get
    // - 请求参数
    //
    // | 参数名    | 参数说明                                   | 备注                  |
    // | --------- | ------------------------------------------ | --------------------- |
    // | :id       | 分类 ID                                    | 不能为空`携带在url中` |
    // | :attrId   | 属性 ID                                    | 不能为空`携带在url中` |
    // | attr_sel  | [only,many]                                | 不能为空              |
    // | attr_vals | 如果是 many 就需要填写值的选项，以逗号分隔 |                       |
    // 点击按钮 展示编辑的对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      // 获取成功
      this.editForm = res.data
      // 展示对话框
      this.editDialogVisible = true
    },
    // 重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // ### 编辑提交参数
    //
    // - 请求路径：categories/:id/attributes/:attrId
    // - 请求方法：put
    // - 请求参数
    //
    // | 参数名    | 参数说明               | 备注                       |
    // | --------- | ---------------------- | -------------------------- |
    // | :id       | 分类 ID                | 不能为空`携带在url中`      |
    // | :attrId   | 属性 ID                | 不能为空`携带在url中`      |
    // | attr_name | 新属性的名字           | 不能为空，携带在`请求体`中 |
    // | attr_sel  | 属性的类型[many或only] | 不能为空，携带在`请求体`中 |
    // | attr_vals | 参数的属性值           | 可选参数，携带在`请求体`中 |
    // 点击按钮修改参数信息
    editParams() {
      // 验证表单
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        // 获取失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        // 提交成功
        this.$message.success('修改参数成功！')
        // 重新获取数据
        this.getParamsData()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // ###  删除参数
    //
    // - 请求路径： categories/:id/attributes/:attrid
    // - 请求方法：delete
    // - 请求参数
    //
    // | 参数名  | 参数说明 | 备注                  |
    // | ------- | -------- | --------------------- |
    // | :id     | 分类 ID  | 不能为空`携带在url中` |
    // | :attrid | 参数 ID  | 不能为空`携带在url中` |
    // 根据id删除对应的参数项
    async removeParams(attr_id) {
      // this.$confirm是element-ui 的 MessageBox 弹框 的实例对象 下面这段代码是官网复制过来的
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 用户取消了删除操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 用户确定了删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      // 删除成功
      this.$message.success('删除参数成功')
      // 刷新列表
      this.getParamsData()
    },
    // ### 编辑提交参数
    //
    // - 请求路径：categories/:id/attributes/:attrId
    // - 请求方法：put
    // - 请求参数
    //
    // | 参数名    | 参数说明               | 备注                       |
    // | --------- | ---------------------- | -------------------------- |
    // | :id       | 分类 ID                | 不能为空`携带在url中`      |
    // | :attrId   | 属性 ID                | 不能为空`携带在url中`      |
    // | attr_name | 新属性的名字           | 不能为空，携带在`请求体`中 |
    // | attr_sel  | 属性的类型[many或only] | 不能为空，携带在`请求体`中 |
    // | attr_vals | 参数的属性值   字符串         | 可选参数，携带在`请求体`中 |
    // 将对 attr_vals 的操作,保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求,保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          // 把数组转换成数组 用空格分隔
          attr_vals: row.attr_vals.join(' '),
        }
      )
      // 提交失败
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数向失败')
      }
      // 提交成功
      this.$message.success('修改参数向成功')
      // 浏览器刷新时就可以看到效果
    },
    // 文本框失去焦点，或按下了 回车键 触发的事件
    handleInputConfirm(row) {
      // 去除字符串两端的空格 并判断是否为空 为空重置为 ''
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // 恢复按钮
        row.inputVisible = false
        return
      }
      // 如果没有 return,则证明输入的内容需要做后续处理
      // 把输入的文本内容添加到 row.attr_vals 数组
      row.attr_vals.push(row.inputValue.trim())
      // 重置 row.inputValue
      row.inputValue = ''
      // 恢复按钮
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点 element-ui 里复制过来的 理解下就行
      // $nextTick 方法作用，就是当页面上元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClose(index, row) {
      // 根据索引删除原数组元素
      row.attr_vals.splice(index, 1)
      // 调用修改操作函数
      this.saveAttrVals(row)
    },
  },

  //   计算属性computed
  computed: {
    //   如果按钮需要被禁用，则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的Id
    cateId() {
      // 判断有没有选中三级分类
      if (this.selectedCateKeys.length === 3) {
        // 选中的话把id值返回
        return this.selectedCateKeys[2]
      }
      // 没有选中返回Null
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  width: 30%;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>