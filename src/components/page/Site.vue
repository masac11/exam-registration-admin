<template>
    <div>
        <!-- <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 考点管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>-->
        <div class="container">
            <div class="handle-box">
                <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button>
                <el-input
                    v-model="query.keyword"
                    placeholder="ID/考点名称/代码"
                    class="handle-input mr10"
                ></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                style="width: 1600px"
                class="table"
                height="500"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column
                    prop="id"
                    label="ID"
                    width="55"
                    align="center"
                    column-key="createTime"
                ></el-table-column>
                <el-table-column prop="name" label="考点名称" width="150" header-align="center"></el-table-column>
                <el-table-column prop="code" label="考点代码" align="center" width="80"></el-table-column>
                <el-table-column prop="address" label="地址" show-overflow-tooltip width="200" header-align="center"></el-table-column>
                <el-table-column prop="allowProvince" show-overflow-tooltip label="允许报考的省份" width="200" header-align="center"></el-table-column>
                <el-table-column prop="updateTime" label="最后修改时间" :formatter="dateFormat" width="160" align="center"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" width="160" align="center"></el-table-column>
                <el-table-column label="启用状态" header-align="center" width="80">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.isDeleted===false?'success':(scope.row.state===true?'danger':'')"
                        >{{scope.row.isDeleted===false?'正常':'关闭'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="140" header-align="center">
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

        <!-- 编辑弹出框 -->
        <!-- <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="90px">
                <el-form-item label="考点名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="考点代码">
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
        </el-dialog>-->

        <!-- 添加弹出框 -->
        <el-dialog :title="dialog.editMode ? '编辑' : '新增'" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="form" label-width="110px">
                <el-form-item label="考点名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="考点代码">
                    <el-input v-model="form.code"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="form.address"></el-input>
                </el-form-item>
                <el-form-item label="允许报考的省份">
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="handleCheckAllChange"
                    >全选</el-checkbox>
                    <div style="margin: 15px 0;"></div>
                    <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
                        <el-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="是否关闭">
                    <template>
                        <el-radio-group v-model="form.isDeleted">
                            <el-radio :label="true">是</el-radio>
                            <el-radio :label="false">否</el-radio>
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
import { fetchData, editData, delData, delAllData, addData } from '../../api/base';
import moment from 'moment';
const mode = 'sites';
const cityOptions = [
    '北京市',
    '天津市',
    '上海市',
    '重庆市',
    '河北省',
    '山西省',
    '辽宁省',
    '吉林省',
    '黑龙江省',
    '江苏省',
    '浙江省',
    '安徽省',
    '福建省',
    '江西省',
    '山东省',
    '河南省',
    '湖北省',
    '湖南省',
    '广东省',
    '海南省',
    '四川省',
    '贵州省',
    '云南省',
    '陕西省',
    '甘肃省',
    '青海省',
    '台湾省',
    '内蒙古自治区',
    '广西壮族自治区',
    '西藏自治区',
    '宁夏回族自治区',
    '新疆维吾尔自治区',
    '香港特别行政区',
    '澳门特别行政区'
];
export default {
    name: 'sitetable',
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
            id: -1,
            checkAll: false,
            checkedCities: [],
            cities: cityOptions,
            isIndeterminate: true
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            let query = this.query;
            fetchData({ mode, query }).then(res => {
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
            this.form = { isDeleted: false };
            this.checkedCities = [];
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
                    delData({ mode, id })
                        .then(() => {
                            this.$message.success('删除成功');
                            this.tableData.splice(index, 1);
                        })
                        .catch(() => {
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
                str += this.multipleSelection[i].id;
                if (i != length - 1) {
                    str += ',';
                }
            }
            delAllData({ mode, str })
                .then(() => {
                    this.$message.success('删除成功');
                    this.getData();
                })
                .catch(error => {
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
            this.checkedCities = [];
            this.form = Object.assign({}, row);
            if (this.form.allowProvince !== undefined) {
                this.checkedCities = this.form.allowProvince.split('，');
            }
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            this.form.allowProvince = this.checkedCities.join("，");
            let form = this.form;
            editData({ mode, form })
                .then(() => {
                    this.$message.success(`修改 ID 为 ${this.form.id} 的考点信息成功`);
                    this.$set(this.tableData, this.idx, this.form);
                })
                .catch(() => {
                    this.$message.error(`保存失败`);
                });
        },
        // 保存添加的信息
        saveAdd() {
            this.editVisible = false;
            this.form.allowProvince = this.checkedCities.join("，");
            let form = this.form;
            addData({ mode, form })
                .then(() => {
                    this.$message.success(`添加考点信息成功`);
                    this.getData();
                })
                .catch(() => {
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
                return '';
            }
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        },
        handleCheckAllChange(val) {
            this.checkedCities = val ? cityOptions : [];
            this.isIndeterminate = false;
        },
        handleCheckedCitiesChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.cities.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
        }
    }
};
</script>
<style>
.el-tooltip__popper {
  max-width: 30%;
  line-height: 30px;
}
</style>
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
