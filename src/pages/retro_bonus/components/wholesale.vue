<template>
  <div class="b2b-wholesale-form">
    <label class="b2b-wholesale-form__label b2b-label b2b-wholesale-form__label_orange">
      Ретробонус за {{select_month}} месяц <span class="orange_bold">{{is_paid ? 'выплачен' : 'не выплачен'}}</span>.
    </label>
    <el-tabs v-model="activeTab" type="border-card" style="margin-bottom: 15px">
      <el-tab-pane label="Данные для расчета" name="dataCalculate">
        <el-table
            :data="table_dataCalculate"
            class="b2b-wholesale-form__table"
            border
            max-height="500"
            stripe
            show-summary
            :summary-method="(params) => getSummaries(params, 'dataCalculate')"
            sum-text="Итого"
            scrollbar-always-on
        >
          <el-table-column prop="group" label="Номенклатурная группа"/>
          <el-table-column prop="plan" label="План, руб." width="110">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.plan)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="fact" label="Факт, руб." width="110">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.fact)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="planAccum" label="План накоп., руб." width="110">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.planAccum)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="factAccum" label="Факт накоп., руб." width="110">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.factAccum)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="planCompleted" label="Выполнение плана мес." width="110">
            <template #default="scope">
                <span :class="['b2b-wholesale-form__table-cell_green', {'b2b-wholesale-form__table-cell_red' : !scope.row.planCompleted}]">
                  {{scope.row.planCompleted ? 'Да' : 'Нет'}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="planAccumCompleted" label="Выполнение плана накоп." width="110">
            <template #default="scope">
                <span :class="['b2b-wholesale-form__table-cell_green', {'b2b-wholesale-form__table-cell_red' : !scope.row.planCompleted}]">
                  {{scope.row.planAccumCompleted ? 'Да' : 'Нет'}}
                </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Расчет ретробонуса" name="calculate">
        <el-table
            :data="table_calculate"
            class="b2b-wholesale-form__table"
            border
            max-height="500"
            stripe
            show-summary
            :summary-method="(params) => getSummaries(params, 'calculate')"
            sum-text="Итого"
            scrollbar-always-on
        >
          <el-table-column prop="group" label="Номенклатурная группа"/>
          <el-table-column prop="basePeriod" label="База для ретробонуса (за период), руб." width="130">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.basePeriod)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="baseAccum" label="База для ретробонуса (накоп.), руб." width="130">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.baseAccum)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="percent" label="Основной процент" width="100">
            <template #default="scope">
                <span>
                  {{scope.row.percent}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="additionalPercent" label="Дополнит. процент" width="100">
            <template #default="scope">
                <span>
                  {{scope.row.additionalPercent}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="retroBonus" label="Ретробонус, руб." width="115">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.retroBonus)}}
                </span>
            </template>
          </el-table-column>
          <el-table-column prop="retroBonusAccum" label="Ретробонус (накоп.), руб." width="115">
            <template #default="scope">
                <span>
                  {{formatNumber(scope.row.retroBonusAccum)}}
                </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {inject, ref} from 'vue'

defineProps({
  table_calculate: {
    type: Array,
  },
  table_dataCalculate: {
    type: Array,
  },
  is_paid: {
    type: Boolean
  },
  select_month : {
    type: String
  }
});

const getSummaries = inject('getSummaries');
const formatNumber = inject('formatNumber');

const activeTab         = ref('dataCalculate');

</script>

<style scoped lang="scss">

.b2b{
  &-wholesale-form{
    &__table{
      width: 100%;
    }
    &__table-cell{
      font-weight: bold;
      &_green{
        color: #1BC400FF;
      }
      &_red{
        color: red;
      }
    }
    &__label{
      margin-bottom: 20px;
      &_orange{
        color: #EF7C00;
        font-size: 20px;
      }
    }
  }
}

</style>