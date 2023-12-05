<template>
  <pre-loader
      class="b2b-retro-bonus"
      :loading="loading"
  >
    <h1 class="b2b-retro-bonus__title b2b-title b2b-title_h1"> Ретробонусы {{year}} год. </h1>

    <label class="b2b-retro-bonus__label b2b-label">
      Информация актуальны по состоянию на {{client.update_date.retro_bonus.format('DD.MM.YYYY, HH:mm')}}
    </label>

    <div v-if="!client.waiting.retro_bonus && retro_bonus_data.length > 0">

      <el-row class="b2b-row b2b-retro-bonus__row">
        <el-col :md="8">
          <el-select
              v-model="select_company"
              class="b2b-retro-bonus__select-field"
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

      <el-row
          v-if="!is_retail"
          class="b2b-row b2b-retro-bonus__row">
        <el-col :md="8">
          <el-select
              v-model="select_month"
              class="b2b-retro-bonus__select-field"
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

      <retail
          v-if="is_retail"
          :table_data="retro_bonus_data[select_company].calculate"
      />

      <wholesale
          v-else
          :table_dataCalculate="retro_bonus_data[select_company].months[select_month].dataCalculate"
          :table_calculate="retro_bonus_data[select_company].months[select_month].calculate"
          :is_paid="retro_bonus_data[select_company].months[select_month].is_paid"
          :select_month="month_list.find(el => {return el.value == select_month}).label"
      />

    </div>

  </pre-loader>
</template>

<script setup>
import {inject, ref, reactive, watchEffect, provide} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import Retail from "@/pages/retro_bonus/components/retail.vue"
import Wholesale from "@/pages/retro_bonus/components/wholesale.vue"
import moment from "moment";
import {RetroBonusRepo} from "@/repositories";

const notify            = inject('notify');
const client            = inject('client');
const menu              = inject('menu');

const router            = useRouter();

let date                = new Date;
let year                = date.getMonth() > 0 ?  date.getFullYear() : date.getFullYear() - 1;

const retro_bonus_list  = reactive([]);
const retro_bonus_data  = reactive([]);
const is_retail         = ref(true);

const formatNumber      = inject('formatNumber');

const loading           = ref(false);

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
  retro_bonus_data.length = 0;
  retro_bonus_list.length = 0;

  let needUpdate = moment().diff(client.update_date.retro_bonus, 'minutes') >= client.update_interval.retro_bonus ;

  if (!client.waiting.retro_bonus && !needUpdate) {

    try {
      loading.value = true;
      let retro_bonus =await RetroBonusRepo.get({client_id: client.id});

      if(retro_bonus.status == 200 && retro_bonus.body.data) {

          if(retro_bonus.body.data.length === 0){
              menu.find(el => {return el.name === 'Ретробонусы'}).show = false;
              await router.push({name : 'client'})
              notify({ title: 'Ошибка получение информации о ретробонусах', message: '', type: 'error', duration: 5000 });
              return;
          }

          is_retail.value = !!retro_bonus.body.data[0].is_retail;
          retro_bonus.body.data.forEach((el, idx) => {
            retro_bonus_data.push(el);
            retro_bonus_list.push({
              value     : idx,
              label     : el.name,
              is_retail : el.is_retail,
            })
          });

      } else {
          await router.push({name : 'login'})
      }
    } catch (e) {
      notify({ title: 'Ошибка получение информации о ретробонусах', message: e.message, type: 'error', duration: 5000 });
    } finally {
      loading.value = false;
    }

  } else {

    if(!client.waiting.retro_bonus && needUpdate){
      client.waiting.retro_bonus = true;
      RetroBonusRepo.update({guid: client.guid, client_id : client.id, date : year + '0101'}); // тут уходит дата год на первое января
      notify({ title: 'Получение информации о ретробонусахх', message: 'Информация о ретробонусах обновляется, может потребоваться некоторое время.', type: 'success'});
    }
  };

};

watchEffect(() => {
  client.id && client.waiting.retro_bonus === false ? getData() : '';
});

provide('getSummaries', getSummaries);

</script>

<style scoped lang="scss">

.b2b{
  &-retro-bonus{
    &__row{
      margin-bottom: 20px;
    }
    &__title{
      padding-bottom: 25px;
    }
    &__select-field{
      width: 100%;
    }
    &__label{
      margin-bottom: 20px;
    }
  }
}

</style>
