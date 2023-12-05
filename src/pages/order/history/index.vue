<template>
  <pre-loader
      class="b2b-history"
      :loading="loading"
  >
    <h1 class="b2b-history__title b2b-title b2b-title_h1"> История ваших заказов </h1>
    <el-table
        :data="history_data"
        :default-sort="{ prop: 'id', order: 'descending' }"
        class="b2b-history__table"
        border
        max-height="500"
        stripe
        scrollbar-always-on
    >
      <el-table-column prop="id" label="№" width="70" sortable/>
      <el-table-column prop="number" label="Номер заказа" width="200" sortable/>
      <el-table-column prop="client_name" label="Организация" sortable/>
      <el-table-column prop="sum" label="Сумма заказа, руб." width="170" sortable>
        <template #default="scope">
          {{formatNumber(scope.row.sum)}}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Статус заказа" width="140" sortable/>
      <el-table-column prop="date_create" label="Дата заказа" width="140" sortable/>
    </el-table>
  </pre-loader>
</template>

<script setup>
import {inject, ref, reactive, watchEffect, watch} from 'vue'
import PreLoader from "@/components/pre_loader";
import { useRouter, useRoute } from 'vue-router';
import {OrderRepo} from "@/repositories";

const notify          = inject('notify');
const client          = inject('client');
const formatNumber    = inject('formatNumber');

const router          = useRouter();

const loading         = ref(false);
const history_data    = reactive([]);

async function getData(){
  try {
    loading.value = true;
    let result = await OrderRepo.history({client_id: client.id, client_guid : client.guid});

    if(result.status == 200 && result.body.data) {
      history_data.length = 0;
      result.body.data.forEach(el => history_data.push(el));
    } else {
      await router.push({name : 'login'})
    }
  } catch (e) {
    notify({ title: 'Ошибка получение информации об истории заказов', message: e.message, type: 'error', duration: 5000 });
  } finally {
    loading.value = false;
  }
}

watch([
      () => client.update_date.history,
    ],
    (values, oldValues) => {
      if (values[0] !== oldValues[0]) getData();
    }
);

watchEffect(() => {
  client.id  ? getData() : '';
});



</script>

<style scoped lang="scss">

.b2b {
  &-history {
    &__table {
      width: 100%;
    }
    &__title {
      padding-bottom: 25px;
    }
  }
}
</style>