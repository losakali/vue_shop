<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 
        卡片视图区域 
        el-row  行
        el-col  列
    -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="catelist"
        row-key="cat_id"
        border
        :treeProps="{ children: 'children' }"
      >
        <el-table-column type="index" label="序号" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.index }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cat_name" label="分类名称"> </el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template slot-scope="scope">
            <i v-if="!scope.row.cat_deleted" class="el-icon-success"></i>
            <i v-else class="el-icon-error"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
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
        class="treeTable"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 
      添加分类对话框
      @close="this.addCateFrom={}" 关闭对话框时清空表单数据
     -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <!-- 
          :model="addCateFrom"
          表单提交的数据
          prop 验证规则
          :rules 验证规则对象
       -->
      <el-form
        :model="addCateFrom"
        :rules="addCateFromRules"
        ref="addCateFromRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <!-- 根据接口文档定义属性的名称 -->
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
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
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              label: cascaderProps.label,
              children: cascaderProps.children,
              value: cascaderProps.value,
              checkStrictly: true,
            }"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        // 分类等级
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页显示数量
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总页数
      total: 0,
      //   控制分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //   添加分类的表单数据对象
      addCateFrom: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的ID 参数备注 不能为空，如果要添加1级分类，则父分类Id应该设置为  `0`
        cat_pid: 0,
        // 分类等级 参数备注  不能为空，`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        cat_level: 0,
      },
      // 添加分类的表单验证规则对象
      addCateFromRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类的名称',
            trigger: 'blur',
          },
        ],
      },
      // 1级2级分类列表数据 级联选择器数据源
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id', // 选中的值
        label: 'cat_name', // 当前联的名字
        children: 'children', // 父子嵌套的属性 即返回的 children 数组
      },
      // 选中的父级分类的ID数组
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 请求商品分类数据列表
    // 路径：categories
    // 方法：get
    // 参数：
    // type[1,2,3]值：1，2，3 分别表示显示一层二层三层分类列表<br />【可选参数】如果不传递，则默认获取所有级别的分类
    // 1获取一级分类 2获取一级二级分类 3获取一二三级分类 不传递1 2 3 默认获取一二三级分类
    // pagenum当前页码值【可选参数】如果不传递，则默认获取所有分类
    // pagesize每页显示多少条数据【可选参数】如果不传递，则默认获取所有分类

    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo,
      })
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      // 获取成功
      // 这里返回的data是一个对象 里面包含当前页和每页显示数据和总条数
      this.catelist = res.data.result
      // 判断返回的数组长度 如果大于0 调用索引方法
      if (this.catelist.length > 0) this.setTableIndex(this.catelist)
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 定义树状序号索引方法
    setTableIndex(arr, index) {
      arr.forEach((item, key) => {
        item.index = key + 1
      })
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      // newSize是分页控件选择的值 赋值给 querInfo.pagesize
      this.querInfo.pagesize = newSize
      // 刷新数据
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      // 刷新数据
      this.getCateList()
    },
    // 点击按钮显示添加分类的对话框
    showAddCateDialog() {
      // 获取1-2级分类数据
      this.getParentCateList()
      // 显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表 1级和2级
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      })
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // 获取成功
      // console.log(res.data);
      this.parentCateList = res.data
    },
    // 级联选择器选择项发生变化触发的函数
    parentCateChanged() {
      //console.log(this.selectedKeys);
      // 如果 selectedKeys 数组中的 length 大于0，证明选中了父级分类
      // 反之，就说明没有选中任何分类 默认为0 则添加的是父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateFrom.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ] // this.selectedKeys.length-1获取数组最后一项的索引
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = this.selectedKeys.length
      } else {
        // 添加父级分类
        // 父级分类的ID
        this.addCateFrom.cat_pid = 0
        // 为当前分类的等级赋值 0为父级分类
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      //console.log(this.addCateFrom);
      // 验证表单
      this.$refs.addCateFromRef.validate(async (valid) => {
        // 验证失败
        if (!valid) return
        // 验证成功
        // 发起请求
        // 路径：categories
        // 方法：post
        // 成功状态：201
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateFrom
        )
        // 请求失败
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        // 添加成功
        this.$message.success('添加分类成功！')
        // 刷新分类列表
        this.getCateList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFromRef.resetFields()
      // 重置分类
      this.selectedKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>