<template>
  <div>
      <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>


    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 
            el-table 表格
            height   固定表头 不用加px单位
            border   表格边框
            stripe   隔行变色
         -->
        <!-- 
            el-table-column 列
            type="index" 索引列
            label        列名
            prop         列数据
         -->
        <el-table :data="rightsList" height="600" border stripe>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="权限名称" prop="authName"></el-table-column>
            <el-table-column label="路径" prop="path"></el-table-column>
            <el-table-column label="权限等级" prop="level">
                <!-- 使用作用域插槽的形式自定义输出格式 -->
                <!-- scope.row 当前行的所有数据 -->
                <template slot-scope="scope">
                    <!-- 
                        el-tag Tag标签
                        type   颜色 默认蓝色
                     -->
                     <!-- 判断level参数 来决定显示的标签 -->
                    <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>
</template>

<script>
// 请求权限列表数据
// 路径：rights/:type
// 方法：get
// 参数：type 值 list 或 tree,list列表显示权限，tree树状显示权限
export default {
    data(){
        return{
            // 权限列表
            rightsList:[]
        }
    },
    // 生命周期函数 里面的函数会在页面加载时执行
    created(){
        // 获取权限列表数据请求函数
        this.getRightsList();
    },
    methods:{
        async getRightsList(){
            const {data:res} = await this.$http.get('rights/list');
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取用户权限列表失败!');
            }
            // 获取成功
            this.rightsList = res.data;
        }
    }
}
</script>

<style lang="less" scoped>

</style>