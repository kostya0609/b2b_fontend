<template>
  <pre-loader
      class="b2b-order-table"
      :loading="loading"
  >
    <el-table
        :data="orderProduct"
        :default-sort="{ prop: 'name', order: 'descending' }"
        class="b2b-order-table__table"
        border
        max-height="500"
        stripe
        show-summary
        :summary-method="getSummaries"
        sum-text="Итого"
        scrollbar-always-on
    >
      <el-table-column prop="name" label="Наименование" sortable>
        <template #default="scope">
          <span
              class="b2b-order-table__cell_underline"
              @click="getInfoProduct(scope.row.guid)"
          >
            {{scope.row.name}}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="article" label="Артикул" width="130"/>

      <el-table-column prop="price" label="Цена, руб." sortable width="90">
        <template #default="scope">
          <span :class="{'b2b-order-table__cell_line-through' : apply_discount}">
            {{formatNumber(scope.row.price)}}
          </span>
        </template>
        </el-table-column>


      <el-table-column v-if="apply_discount" prop="discount_price" label="Цена со скидкой, руб." sortable width="95">
        <template #default="scope">
          {{formatNumber(scope.row.discount_price)}}
        </template>
      </el-table-column>

      <el-table-column v-if="apply_discount" prop="discount_value" label="Скидка, %." sortable width="90">
        <template #default="scope">
          {{scope.row.discount_value}}
        </template>
      </el-table-column>


      <el-table-column prop="amount" label="Количетво, шт" sortable width="105">
        <template #default="scope">
          <el-input
              v-model="scope.row.amount"
              type="number"
              @input="inputAmount(scope.row)"
              :disabled="apply_discount"
          />
        </template>
      </el-table-column>

      <el-table-column v-if="!apply_discount" prop="total_price" label="Стоимость, руб." width="100" sortable>
        <template #default="scope">
          {{formatNumber(scope.row.total_price)}}
        </template>
      </el-table-column>

      <el-table-column v-if="apply_discount" prop="discount_total_price" label="Стоимость со скидкой, руб." width="105" sortable>
        <template #default="scope">
          {{formatNumber(scope.row.discount_total_price)}}
        </template>
      </el-table-column>

      <el-table-column v-if="!apply_discount" width="60" align="center">
        <template #default="scope">
          <el-button
              size="small"
              @click="deleteProduct(scope.row)"
              class="b2b-order-table__delete-btn"
          >
            X
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </pre-loader>
</template>

<script setup>
import {inject, ref} from "vue";
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import {BasketRepo, LinkProductRepo} from "@/repositories";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  orderProduct: {
    type: Array,
  },
  apply_discount:{},
});

const notify       = inject('notify');
const formatNumber = inject('formatNumber');
const client       = inject('client');
const orderProduct = inject('orderProduct');

const loading      = ref(false);
const router       = useRouter();

async function inputAmount(row){
  if (+row.amount >= 1){
    let result = '';
    try {
      loading.value = true;
      result = await BasketRepo.edit({ client_id : client.id, product_id : row.id, count : +row.amount});

      if(result.status == 200) {
        row.total_price = ((+row.price) * (+row.amount)).toFixed(2);
      } else {
        await router.push({name : 'login'})
      }
    } catch (e) {
      notify({ title: 'Ошибка изменения заказов', message: e.message, type: 'error', duration: 5000 });
    } finally {
      loading.value = false;
      notify({title : 'Изменение в заказе', message : result.body.msg, type : result.body.status});
    }

  } else {
    await deleteProduct(row);
  }
};

function getSummaries(param) {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'Итого';
      return;
    }

    let sum = 0, error = '';
    if (column.property === 'amount' || column.property === 'total_price' || column.property === 'discount_total_price'){

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

async function getInfoProduct(guid){
  try {
    loading.value = true;
    let result = await LinkProductRepo.linkProduct(
        {product_guid : guid},
        {kraton : true});

    if(result.status == 200 && result.body.link) {
      let link      = document.createElement('a');
      link.href     = 'https://kraton.ru' + result.link
      link.target   = '_blank';
      link.click();

    } else {
      await router.push({name : 'login'})
    }

  } catch (e) {
    notify({ title: 'Ошибка при получении ссылки на товар', message: e.message, type: 'error', duration: 5000 });

  } finally {
    loading.value = false;
  }

};

async function deleteProduct(row){
  let result = '';
  try {
    await ElMessageBox.confirm(`Вы уверены, что хотите удалить из заказа товар - ${row.name} ?`);
    loading.value = true;

    result = await BasketRepo.edit({ client_id : client.id, product_id : row.id, count : 0});
    if(result.status == 200) {
      let idx = orderProduct.findIndex(el => el.id === row.id);
      idx >= 0 ? orderProduct.splice(idx, 1) : '';

      let b2b_basket_count = document.querySelector('.b2b_basket_count');
      if (orderProduct.length > 0 && b2b_basket_count){
        b2b_basket_count.innerHTML = orderProduct.length;
        b2b_basket_count.removeAttribute("hidden");
      }
      else b2b_basket_count ? b2b_basket_count.setAttribute("hidden", "hidden") : '';

      notify({title : 'Удаление товара', message : result.body.message, type :result.body.status});
    } else {
      await router.push({name : 'login'})
    }

  } catch (e) {

    if (e !== 'cancel') {
      notify({title: 'Ошибка при редактировании заказа (удаление позиции)', message: e.message, type: 'error', duration: 5000});
    } else {
      if(row.amount == 0){
        row.amount = 1;
        row.total_price = row.price;
      }
    }

  } finally {
    loading.value = false;
  }

};

</script>

<style scoped lang="scss">

.b2b {
  &-order-table {
    &__table{
      width: 100%;
    }

    &__cell{
      &_line-through{
        text-decoration: line-through #EF7C00 2px;
      }
      &_underline{
        color: #EF7C00;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &__delete-btn{
      border-radius: 50%;
      background-color: #a7a0a0;
      color: white;
      width: 30px;
      height: 30px;
      padding: 0;
    }

  }
}

</style>