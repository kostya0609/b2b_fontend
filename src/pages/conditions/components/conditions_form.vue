<template>
  <div class="b2b-conditions-form">
    <el-table
        :data="tableData"
        class="b2b-conditions-form__table"
        border
        max-height="600"
        stripe
        scrollbar-always-on
    >
      <el-table-column prop="number" label="Номер договора"/>
      <el-table-column prop="company" label="Огранизация"/>
      <el-table-column prop="type" label="Тип договора" width="120"/>
      <el-table-column prop="date_final" label="Дата окончания" sortable/>
      <el-table-column prop="sum_credit" label="Сумма кредита" sortable>
        <template #default="scope">
          {{formatNumber(scope.row.sum_credit, true)}}
        </template>
      </el-table-column>
      <el-table-column prop="delayed" label="Дни отсрочки" sortable/>
      <el-table-column prop="date_last_batch" label="Дата последней отгрузки"/>
      <el-table-column label="Снижение скидки за кредит">
        <template #default="scope">
          {{calcDiscount(scope.row.delayed)}}
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

function calcDiscount(delayed){
  let discount = 0;

  if(delayed > 0   && delayed <= 30)  discount = '2%';
  if(delayed > 30  && delayed <= 60)  discount = '3%';
  if(delayed > 60  && delayed <= 90)  discount = '4%';
  if(delayed > 90  && delayed <= 120) discount = '5%';
  if(delayed > 120 && delayed <= 150) discount = '6%';
  if(delayed > 150 && delayed <= 180) discount = '7%';
  if(delayed > 180)                   discount = '8%';

  return discount;
};

</script>

<style scoped lang="scss">

.b2b{
  &-conditions-form{
    &__table{
      width: 100%;
    }
  }
}

</style>