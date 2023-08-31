<template>
  <div>
    <el-table
        :data="orderProduct"
        :default-sort="{ prop: 'name', order: 'descending' }"
        style="width: 100%;"
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
              class="product_name_span"
              @click="emit('getInfoProduct', scope.row.guid);"
          >
            {{scope.row.name}}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="article" label="Артикул" width="130"/>

      <el-table-column prop="price" label="Цена, руб." sortable width="90">
        <template #default="scope">
          <span :class="{'underline_price' : apply_discount}">
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
              @input="inputAmount(scope.$index, scope.row)"
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
              @click="emit('deleteProduct', scope.$index, scope.row);"
              style="border-radius: 50%; background-color: #a7a0a0; color: white; width: 30px; height: 30px; padding: 0;"
          >
            X
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {inject} from "vue";

export default {
  name: "order_add_order_table",
  props : ['orderProduct', 'apply_discount', 'productData'],
  emits : ['deleteProduct', 'getInfoProduct'],
  setup(props, {emit}){
    const notify       = inject('notify');
    const formatNumber = inject('formatNumber');

    function inputAmount(idx,row){
       if (+row.amount >= 1){
      //   //ниже на случай если руками введут число больше чем есть в остатках
      //   if (+row.count >= +row.amount){
      //     row.total_price = ((+row.price) * (+row.amount)).toFixed(2);
      //   }else{
      //    notify('Ошибка добавления товара', `Товар ${row.name} в наличие на складе ${row.count} шт.`, 'error');
      //    row.amount = +row.count;
      //    row.total_price = ((+row.price) * (+row.amount)).toFixed(2);
      //   }
      //
      //   let product_row = props.productData.find(el => {return el.guid === row.guid});
      //   product_row ? product_row.amount = row.amount : '';
      //

         //ниже новый код
         row.total_price = ((+row.price) * (+row.amount)).toFixed(2);
         let product_row = props.productData.find(el => {return el.guid === row.guid});
         product_row ? product_row.amount = row.amount : '';


       }else{
         emit('deleteProduct', idx, row)
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

    return{
      emit, inputAmount, getSummaries, formatNumber
    }
  }
}
</script>

<style scoped>

</style>