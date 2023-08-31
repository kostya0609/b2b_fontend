<template>
  <div>
    <el-table
        :data="productData"
        style="width: 100%;"
        border
        max-height="500"
        stripe
        :default-sort="defaultSort"
        @sort-change="sortChange"
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
<!--      <el-table-column prop="count" label="Наличие, шт" sortable width="140"/>-->
      <el-table-column prop="price" label="Цена, руб." sortable width="120">
        <template #default="scope">
          {{formatNumber(scope.row.price)}}
        </template>
      </el-table-column>
      <el-table-column v-if="!apply_discount" label="Действие" width="110" align="center">
        <template #default="scope">
<!--          count  - {{scope.row.count}}-->
<!--          amount - {{scope.row.amount}}-->
          <el-button
              size="small"
              type="primary"
              @click="emit('addProduct', scope.row);"
              :class="['add_order_button']"
          >
<!--            :class="['add_order_button', {'add_order_button_disabled' : +scope.row.count <= +scope.row.amount}]"-->
<!--            :disabled="+scope.row.count <= +scope.row.amount"-->
            <el-icon><Plus/></el-icon> &nbsp; В заказ
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import {inject, reactive} from "vue";

export default {
  name: "order_add_product_table",
  props : ['productData', 'defaultSort', 'apply_discount'],
  emits : ['addProduct', 'sortChange', 'getInfoProduct'],
  setup(props, {emit}){
    const formatNumber = inject('formatNumber');

    const defaultSort  = reactive({
      prop: props.defaultSort.name, order: props.defaultSort.order === 'asc' ? 'ascending' : 'descending'
    })

    function sortChange(sortData){
      emit('sortChange', sortData);
    };
    return{ emit, sortChange, defaultSort, formatNumber}
  }
}
</script>

<style scoped>

</style>