<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- :to='要跳转的地址' -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 
            el-row 卡片行
            el-col 卡片列
         -->
      <!-- 添加角色按钮区域 -->
      <!-- 添加角色的参数要注意看文档 容易出错 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
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
            type="expand"  展开
         -->
      <el-table :data="rolelist" height="600" border stripe>
        <!-- 展开列 -->
        <el-table-column label="展开" type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 这里的class的意思是给第一行加顶部边框线 索引=0就加 不等于0不加 -->
            <!-- 
                         el-col 列
                        :span 为列宽
                     -->
            <!-- 
                         el-tag 标签
                         closable 可移除的标签按钮
                         close	关闭 Tag 时触发的事件
                      -->
            <el-row
              :class="['bdbottom', { bdtop: index1 == 0 }, 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 总共把它分成24列 一级权限占5列 二三级占19列 -->
              <!-- 渲染一级权限-->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限-->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <!-- 索引不为0 添加顶部边框 -->
                <el-row
                  :class="[{ bdtop: index2 !== 0 }, 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <!-- 使用作用域插槽的形式自定义输出格式 -->
          <!-- scope.row 当前行的所有数据 -->
          <template slot-scope="scope">
            <!-- 
                        el-button
                        size 按钮大小
                     -->
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              @click="showSetRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 
      分配权限的对话框
      :visible.sync 是否打开对话框 布尔值
      @close="defKeys=[]" 关闭对话框时重置 defKeys 数组 以免树状权限勾选重复
     -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="defKeys=[]"
    >
    <!-- 
      树型控件
      :data 要绑定的数据
      :props
      show-checkbox  可选择 复选框 横是半选中状态 勾是选中状态
      node-key	每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
      这个id是rightslist 后端数据返回的
      default-expand-all	是否默认展开所有节点 布尔值 默认false
      default-checked-keys	默认勾选的节点的 key 的数组
     -->
      <el-tree ref="treeRef" :data="rightslist" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  // 请求角色列表数据
  // 路径：roles
  // 方法：get
  // 响应数据说明：
  //            第一层为角色信息
  //            第二层开始为权限说明，权限一共有3层权限
  //            最后一层权限，不包含 chidren 属性
  // 即
  /*
    data:[
        {
        id:xx,
        xx:xx,
        chidren:[
            {
                chhidren:[
                    {
                        chidren:[
                            {
                                
                            }
                        ]
                    }
                ]
            }
        ]
        },{},{}....
    ]
    */
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制角色分配对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist:[],
      // 树形控件的属性绑定对象
      treeProps:{
        // 根据返回的数据来赋值
        // 嵌套的标题 
        label:'authName',
        // 嵌套的属性名
        children:'children'
      },
      // 默认选中的节点ID值数组
      defKeys:[],
      // 角色ID
      roleId:''
    }
  },
  // 生命周期函数
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      // 获取成功
      this.rolelist = res.data
      //console.log(res.data)
    },
    // 根据ID删除对应的权限
    // 路径： roles/:roleld/rights/:rightld
    // 方法：delete
    // 参数：roleld 角色ID rightld 权限ID
    async removeRightById(role, id) {
      // role 角色数据
      // id   权限id
      // 弹框提示用户是否要删除
      // 返回值是posemime
      // catch 取消操作触发的错误提示 直接return
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((error) => error)
      //   判断是否选择了删除 根据返回值 返回值是字符串
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      //    确定删除 发起删除请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      )
      //    获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //    删除成功
      //    刷新数据
      //    this.getRolesList(); 直接调用这个获取数据函数会把展开列关闭
      //    返回值的 data 中返回的是该角色的新数据 重新赋值就好
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 把角色ID保存到data上
      this.roleId = role.id;
      // 获取所有权限的数据
      // 路径：rights/:type
      // 方法：get
      // 参数：list或tree,list列表显示权限，tree树状显示权限
      const {data:res} = await this.$http.get('rights/tree');
      if(res.meta.status !== 200){
        return this.$message.error('获取权限数据失败！');
      }
      // 获取成功 把获取到的权限数据保存到data中
      this.rightslist = res.data;
      console.log(this.rightslist);
      // 递归获取三级节点的id 调用完要在关闭事件@close重置一下
      // role是scope.row传过来的
      this.getLeafKeys(role,this.defKeys);
      // 显示对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node,arr){
      // 如果当前不包含 children 属性 说明已经到了第三级权限
      if(!node.children){
        return arr.push(node.id);
      }
      // 循环数组对象
      node.children.forEach(item=>this.getLeafKeys(item,arr));
    },
    // 角色授权
    // 路径：roles/:roleld/rights
    // 方法：post
    // 参数：roleld 角色ID  |  rids 权限 ID 列表（字符串） 以 `,` 分割的权限 ID 列表（获取所有被选中、叶子节点的key和半选中节点的key, 包括 1，2，3级节点）
    // 点击为角色分配权限
    async allotRights(){
      // keys保存半选和全选状态下的id
      const keys = [
        // treeRef 树形控件的实例对象
        // ... ES6语法 展开运算符,将一个数组转为用逗号分隔的参数序列
        // getCheckedKeys树形控件实例对象的方法 获取选中状态的node-key绑定的数据 这里绑定的是id 返回的是一个数组
        // getHalfCheckedKeys树形控件实例对象的方法 获取半选中状态的node-key绑定的数据 这里绑定的是id 返回的是一个数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      //console.log(keys);
      // 把keys转换为用 , 拼接的字符串赋值给 idStr
      const idStr = keys.join(',');
      // 发起角色授权请求
      // 角色ID通过展开对话框的时候获取
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      });
      // 提交失败
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败！');
      }
      // 分配成功
      this.$message.success('分配权限成功！');
      // 重新获取权限列表数据
      this.getRolesList();
      // 关闭对话框
      this.setRightDialogVisible = false;
    }
  },
}
</script>

<style lang="less" scoped>
</style>