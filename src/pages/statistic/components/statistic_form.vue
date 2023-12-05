<template>
  <div class="b2b-statistic-form">
    <el-table
        :data="tableData"
        class="b2b-statistic-form__table"
        max-height="600"
        border
        scrollbar-always-on
        row-key="id"

        :cell-class-name="gray"
        :header-cell-class-name="gray"

        :default-expand-all="false"
        :summary-method="getSummaries"
        show-summary
        sum-text="Итого"
    >
      <el-table-column prop="group" label="Ценовая группа" width="300"/>

      <el-table-column prop="ago_1" :label="moment().subtract(1, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_1, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_2" :label="moment().subtract(2,'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_2, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_3" :label="moment().subtract(3, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_3, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_4" :label="moment().subtract(4, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_4, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_5" :label="moment().subtract(5, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_5, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_6" :label="moment().subtract(6, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_6, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_7" :label="moment().subtract(7, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_7, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_8" :label="moment().subtract(8, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_8, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_9" :label="moment().subtract(9, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_9, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_10" :label="moment().subtract(10, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_10, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_11" :label="moment().subtract(11, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_11, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_12" :label="moment().subtract(12, 'months').format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_12, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="total" label="Итого" width="120">
        <template #default="scope">
          {{formatNumber(scope.row.total, true)}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import {inject} from 'vue';
import moment from 'moment';

defineProps({
  tableData: {
    type: Array,
  },
});

const formatNumber = inject('formatNumber');

function gray(row, column, rowIndex, columnIndex){
  if (row.column.property === 'total')
    return 'gray'
}

function getSummaries(param) {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'Итого';
      return;
    }

    let sum = 0, error = '';
    if (index > 0 && index < 13){
      let col_name = 'ago_' + index ;
      data.forEach(item => {
        if (!isNaN(+item[col_name])) sum += +item[col_name];
        else {error = 'Не число'; return};
      });
    }

    if (index == 13){
      data.forEach(item => {
        if (!isNaN(+item.total)) sum += +item.total;
        else {error = 'Не число'; return};
      });
    }

    if (!error) sums[index] = formatNumber(sum.toFixed(0), true);
    else sums[index] = error;
  });
  return sums;
};

</script>

<style scoped lang="scss">

.b2b{
  &-statistic-form{
    &__table{
      width: 100%;
    }
  }
}

</style>