<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!--2. 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// ### 基于时间统计的折线图
//
// - 请求路径：reports/type/1
//
// - 请求方法：get
//
// - 响应数据
//
// - 需要合并的选项

// 1.导入 echarts 数据图表组件
import * as echarts from 'echarts'
// 导入深拷贝组件 进行数据的合并
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的数据 从接口文档复制过来的 因为请求发回来的数据是不完全的 不能在鼠标经过的时候显示信息
      options: {
        title: {
          text: '用户来源',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3',
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
      },
    }
  },
  created() {},
  //  3. 在页面渲染完毕后初始化图表 必须在页面上的元素渲染完毕后初始化echarts实例
  async mounted() {
    // 4.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 发起基于时间统计的折线图 的请求
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取数据图表失败!')
    }
    // 5.准备数据项
    // 指定图表的配置项和数据
    // 将服务器返回的数据 和本地的 options 进行合并
    // 也可以使用 es6 的 Object.assign(this.options,res.data) 进行合并
    const result = _.merge(res.data,this.options)

    // 6.展示数据
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {},
}
</script>

<style lang="less" scoped>
</style>