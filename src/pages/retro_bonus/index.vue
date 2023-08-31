<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="route_page_container"
  >
    <h1 class="main-h1">Ретробонусы {{year}} год.</h1>
    <p>Информация актуальны по состоянию на {{client.update_date.retro_bonus.format('DD.MM.YYYY, HH:mm')}}</p>

    <div v-if="!client.waiting.retro_bonus && retro_bonus_data.length > 0">

      <el-row >
        <el-col :span="7">
          <el-select
              v-model="select_company"
              :class="['add-edit-element']"
              @change="changeSelectCompany"
              placeholder="Выберете организацию"
              size="large"
          >
            <el-option
                v-for="item in retro_bonus_list"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <br/>

      <el-row >
        <el-col :span="7">
          <el-select
              v-if="!is_retail"
              v-model="select_month"
              :class="['add-edit-element']"
              placeholder="Выберете месяц"
              size="large"
          >
            <el-option
                v-for="item in month_list"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <br/>

      <div v-if="is_retail">
        <el-table
            :data="retro_bonus_data[select_company].calculate"
            style="width: 100%;"
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

      <div v-else>
        <p class="" style="margin-bottom: 15px; font-size: 20px; color: #EF7C00;">
          Ретробонус за {{month_list.find(el => {return el.value == select_month}).label}} месяц <span class="orange_bold">{{retro_bonus_data[select_company].months[select_month].is_paid ? 'выплачен' : 'не выплачен'}}</span>.
        </p>
        <el-tabs v-model="activeTab" type="border-card" style="margin-bottom: 15px">
          <el-tab-pane label="Данные для расчета" name="dataCalculate">
            <el-table
                :data="retro_bonus_data[select_company].months[select_month].dataCalculate"
                style="width: 100%;"
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
                <span :class="['green_bold', {'red_bold' : !scope.row.planCompleted}]">
                  {{scope.row.planCompleted ? 'Да' : 'Нет'}}
                </span>
                </template>
              </el-table-column>
              <el-table-column prop="planAccumCompleted" label="Выполнение плана накоп." width="110">
                <template #default="scope">
                <span :class="['green_bold', {'red_bold' : !scope.row.planCompleted}]">
                  {{scope.row.planAccumCompleted ? 'Да' : 'Нет'}}
                </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="Расчет ретробонуса" name="calculate">
            <el-table
                :data="retro_bonus_data[select_company].months[select_month].calculate"
                style="width: 100%;"
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
    </div>

  </div>
</template>

<script>
import {inject, ref, reactive, watchEffect} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import moment from "moment";
export default {
  name: "retro_bonus_page",
  setup(){
    const loadJson          = inject('loadJson');
    const svg               = inject('svg');
    const notify            = inject('notify');
    const client            = inject('client');
    const menu              = inject('menu');

    const router           = useRouter();
    const route            = useRoute();

    let date                = new Date;
    let year                = date.getMonth() > 0 ?  date.getFullYear() : date.getFullYear() - 1;

    const retro_bonus_list  = reactive([]);
    const retro_bonus_data  = reactive([]);
    const is_retail         = ref(true);

    const formatNumber      = inject('formatNumber');

    const loading           = ref(false);

    const activeTab         = ref('dataCalculate');

    const select_company    = ref(0);
    const select_month      = ref('month_' + (+date.getMonth() + 1));
    const month_list        = reactive([
      {value : 'month_1' , label : 'Январь'},
      {value : 'month_2' , label : 'Февраль'},
      {value : 'month_3' , label : 'Март'},
      {value : 'month_4' , label : 'Апрель'},
      {value : 'month_5' , label : 'Май'},
      {value : 'month_6' , label : 'Июнь'},
      {value : 'month_7' , label : 'Июль'},
      {value : 'month_8' , label : 'Август'},
      {value : 'month_9' , label : 'Сентябрь'},
      {value : 'month_10', label : 'Октябрь'},
      {value : 'month_11', label : 'Ноябрь'},
      {value : 'month_12', label : 'Декабрь'},
    ]);

    function changeSelectCompany(value){
      select_month.value = 'month_' + (+date.getMonth() + 1);
      is_retail.value    = retro_bonus_list[value].is_retail;
    };

    function getSummaries(param, type) {

      let need_properties = []
      if (type === 'dataCalculate') need_properties = ['plan', 'fact', 'planAccum', 'factAccum'];

      if (type === 'calculate')     need_properties = ['basePeriod', 'baseAccum', 'retroBonus', 'retroBonusAccum'];

      if (type === 'personal')      need_properties = ['plan', 'fact'];

      const { columns, data } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Итого';
          return;
        }

        let sum = 0, error = '';

        if (need_properties.includes(column.property)){
          data.forEach(item => {
            if (!isNaN(+item[column.property])) sum += +item[column.property];
            else {error = 'Не число'; return};
          });

          if (!error) sums[index] = formatNumber(sum.toFixed(2));
          else sums[index] = error;
        }

      });
      return sums;
    };

    async function getData(){
      loading.value = true;

      retro_bonus_data.length = 0;
      retro_bonus_list.length = 0;

      let needUpdate = moment().diff(client.update_date.retro_bonus, 'minutes') >= client.update_interval.retro_bonus ? true : false;

      if (!client.waiting.retro_bonus && !needUpdate) {

        let retro_bonus = await loadJson('/b2b/retro-bonus/get', {client_id: client.id});

        if (retro_bonus.status === 'success' && retro_bonus.data) {

          if(retro_bonus.data.length === 0){
            menu.find(el => {return el.name === 'Ретробонусы'}).show = false;
            router.push({name : 'client'})
            notify('Получение информации о ретробонусах', 'Ошибка получения информации о ретробонусах', 'error');
            return;
          }

          is_retail.value = retro_bonus.data[0].is_retail ? true : false;

          retro_bonus.data.forEach((el, idx) => {
            retro_bonus_data.push(el);
            retro_bonus_list.push({
              value     : idx,
              label     : el.name,
              is_retail : el.is_retail,
            })
          });
        }

      } else {
        if(!client.waiting.retro_bonus && needUpdate){
          client.waiting.retro_bonus = true;
          loadJson('/b2b/retro-bonus/update', {guid: client.guid, client_id : client.id, date : year + '0101'});
          notify('Получение информации о ретробонусах', 'Информация о ретробонусах обновляется, может потребоваться некоторое время.', 'success');
        }
      };

      loading.value = false;
    };

    watchEffect(() => {
      client.id && client.waiting.retro_bonus === false ? getData() : '';
    });

    return{
      svg, loading, year, select_month, month_list, activeTab, is_retail, retro_bonus_data,
      formatNumber, client, retro_bonus_list, select_company,
      getSummaries, changeSelectCompany
    }
  },
}
</script>

<style scoped>

</style>
