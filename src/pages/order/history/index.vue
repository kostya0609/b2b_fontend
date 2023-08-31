<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
       class="route_page_container"
  >
    <h1 class="main-h1">История ваших заказов</h1>
    <el-table
        :data="history_data"
        :default-sort="{ prop: 'id', order: 'descending' }"
        style="width: 100%;"
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
  </div>
</template>

<script>
import {inject, ref, reactive, watchEffect, watch} from 'vue'

export default {
  name: "order_history_page",
  setup(){
    const loadJson        = inject('loadJson');
    const svg             = inject('svg');
    const notify          = inject('notify');
    const client          = inject('client');
    const formatNumber    = inject('formatNumber');

    const loading         = ref(false);
    const history_data    = reactive([]);


    async function getData(){
      loading.value = true;
      let result = await loadJson('/b2b/order/history', {client_id: client.id, client_guid : client.guid});
      loading.value = false;
      if (result.status === 'success' && result.data) {
        history_data.length = 0;
        result.data.forEach(el => history_data.push(el));
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
    return {
      svg, loading, history_data, formatNumber,
    }
  }
}
</script>

<style scoped>

</style>