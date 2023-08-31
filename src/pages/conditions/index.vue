<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="route_page_container"
  >
    <h1 class="main-h1">Условия сотрудничества</h1>
    <p>Информация актуальна по состоянию на {{client.update_date.treaties.format('DD.MM.YYYY, HH:mm')}}</p>

    <p class="main-h2" style="padding-top : 5px">Ваши скидки </p>

    <div v-if="!client.waiting.treaties">
      <div>
        <div
            style="
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
          "
        >
          <div
              v-for="(discount, idx) in discounts"
              :key="idx + '_'+discount.discount"
              style="width: 138px"
          >

            <div
                style="
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
            "
            >
              <span style="text-align: center; font-size: 40px; font-weight: bold">{{discount.discount ?? 0}}%</span>
            </div>

            <div
                style="
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 10px;
            "
            >
              <span style="text-align: center">{{discount.group ?? 0}}</span>
            </div>

          </div>
        </div>
      </div>

      <div
          v-for="(company, idx) in conditions_data"
          :key="idx"
      >
        <h2 class="main-h2">Договоры {{company.name}}</h2>
        <el-table
            :data="company.tableData"
            style="width: 100%"
            border
            max-height="600"
            stripe
            scrollbar-always-on
        >
          <el-table-column prop="number" label="Номер договора"/>
          <el-table-column prop="company" label="Огранизация"/>
          <el-table-column prop="type" label="Тип договора" width="120"/>
          <el-table-column prop="date_final" label="Дата окончания" sortable/>
          <el-table-column prop="sum_credit" label="Сумма кредита" sortable>
            <template #default="scope">
              {{formatNumber(scope.row.sum_credit, true)}}
            </template>
          </el-table-column>
          <el-table-column prop="delayed" label="Дни отсрочки" sortable/>
          <el-table-column prop="date_last_batch" label="Дата последней отгрузки"/>
          <el-table-column label="Снижение скидки за кредит">
            <template #default="scope">
              {{calcDiscount(scope.row.delayed)}}
            </template>
          </el-table-column>
        </el-table>
        <br/>
      </div>
    </div>

    <label v-else class="add-edit-label">
      <strong>Ожидается получение информации об условиях сотрудничества, может потребоваться некоторе время.</strong>
    </label>

  </div>
</template>

<script>
import {inject, ref, reactive, watchEffect} from 'vue'
import moment from "moment";
export default {
  name: "conditions_page",
  setup(){
    const loadJson        = inject('loadJson');
    const svg             = inject('svg');
    const notify          = inject('notify');
    const client          = inject('client');
    const formatNumber    = inject('formatNumber');

    const loading         = ref(false);
    const conditions_data = reactive([]);
    const discounts       = reactive([]);

    function calcDiscount(delayed){
      let discount = 0;

      if(delayed > 0   && delayed <= 30)  discount = '2%';
      if(delayed > 30  && delayed <= 60)  discount = '3%';
      if(delayed > 60  && delayed <= 90)  discount = '4%';
      if(delayed > 90  && delayed <= 120) discount = '5%';
      if(delayed > 120 && delayed <= 150) discount = '6%';
      if(delayed > 150 && delayed <= 180) discount = '7%';
      if(delayed > 180)                   discount = '8%';

      return discount;
    };

    async function getData(){
      let result = '';
      conditions_data.length = 0;

      let needUpdate = moment().diff(client.update_date.treaties, 'minutes') >= client.update_interval.treaties ? true : false;

      if (!client.waiting.treaties && !needUpdate) {
        loading.value = true;
        result = await loadJson('/b2b/treaties/get', {client_id: client.id});
        loading.value = false;

        if (result.status === 'success' && result.data) {
          Object.keys(result.data).forEach(key => {
            conditions_data.push({
              name      : key,
              tableData : result.data[key].data,
            })
          })
          discounts.length = 0;
          result.discounts.forEach(el => discounts.push(el))
        }
      } else {
        if(!client.waiting.treaties && needUpdate){
          client.waiting.treaties = true;
          client.waiting.dz = true;
          let treaties = await loadJson('/b2b/treaties/update', {client_id: client.id});
          loadJson('/b2b/treaties/update-dz', {client_id: client.id});
        }
      };

    }

    watchEffect(() => {
      client.id && client.waiting.treaties === false ? getData() : '';
    });

    return{
      svg, loading, conditions_data, discounts, calcDiscount, formatNumber, client
    }
  },
}
</script>

<style scoped>

</style>
