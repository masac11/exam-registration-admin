<template>
    <div>
        <!-- <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 缴费管理
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
                <el-input v-model="query.keyword" placeholder="身份证号码" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button
                    type="primary"
                    icon="el-icon-download"
                    class="handle-del mr10"
                    @click="exportExcel"
                    :disabled="outButton"
                >导出</el-button>
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
                <el-table-column prop="studentName" label="姓名" header-align="center"  width="80"></el-table-column>
                <el-table-column prop="idCardNumber" label="身份证号码" width="164" header-align="center"></el-table-column>
                <el-table-column prop="examName" label="报名考试" header-align="center"></el-table-column>
                <el-table-column prop="cost" label="需缴费/元" align="center"  width="95"></el-table-column>
                <el-table-column prop="examineeNumber" label="准考证号码" width="120" align="center"></el-table-column>
                <el-table-column prop="orderNumber" label="订单号" header-align="center" width="190"></el-table-column>
                <el-table-column label="已支付" align="center" width="70">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.isPaid===false?'danger':'success'"
                        >{{scope.row.isPaid===false?'否':'是'}}</el-tag>
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="updateTime" label="最后修改时间" :formatter="dateFormat"></el-table-column> -->
                <el-table-column prop="createTime" label="创建时间" align="center" :formatter="dateFormat"></el-table-column>
                <!-- <el-table-column label="启用状态" header-align="center">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.isDeleted===false?'success':(scope.row.state===true?'danger':'')"
                        >{{scope.row.isDeleted===false?'正常':'关闭'}}</el-tag>
                    </template>
                </el-table-column> -->
                <!-- <el-table-column label="操作" width="150" header-align="center">
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
                </el-table-column> -->
            </el-table>
            <div style="display:none">
             <el-table :data="tableOutData" id="orderTable">
                <el-table-column prop="id" label="ID"></el-table-column>
                <el-table-column prop="studentName" label="姓名"></el-table-column>
                <el-table-column prop="idCardNumber" label="身份证号码"></el-table-column>
                <el-table-column prop="examName" label="报名考试"></el-table-column>
                <el-table-column prop="cost" label="需缴费/元"></el-table-column>
                <el-table-column prop="examineeNumber" label="准考证号码"></el-table-column>
                <el-table-column prop="orderNumber" label="订单号"></el-table-column>
                <el-table-column label="已支付">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.isPaid===false?'danger':'success'"
                        >{{scope.row.isPaid===false?'否':'是'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" :formatter="dateFormat"></el-table-column>
            </el-table>
            </div>
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

        <!-- 编辑弹出框 -->
        <!-- <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="90px">
                <el-form-item label="缴费名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="缴费代码">
                    <el-input v-model="form.code"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="form.address"></el-input>
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
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog> -->

        <!-- 添加弹出框 -->
        <el-dialog :title="dialog.editMode ? '编辑' : '新增'" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="90px">
                <el-form-item label="缴费名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="缴费代码">
                    <el-input v-model="form.code"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="form.address"></el-input>
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
                <el-button @click="editVisible = false;">取 消</el-button>
                <el-button type="primary" @click="saveInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchData,editData,delData,delAllData,addData } from '../../api/base';
import moment from 'moment';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
const mode = 'orders';
export default {
    name: 'ordertable',
    data() {
        return {
            query: {
                keyword: '',
                pageIndex: 1,
                pageSize: 10
            },
            outButton: true,
            tableData: [],
            tableOutData: [],
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
            let keyword = this.query.keyword;
            query = {
                keyword: keyword,
                pageIndex: 1,
                pageSize: 99999
            };
            fetchData({ mode, query }).then(res => {
                this.tableOutData = res.data;
                this.outButton = false;
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.outButton = true;
            this.getData();
        },
        // 触发添加按钮
        handleAdd() {
            this.form = { isDeleted:false };
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
                this.$message.success(`修改 ID 为 ${this.form.id} 的缴费信息成功`);
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
                this.$message.success(`添加缴费信息成功`);
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
       },
       exportExcel() {
            var xlsxParam = { raw: true };
            var wb = XLSX.utils.table_to_book(document.querySelector('#orderTable'), xlsxParam);
            var wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'array'
            });
            try {
                FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '订单.xlsx');
            } catch (e) {
                if (typeof console !== 'undefined') console.log(e, wbout);
            }
            return wbout;
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
