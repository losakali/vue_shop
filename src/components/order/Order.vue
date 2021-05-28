<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据表格 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              circle
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              circle
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
      >
        <el-form-item label="省市区/县" prop="address1">
          <v-distpicker
            :province="addressForm.address1.address__province"
            :city="addressForm.address1.address__city"
            :area="addressForm.address1.address__dist"
            @selected="addressChecked"
            @province="onChangeProvince"
            @city="onChangeCity"
            @area="onChangeArea"
          ></v-distpicker>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入省市级依赖包
import VDistpicker from 'v-distpicker'

export default {
  // 使用省市级组件
  components: { VDistpicker },
  data() {
    return {
      querInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //   总数据条数
      total: 0,
      // 订单列表
      orderlist: [],
      //   修改地址对话框的显示与隐藏
      addressVisible: false,
      //   修改地址表单
      addressForm: {
        address1: {
          address__province: '',
          address__city: '',
          address__dist: '',
        },
        address2: '',
      },
      // 修改地址表单验证规则
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区县',
            trigger: 'blur',
          },
        ],
        address2: [
          {
            required: true,
            message: '请填写详细地址',
            trigger: 'blur',
          },
        ],
      },
      //   物流进度对话框的显示与隐藏
      progressVisible: false,
      // 物流信息
      progressInfo: [],
    }
  },
  created() {
    //   获取订单列表
    this.getOrderList()
  },
  methods: {
    //   ### 订单数据列表
    //
    // - 请求路径：orders
    // - 请求方法：get
    // - 请求参数
    //
    // | 参数名               | 参数说明        | 备注     |
    // | -------------------- | --------------- | -------- |
    // | query                | 查询参数        | 可以为空 |
    // | pagenum              | 当前页码        | 不能为空 |
    // | pagesize             | 每页显示条数    | 不能为空 |
    // | user_id              | 用户 ID         | 可以为空 |
    // | pay_status           | 支付状态        | 可以为空 |
    // | is_send              | 是否发货        | 可以为空 |
    // | order_fapiao_title   | ['个人','公司'] | 可以为空 |
    // | order_fapiao_company | 公司名称        | 可以为空 |
    // | order_fapiao_content | 发票内容        | 可以为空 |
    // | consignee_addr       | 发货地址        | 可以为空 |

    // 获取订单列表
    async getOrderList() {
      // 发起获取订单数据列表请求
      const { data: res } = await this.$http.get('orders', {
        params: this.querInfo,
      })
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败!')
      }
      // 请求成功给 data中的 总数居条数 和 数据列表赋值
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    // 每页获取数量变化
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getOrderList()
    },
    // 页码值发生变化
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox() {
      // 弹出修改地址对话框
      this.addressVisible = true
    },
    // 对话框关闭时间
    addressDialogClosed() {
      // 关闭对话框清空表单
      this.$refs.addressFormRef.resetFields()
      // 清空省市区
      this.addressForm.address1.address__province = ''
      this.addressForm.address1.address__city = ''
      this.addressForm.address1.address__dist = ''
    },
    // 因为省市区并不是双向绑定数据的 所以要用到下面的方法进行双向绑定到data中
    // 选择省触发的操作
    onChangeProvince(data) {
      // data 组件传过来的值
      this.addressForm.address1.address__province = data.value
    },
    // 选择市触发的操作
    onChangeCity(data) {
      this.addressForm.address1.address__city = data.value
    },
    // 选择区触发的操作
    onChangeArea(data) {
      this.addressForm.address1.address__dist = data.value
    },
    // 省市区全选中后触发的操作
    addressChecked(data) {
      this.addressForm.address1.address__province = data.province.value
      this.addressForm.address1.address__city = data.city.value
      this.addressForm.address1.address__dist = data.area.value
      console.log(this.addressForm.address1)
    },
    // ### 查看物流信息

    // + 请求路径：/kuaidi/:id
    //
    // + 请求方法：get
    //
    // + 供测试的物流单号：1106975712662
    // 物流信息
    async showProgressBox() {
      // 发起查看物流信息请求
      //   这里使用测试单号
      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      //   console.log(this.progressInfo)
      // 显示对话框
      this.progressVisible = true
    },
  },
}
</script>

<style lang="less" scoped>
</style>