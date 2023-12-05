<template>
  <div  class="b2b-retail-form">
    <el-table
        :data="table_data"
        class="b2b-retail-form__table"
        border
        max-height="500"
        stripe
        show-summary
        :summary-method="(params) => getSummaries(params, 'personal')"
        sum-text="Итого"
        scrollbar-always-on
    >
      <el-table-column prop="group" label="Номенклатурная группа"/>
      <el-table-column prop="plan" label="Согласованный план, руб." width="180">
        <template #default="scope">
            <span>
              {{formatNumber(scope.row.plan)}}
            </span>
        </template>
      </el-table-column>
      <el-table-column prop="fact" label="Факт на текущий момент, руб." width="180">
        <template #default="scope">
            <span>
              {{formatNumber(scope.row.fact)}}
            </span>
        </template>
      </el-table-column>
      <el-table-column prop="remainder" label="Остаток плана до выполнения ретробонусов, руб." width="280">
        <template #default="scope">
            <span>
              <span v-if="(scope.row.fact - scope.row.plan) > 0"> План перевыполнен на  - </span>{{(scope.row.plan - scope.row.fact) > 0  ? formatNumber(scope.row.plan - scope.row.fact) : formatNumber(-(scope.row.plan - scope.row.fact))}}
            </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>

import {inject} from 'vue'

defineProps({
  table_data: {
    type: Array,
  }
});

const getSummaries = inject('getSummaries');
const formatNumber = inject('formatNumber');

</script>

<style scoped lang="scss">

.b2b{
  &-retail-form{
    &__table{
      width: 100%;
    }
  }
}

</style>