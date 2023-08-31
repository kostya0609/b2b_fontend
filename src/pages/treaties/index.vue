<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="route_page_container"
  >
    <h1 class="main-h1">Взаиморасчеты</h1>
    <p>Информация актуальна по состоянию на {{client.update_date.dz.format('DD.MM.YYYY, HH:mm')}}</p>

    <div
        v-if="!client.waiting.dz"
        v-for="(company, idx) in treaties_data"
        :key="idx"
    >
      <p><span style="font-size: 20px">{{company.name}}</span> - общая сумма дебиторской задолженности <span style="color: red">{{formatNumber(company.dz) ?? 0}}</span> руб., в том числе <strong>просроченная дебиторская задолженность</strong> <span style="font-weight: bold; color: red">{{formatNumber(company.pdz) ?? 0}}</span> руб.</p>

      <el-table
          :data="company.tableData"
          row-key="id"
          :default-expand-all="false"
          style="width: 100%"
          max-height="600"
          border
          stripe
          :cell-class-name="red_bold"
          scrollbar-always-on
      >
        <el-table-column prop="treaty_number" label="Номер договора"/>
        <el-table-column prop="company" label="Огранизация"/>

        <el-table-column prop="sum" label="Сумма" sortable width="110">
          <template #default="scope">
            {{formatNumber(scope.row.sum)}}
          </template>
        </el-table-column>

        <el-table-column prop="date_pdz" label="Оплатить до" sortable width="130"/>

        <el-table-column prop="dz" label="ДЗ" sortable width="100">
          <template #default="scope">
            {{formatNumber(scope.row.dz)}}
          </template>
        </el-table-column>

        <el-table-column prop="pdz" label="В т.ч. ПДЗ" sortable width="115">
          <template #default="scope">
            {{scope.row.pdz ? formatNumber(scope.row.pdz) : ''}}
          </template>
        </el-table-column>

        <el-table-column prop="pdz" label="Дней ПДЗ" sortable width="120">
          <template #default="scope">
            {{scope.row.days_pdz}}
          </template>
        </el-table-column>

      </el-table>
      <br/>
    </div>
    <label v-else class="add-edit-label">
      <strong>Ожидается получение информации о взаиморасчетах, может потребоваться некоторе время.</strong>
    </label>

    <p
        v-if="treaties_data.length == 0 && !client.waiting.dz"
    >
      Данные о взаиморасчетах отсутствуют.
    </p>

  </div>
</template>

<script>
import {inject, ref, reactive, watchEffect} from 'vue'
import moment from "moment";
export default {
  name: "treaties_page",
  setup(){
    const loadJson       = inject('loadJson');
    const svg            = inject('svg');
    const notify         = inject('notify');
    const client         = inject('client');
    const formatNumber   = inject('formatNumber');

    const loading        = ref(false);
    const treaties_data  = reactive([]);

    function red_bold(row){
      if (row.column.property === 'pdz') return 'red_bold'
    }

    async function getData(){
      let result = '';
      treaties_data.length = 0;

      let needUpdate = moment().diff(client.update_date.dz, 'minutes') >= client.update_interval.dz ? true : false;

      if (!client.waiting.dz && !needUpdate) {
        loading.value = true;
        result = await loadJson('/b2b/treaties/get-dz', {client_id: client.id});
        loading.value = false;
        if (result.status === 'success' && result.data) {
          Object.keys(result.data).forEach(key => {
            let tableData = Object.values(result.data[key].data);

            tableData.forEach((el, idx) => {
              el.id = idx + 1000;
            });

            treaties_data.push({
              name      : key,
              dz        : result.data[key].total_dz,
              pdz       : result.data[key].total_pdz,
              tableData,
            })
          })
        }
      } else {
        if(!client.waiting.dz && needUpdate){
          client.waiting.treaties = true;
          client.waiting.dz = true;
          let treaties = await loadJson('/b2b/treaties/update', {client_id: client.id});
          loadJson('/b2b/treaties/update-dz', {client_id: client.id});
        }
      };
    }

    watchEffect(() => {
      client.id && client.waiting.dz === false ? getData() : '';
    });

    return{
      svg, loading, treaties_data, client,
      red_bold, formatNumber,
    }
  },
}
</script>

<style scoped>

</style>