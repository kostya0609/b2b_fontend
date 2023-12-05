<template>
  <pre-loader
      class="b2b-treaties"
      :loading="loading"
  >
    <h1 class="b2b-treaties__title b2b-title b2b-title_h1"> Взаиморасчеты </h1>
    <label class="b2b-treaties__label b2b-label">
      Информация актуальна по состоянию на {{client.update_date.dz.format('DD.MM.YYYY, HH:mm')}}
    </label>

    <div
        v-if="!client.waiting.dz"
        v-for="(company, idx) in treaties_data"
        :key="idx"
        class="b2b-treaties__row"
    >
      <p>
        <span class="b2b-treaties__sub-title_fs20"> {{company.name}} </span> - общая сумма дебиторской задолженности
        <span class="b2b-treaties__sub-title_red"> {{formatNumber(company.dz) ?? 0}} </span> руб., в том числе
        <strong> просроченная дебиторская задолженность </strong>
        <span class="b2b-treaties__sub-title_bold-red"> {{formatNumber(company.pdz) ?? 0}} </span> руб.
      </p>

      <treaties_form :tableData="company.tableData"/>
    </div>

    <label v-else class="b2b-treaties__label b2b-label">
      <strong> Ожидается получение информации о взаиморасчетах, может потребоваться некоторе время. </strong>
    </label>

    <p v-if="treaties_data.length == 0 && !client.waiting.dz">
      Данные о взаиморасчетах отсутствуют.
    </p>

  </pre-loader>
</template>

<script setup>
import {inject, ref, reactive, watchEffect} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import Treaties_form from "@/pages/treaties/components/treaties_form.vue"
import {TreatiesRepo} from "@/repositories";
import moment from "moment";

const notify         = inject('notify');
const client         = inject('client');
const formatNumber   = inject('formatNumber');

const router            = useRouter();

const loading        = ref(false);
const treaties_data  = reactive([]);

async function getData(){
  treaties_data.length = 0;

  let needUpdate = moment().diff(client.update_date.dz, 'minutes') >= client.update_interval.dz;

  if (!client.waiting.dz && !needUpdate) {
    try {
      loading.value = true;
      let result = await TreatiesRepo.getDZ({client_id: client.id});

       if(result.status == 200 && result.body.data) {
           Object.keys(result.body.data).forEach(key => {
               let tableData = Object.values(result.body.data[key].data);

               tableData.forEach((el, idx) => {
                 el.id = idx + 1000;
               });

               treaties_data.push({
                 name      : key,
                 dz        : result.body.data[key].total_dz,
                 pdz       : result.body.data[key].total_pdz,
                 tableData,
               })
           })
      } else {
        await router.push({name : 'login'})
      }
    } catch (e) {
      notify({ title: 'Ошибка получение информации об условиях сотрудничества', message: e.message, type: 'error', duration: 5000 });
    } finally {
      loading.value = false;
    }

  } else {
    if(!client.waiting.dz && needUpdate){
      client.waiting.treaties = true;
      client.waiting.dz = true;
      await TreatiesRepo.update({client_id: client.id});
      TreatiesRepo.updateDZ({client_id: client.id});
    }
  };
}

watchEffect(() => {
  client.id && client.waiting.dz === false ? getData() : '';
});

</script>

<style scoped lang="scss">

.b2b {
  &-treaties {
    &__row{
      margin-bottom: 20px;
    }

    &__title {
      padding-bottom: 25px;
    }

    &__sub-title{
      &_fs20{
        font-size: 20px;
      }
      &_red{
        color: red;
      }
      &_bold-red{
        font-weight: bold;
        color: red;
      }
    }

    &__label {
      margin-bottom: 20px;
    }
  }
}
</style>