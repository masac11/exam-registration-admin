<template>
    <div>
        <!-- <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 专业管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div> -->
        <div class="container">
            <div class="handle-box">
                <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button>
                <el-input v-model="query.keyword" placeholder="ID/专业名称/代码" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="55" align="center" column-key="createTime"></el-table-column>
                <el-table-column prop="name" label="专业名称" header-align="center"></el-table-column>
                <el-table-column prop="code" label="专业代码" align="center" width="80"></el-table-column>
                <el-table-column prop="fee" label="报考费用/元" align="center" width="120"></el-table-column>
                <el-table-column prop="updateTime" label="最后修改时间" width="160" :formatter="dateFormat" align="center"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="160" :formatter="dateFormat" align="center"></el-table-column>
                <el-table-column label="启用状态" align="center" width="80">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.isDeleted===false?'success':(scope.row.state===true?'danger':'')"
                        >{{scope.row.isDeleted===false?'正常':'关闭'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 添加弹出框 -->
        <el-dialog :title="dialog.editMode ? '编辑' : '新增'" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="90px">
                <el-form-item label="专业名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="专业代码">
                    <el-input v-model="form.code"></el-input>
                </el-form-item>
                <el-form-item label="报考费用">
                    <el-input v-model="form.fee"></el-input>
                </el-form-item>
                <el-form-item label="是否关闭">
                    <template>
                        <el-radio-group v-model="form.isDeleted">
                            <el-radio :label=true>是</el-radio>
                            <el-radio :label=false>否</el-radio>
                        </el-radio-group>
                    </template>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchData,editData,delData,delAllData,addData } from '../../api/base';
import moment from 'moment';
const mode = 'majors';
export default {
    name: 'majortable',
    data() {
        return {
            query: {
                keyword: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            dialog: {
                editMode: false
            },
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            let query = this.query;
            fetchData({mode, query}).then(res => {
                this.tableData = res.data;
                this.pageTotal = res.pageTotal;
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 触发添加按钮
        handleAdd() {
            this.form = { isDeleted:false };
            this.form.isDeleted = false;
            this.editVisible = true;
            this.dialog.editMode = false;
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
            .then(() => {
                let id = row.id;
                delData({mode, id}).then(() => {
                this.$message.success('删除成功');
                this.tableData.splice(index, 1);
                }).catch(() => {
                this.$message.error(`删除失败`);
                });
            })
            .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].id
                if (i != length - 1) {
                    str += ',';
                }
            }
            delAllData({mode, str}).then(() => {
                this.$message.success('删除成功');
                 this.getData();
            }).catch(error => {
                console.log(error);
                this.$message.error(`删除失败`);
            });
            this.multipleSelection = [];
        },
        saveInfo() {
          this.dialog.editMode ? this.saveEdit() : this.saveAdd();  
        },
        // 编辑操作
        handleEdit(index, row) {
            this.dialog.editMode = true;
            this.idx = index;
            this.form = Object.assign({}, row);
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            let form = this.form;
            editData({mode, form}).then(() => {
                this.$message.success(`修改 ID 为 ${this.form.id} 的专业信息成功`);
                this.$set(this.tableData, this.idx, this.form);
            }).catch(() => {
               this.$message.error(`保存失败`);
            });
        },
        // 保存添加的信息
        saveAdd() {
            this.editVisible = false;
            let form = this.form;
            addData({mode, form}).then(() => {
                this.$message.success(`添加专业信息成功`);
                this.getData();
            }).catch(() => {
               this.$message.error(`保存失败`);
            });
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        },
        dateFormat(row, column) {
            var date = row[column.property];
            if (date == undefined) {
                return "";
            }
           return moment(date).format("YYYY-MM-DD HH:mm:ss");
       }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>
