<template>
  <pre-loader
      class="b2b-conditions"
      :loading="loading"
  >
    <h1 class="b2b-conditions__title b2b-title b2b-title_h1"> Условия сотрудничества </h1>

    <label class="b2b-conditions__label b2b-label">
      Информация актуальна по состоянию на {{client.update_date.treaties.format('DD.MM.YYYY, HH:mm')}}
    </label>

    <h2 class="b2b-conditions__title b2b-title b2b-title_h2" > Ваши скидки </h2>

    <div v-if="!client.waiting.treaties">
      <div class="b2b-discounts">
        <div
            v-for="(discount, idx) in discounts"
            :key="idx + '_'+discount.discount"
            class="b2b-discounts__element"
        >

          <div class="b2b-discounts__discount-value">
            <span>{{discount.discount ?? 0}}%</span>
          </div>

          <div class="b2b-discounts__discount-title">
            <span>{{discount.group ?? 0}}</span>
          </div>

        </div>
      </div>

      <div
          v-for="(company, idx) in conditions_data"
          :key="idx"
          class="b2b-conditions__row"
      >
        <h2 class="b2b-conditions__sub-title b2b-title b2b-title_h2"> Договоры {{company.name}} </h2>

        <conditions_form :tableData="company.tableData"/>
      </div>
    </div>

    <label
        v-else
        class="b2b-conditions__label b2b-label"
    >
      <strong> Ожидается получение информации об условиях сотрудничества, может потребоваться некоторе время. </strong>
    </label>

  </pre-loader>
</template>

<script setup>
import {inject, ref, reactive, watchEffect} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import Conditions_form from "@/pages/conditions/components/conditions_form.vue"
import moment from "moment";
import {TreatiesRepo} from "@/repositories";

const notify          = inject('notify');
const client          = inject('client');

const router            = useRouter();

const loading         = ref(false);
const conditions_data = reactive([]);
const discounts       = reactive([]);

async function getData(){
  let needUpdate = moment().diff(client.update_date.treaties, 'minutes') >= client.update_interval.treaties;

  if (!client.waiting.treaties && !needUpdate) {
    try {
      loading.value = true;
      let result = await TreatiesRepo.get({client_id: client.id});

      if(result.status == 200 && result.body.data) {
        Object.keys(result.body.data).forEach(key => {
          conditions_data.push({
            name      : key,
            tableData : result.body.data[key].data,
          })
        })
        discounts.length = 0;
        result.body.discounts.forEach(el => discounts.push(el))

      } else {
        await router.push({name : 'login'})
      }
    } catch (e) {
      notify({ title: 'Ошибка получение информации об условиях сотрудничества', message: e.message, type: 'error', duration: 5000 });
    } finally {
      loading.value = false;
    }

  } else {
    if(!client.waiting.treaties && needUpdate){
      client.waiting.treaties = true;
      client.waiting.dz = true;

      await TreatiesRepo.update({client_id: client.id});
      TreatiesRepo.updateDZ({client_id: client.id});
    }
  };

}

watchEffect(() => {
  client.id && client.waiting.treaties === false ? getData() : '';
});

</script>

<style scoped lang="scss">

.b2b{
  &-conditions{
    &__row{
      margin-bottom: 20px;
    }
    &__title{
      padding-bottom: 25px;
    }
    &__sub-title{
      padding-bottom: 10px;
    }
    &__label{
      margin-bottom: 20px;
    }
  }
  &-discounts{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    &__element{
      width: 138px;
      margin-bottom: 20px;
    }
    &__discount-value{
      height: 130px;
      width: 130px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 4px solid #EF7C00;
      border-radius: 50%;
      background-color: rgba(255, 142, 20, 10%);
      box-shadow: 3px 2px 6px rgba(239, 124, 0, 44%);
      margin-bottom: 10px;
      >span{
        text-align: center;
        font-size: 40px;
        font-weight: bold
      }
    }
    &__discount-title{
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      >span{
        text-align: center;
      }
    }
  }
}

</style>

