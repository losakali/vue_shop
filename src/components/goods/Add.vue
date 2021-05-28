<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 
        提示区域 
        closable="false" 隐藏删除按钮
      -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 
        步骤条区域
        :active="0" 激活项 
        align-center 步骤条居中
        :space="300" 步骤条宽度
        activeIndex-0 把字符串转换成数字
       -->
      <el-steps
        :space="300"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 
        tab栏区域 
        :tab-position 标签位置
        v-model 点击哪项 绑定的值会变成 name值
        标签页切换的事件
        before-leave	切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。	Function(activeName, oldActiveName)
        tab-click	tab 被选中时触发
      -->
      <!-- label-position="top" 表单的提示文本在上 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromRef"
        label-position="top"
        label-width="100px"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addFrom.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 
                级联选择器 
                v-model 绑定的是一个数组
              -->
              <el-cascader
                v-model="addFrom.goods_cat"
                :options="catelist"
                :props="{
                  expandTrigger: 'hover',
                  label: cateProps.label,
                  value: cateProps.value,
                  children: cateProps.children,
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 Item 项 -->
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- Checkbox 多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(cb, index) in item.attr_vals"
                  :key="index"
                  :label="cb"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              upload 上传功能
              action 表示图片要上传到的API地址 需要写完整地址
              :on-preview 预览事件
              :on-remove 单击图片关闭按钮触发的事件 function(file, fileList)
              list-type="picture" 预览效果 function(file)
              headers	设置上传的请求头部
              on-success	文件上传成功时的钩子 即文件上传成功调用的函数	function(response, file, fileList)
            -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 要安装对应依赖包并在main.js全局注册这个组件才能使用 -->
            <quill-editor v-model="addFrom.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
//导入深拷贝组件
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条激活项
      activeIndex: '0',
      // 添加商品的表单数据对象
      addFrom: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详细描述
        goods_introduce: '',
        // 动态参数和静态属性
        attrs: [],
      },
      // 表单验证规则
      addFromRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur',
          },
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur',
          },
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur',
          },
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur',
          },
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur',
          },
        ],
      },
      // 商品分类列表
      catelist: [],
      // 级联选择器配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      // 因为之前的请求都是用axios请求的 所以在main.js都做了请求拦截 而图片上传是
      //  直接上传的，所以需要设置请求头信息 为请求头加上 token 信息
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片预览地址
      previewPath: '',
      // 对话框的显示与隐藏
      previewVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  // ### 添加商品
  //
  // - 请求路径：goods
  // - 请求方法：post
  // - 请求参数
  //
  // | 参数名          | 参数说明                                          | 备注     |
  // | --------------- | ------------------------------------------------- | -------- |
  // | goods_name      | 商品名称                                          | 不能为空 |
  // | goods_cat       | 以为','分割的分类列表                             | 不能为空 |
  // | goods_price     | 价格                                              | 不能为空 |
  // | goods_number    | 数量                                              | 不能为空 |
  // | goods_weight    | 重量                                              | 不能为空 |
  // | goods_introduce | 介绍                                              | 可以为空 |
  // | pics            | 上传的图片临时路径（对象）                        | 可以为空 |
  // | attrs           | 商品的参数（数组），包含 `动态参数` 和 `静态属性` | 可以为空 |
  methods: {
    // ### 商品分类数据列表
    //
    // - 请求路径：categories
    // - 请求方法：get
    // - 请求参数
    //
    // | 参数名   | 参数说明           | 备注                                                         |
    // | -------- | ------------------ | ------------------------------------------------------------ |
    // | type     | [1,2,3]            | 值：1，2，3 分别表示显示一层二层三层分类列表<br />【可选参数】如果不传递，则默认获取所有级别的分类 |
    // | pagenum  | 当前页码值         | 【可选参数】如果不传递，则默认获取所有分类                   |
    // | pagesize | 每页显示多少条数据 | 【可选参数】如果不传递，则默认获取所有分类                   |
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败!')
      }
      // 请求成功
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项变化,会触发这个函数
    handleChange() {
      console.log(this.addFrom.goods_cat)
      // 判断选中的是不是三级分类 不是把数组清空
      if (this.addFrom.goods_cat.length !== 3) {
        this.addFrom.goods_cat = []
      }
    },
    // 标签页切换触发的函数
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是' + oldActiveName)
      // console.log('即将进入的标签页名字是' + activeName)
      // 处于基本信息标签 且 没有选择商品分类的情况下不让切换
      if (oldActiveName == '0' && this.addFrom.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false // 阻止切换
      }
    },
    // tab标签标签被选中触发的函数
    async tabClicked() {
      // 证明访问的是动态参数面板
      if (this.activeIndex == '1') {
        // ### 参数列表
        //
        // - 请求路径：categories/:id/attributes
        // - 请求方法：get
        // - 请求参数
        //
        // | 参数名 | 参数说明    | 备注                                                      |
        // | ------ | ----------- | --------------------------------------------------------- |
        // | :id    | 分类 ID     | 不能为空`携带在url中`                                     |
        // | sel    | [only,many] | 不能为空,通过 only 或 many 来获取分类静态参数还是动态参数 |
        // 发起动态参数请求
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        // 把字符串转换成数组
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // 请求成功
        this.manyTableData = res.data
      } else if (this.activeIndex == '2') {
        // 发起静态参数请求
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表失败!')
        }
        // 请求成功
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // file 图片信息
      console.log(file)
      this.previewPath = file.response.data.url
      // 展示对话框
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // file 要被移除的图片信息
      console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从 pics 数组中，找到这个图片对应的索引值
      // x=>x.pic===filePath 这个是简写 直接返回x.pic===filePath的索引值的意思
      const i = this.addFrom.pics.findIndex((x) => x.pic == filePath)
      // 3.调用数组的 splice 方法，把图片信息对象，从pics数组中移除
      this.addFrom.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // response 服务器返回的数据对象
      console.log(response)
      // 1.拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path,
      }
      // 2.将图片信息对象，push 到 pics 数组中
      this.addFrom.pics.push(picInfo)
      console.log(this.addFrom.pics)
    },
    // 添加商品
    add() {
      // 验证表单
      this.$refs.addFromRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 验证成功 执行添加的业务逻辑
        // 把 goods_cat数组 转换成以逗号分隔的字符串
        // 因为级联选择器绑定的是一个数组 这里转换会造成冲突
        // 所以需要进行深拷贝 深拷贝需要安装一个 lodash 依赖包
        const form = _.cloneDeep(this.addFrom)
        // 把新对象里的goods_cat数组 转换成以逗号分隔的字符串
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            // 把数组转换成字符串
            attr_value: item.attr_vals.join(' '),
          }
          this.addFrom.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addFrom.attrs.push(newInfo)
        })
        form.attrs = this.addFrom.attrs
        // console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        // 成功状态码 201
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 添加成功 跳转到商品列表
        this.$router.push('/goods')
      })
    },
  },
  // 计算属性
  computed: {
    // 获取三级分类id
    cateId() {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
/* 多选框样式 */

.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>