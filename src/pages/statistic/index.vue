<template>
  <pre-loader
      class="b2b-statistic"
      :loading="loading"
  >
    <h1 class="b2b-statistic__title b2b-title b2b-title_h1"> Статистика заказов </h1>

    <label class="b2b-statistic__label b2b-label">
      Информация предоставлена за последние 12 месяцев и актуальна по состоянию на {{client.update_date.statistic.format('DD.MM.YYYY, HH:mm')}}
    </label>

    <statistic_form
        v-if="!client.waiting.statistic"
        :tableData="tableData"
    />

    <label
        v-else
        class="b2b-statistic__label b2b-label"
    >
      <strong> Ожидается получение информации по статистике заказов, может потребоваться некоторе время. </strong>
    </label>

  </pre-loader>
</template>

<script setup>
import moment from 'moment';
moment.locale('ru');
import {inject, ref, reactive, watchEffect, provide} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import Statistic_form from "@/pages/statistic/components/statistic_form.vue"
import {StatisticRepo} from "@/repositories";
const notify         = inject('notify');
const client         = inject('client');
const formatNumber   = inject('formatNumber');

const router         = useRouter();

const loading        = ref(false);
const tableData      = reactive([]);

async function getData() {
  let result = '';
  tableData.length = 0;

  let needUpdate = moment().diff(client.update_date.statistic, 'minutes') >= client.update_interval.statistic ? true : false;

  if (!client.waiting.statistic && !needUpdate) {
    try {
      loading.value = true;
      result = await StatisticRepo.get({client_id: client.id});

      if(result.status == 200 && result.body.data) {
          let data = Object.values(result.body.data)
          data.forEach((el, idx) => {
            el.id = 10000 + idx;
            tableData.push(el);
          })
      } else {
        await router.push({name : 'login'})
      }
    } catch (e) {
      notify({ title: 'Ошибка получение информации о статистике', message: e.message, type: 'error', duration: 5000 });
    } finally {
      loading.value = false;
    }

  } else {
    if(!client.waiting.statistic && needUpdate){
      client.waiting.statistic = true;
      StatisticRepo.get({client_id: client.id});
    }
  };
};

watchEffect(() => {
  client.id && client.waiting.statistic === false ? getData() : '';
});

</script>

<style scoped lang="scss">

.b2b{
  &-statistic{
    &__title{
      padding-bottom: 25px;
    }
    &__label{
      margin-bottom: 20px;
    }
  }
}

::v-deep(.b2b-statistic .el-table__placeholder) {
  display: inline!important;
}

::v-deep(.b2b-statistic .el-table__indent) {
  padding: 0!important;
}

::v-deep(.b2b-statistic .el-table__row--level-1) {
  background-color: #f9f9f9!important;
}

::v-deep(.b2b-statistic .el-table th.el-table__cell::first-letter) {
  text-transform: uppercase;
}

</style>