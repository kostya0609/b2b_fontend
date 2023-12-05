<template>
  <div class="b2b-treaties-form">
    <el-table
        :data="tableData"
        row-key="id"
        :default-expand-all="false"
        class="b2b-treaties__table"
        max-height="600"
        border
        stripe
        :cell-class-name="red_bold"
        scrollbar-always-on
    >
      <el-table-column prop="treaty_number" label="Номер договора"/>
      <el-table-column prop="company" label="Огранизация"/>

      <el-table-column prop="sum" label="Сумма" sortable width="110">
        <template #default="scope">
          {{formatNumber(scope.row.sum)}}
        </template>
      </el-table-column>

      <el-table-column prop="date_pdz" label="Оплатить до" sortable width="130"/>

      <el-table-column prop="dz" label="ДЗ" sortable width="100">
        <template #default="scope">
          {{formatNumber(scope.row.dz)}}
        </template>
      </el-table-column>

      <el-table-column prop="pdz" label="В т.ч. ПДЗ" sortable width="115">
        <template #default="scope">
          {{scope.row.pdz ? formatNumber(scope.row.pdz) : ''}}
        </template>
      </el-table-column>

      <el-table-column prop="pdz" label="Дней ПДЗ" sortable width="120">
        <template #default="scope">
          {{scope.row.days_pdz}}
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script setup>
import {inject} from "vue";

defineProps({
  tableData: {
    type: Array,
  },
});

const formatNumber = inject('formatNumber');

function red_bold(row){
  if (row.column.property === 'pdz') return 'b2b-treaties-form__cell_red-bold'
}

</script>

<style scoped lang="scss">

.b2b{
  &-treaties-form{
    &__table{
      width: 100%;
    }
    &__cell_red-bold{
      color: red!important;
      font-weight: bold;
    }
  }
}

</style>