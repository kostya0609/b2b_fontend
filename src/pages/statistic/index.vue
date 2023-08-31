<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="route_page_container"
  >
    <h1 class="main-h1">Статистика заказов</h1>
    <p>Информация предоставлена за последние 12 месяцев и актуальна по состоянию на {{client.update_date.statistic.format('DD.MM.YYYY, HH:mm')}}</p>

    <el-table
      v-if="!client.waiting.statistic"
      :data="tableData"
      style="width: 100%"
      max-height="600"
      border
      scrollbar-always-on
      row-key="id"

      :cell-class-name="gray"
      :header-cell-class-name="gray"

      :default-expand-all="false"
      :summary-method="getSummaries"
      show-summary
      sum-text="Итого"
    >
      <el-table-column prop="group" label="Ценовая группа" width="300"/>

      <el-table-column prop="ago_1" :label="moment().subtract('months', 1).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_1, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_2" :label="moment().subtract('months', 2).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_2, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_3" :label="moment().subtract('months', 3).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_3, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_4" :label="moment().subtract('months', 4).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_4, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_5" :label="moment().subtract('months', 5).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_5, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_6" :label="moment().subtract('months', 6).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_6, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_7" :label="moment().subtract('months', 7).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_7, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_8" :label="moment().subtract('months', 8).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_8, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_9" :label="moment().subtract('months', 9).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_9, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_10" :label="moment().subtract('months', 10).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_10, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_11" :label="moment().subtract('months', 11).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_11, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="ago_12" :label="moment().subtract('months', 12).format('MMMM')" width="100">
        <template #default="scope">
          {{formatNumber(scope.row.ago_12, true)}}
        </template>
      </el-table-column>

      <el-table-column prop="total" label="Итого" width="120">
        <template #default="scope">
          {{formatNumber(scope.row.total, true)}}
        </template>
      </el-table-column>
    </el-table>

    <label v-else class="add-edit-label">
      <strong>Ожидается получение информации по статистике заказов, может потребоваться некоторе время.</strong>
    </label>

  </div>
</template>

<script>
import moment from 'moment';
moment.locale('ru');
import {inject, ref, reactive, watchEffect} from 'vue'
export default {
  name: "statistic_page",
  setup(){
    const loadJson       = inject('loadJson');
    const svg            = inject('svg');
    const notify         = inject('notify');
    const client         = inject('client');
    const formatNumber   = inject('formatNumber');

    const loading        = ref(false);
    const tableData      = reactive([]);

    function gray(row, column, rowIndex, columnIndex){
      if (row.column.property === 'total')
        return 'gray'
    }

    function getSummaries(param) {
      const { columns, data } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Итого';
          return;
        }

        let sum = 0, error = '';
        if (index > 0 && index < 13){
          let col_name = 'ago_' + index ;
          data.forEach(item => {
            if (!isNaN(+item[col_name])) sum += +item[col_name];
            else {error = 'Не число'; return};
          });
        }

        if (index == 13){
          data.forEach(item => {
            if (!isNaN(+item.total)) sum += +item.total;
            else {error = 'Не число'; return};
          });
        }

        if (!error) sums[index] = formatNumber(sum.toFixed(0), true);
          else sums[index] = error;
      });
      return sums;
    };

    async function getData() {
      let result = '';
      tableData.length = 0;

      let needUpdate = moment().diff(client.update_date.statistic, 'minutes') >= client.update_interval.statistic ? true : false;

      if (!client.waiting.statistic && !needUpdate) {
        loading.value = true;
        result = await loadJson('/b2b/statistic/get', {client_id: client.id});
        loading.value = false;

        if (result.status === 'success' && result.data) {
          let data = Object.values(result.data)
          data.forEach((el, idx) => {
            el.id = 10000 + idx;
            tableData.push(el);
          })
        }

      } else {
            if(!client.waiting.statistic && needUpdate){
              client.waiting.statistic = true;
              loadJson('/b2b/statistic/update', {client_id: client.id});
            }
      };
    };

    watchEffect(() => {
      client.id && client.waiting.statistic === false ? getData() : '';
    });

    return {
      svg, loading, tableData, client, gray,
      formatNumber, getSummaries, moment,
    }
  }
}
</script>

<style scoped>
.route_page_container >>> .el-table__placeholder{
  display: inline!important;
}
.route_page_container >>> .el-table__indent{
  padding: 0!important;
}
.route_page_container >>> .el-table__row--level-1{
  background-color: #f9f9f9!important;
}
.route_page_container >>> .el-table th.el-table__cell::first-letter{
  text-transform: uppercase;
}

/*.route_page_container >>> .el-table .el-table__cell{*/
/*  padding: 0!important;*/
/*}*/
/*.route_page_container >>> .el-table .cell {*/
/*  padding: 0!important;*/
/*}*/
/*.route_page_container >>> .el-table__footer-wrapper tbody td.el-table__cell, .el-table__header-wrapper tbody td.el-table__cell{*/
/*  padding: 10px!important;*/
/*}*/
/*.route_page_container >>> .my_cell{*/
/*  padding: 10px;*/
/*  word-break: normal*/
/*}*/
/*.route_page_container >>> .my_cell_center{*/
/*  padding: 10px;*/
/*  word-break: normal;*/
/*  text-align: center!important;*/
/*}*/

</style>