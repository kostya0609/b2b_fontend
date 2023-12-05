<template>
  <pre-loader
      class="b2b-order"
      :loading="loading"
  >
    <h1 class="b2b-order__title b2b-title b2b-title_h1"> Оформление заказа {{ company_pdz ? ' не возможно' : '' }} </h1>

    <h3
      v-if="!select_treaty"
      class="b2b-order__title b2b-title b2b-title_h3"
    >
      Чтобы сформировать заказ обязательно выберите организацию и договор.
    </h3>

    <el-row
        :gutter="10"
        class="b2b-order__row"
    >
      <el-col :md="12">
        <el-select
            v-model="select_company"
            class="b2b-order__select"
            placeholder="Выберете организацию"
            :disabled="apply_discount"
        >
          <el-option
              v-for="item in company_list"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          >
          </el-option>
        </el-select>
      </el-col>

      <el-col :md="12">
        <el-select
            v-model="select_treaty"
            class="b2b-order__select"
            placeholder="Выберете договор"
            :disabled="apply_discount"
        >
          <el-option
              v-for="item in treaties_list"
              :class="{'red_bold': item.pdz}"
              :key="item.guid"
              :label="item.label"
              :value="item.guid"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <h2 class="b2b-order__title b2b-order__title_pb-10 b2b-title b2b-title_h2">
      Ваш заказ {{ current_treaty.type === 'Кредитный' ? ('(доступный лимит по заказу: ' + formatNumber(current_treaty_limit) +' руб.)') : '' }}
    </h2>

    <p
        v-if="select_treaty"
        class="b2b-order__sub-title"
    >
      Выбран договор № {{ current_treaty.number }} с {{ current_treaty.company }}, тип договора - {{ current_treaty.type }},
      срок действия с {{ current_treaty.date_start }} по {{ current_treaty.date_final }},
      {{ current_treaty.type === 'Кредитный' ? ' сумма кредита - ' + formatNumber(current_treaty.sum_credit, true) +
        ' руб., ДЗ - ' + (current_treaty.dz ? formatNumber(current_treaty.dz, true) + ' руб.' : '0 руб.')  + ', ПДЗ - ' + (current_treaty.pdz ? formatNumber(current_treaty.pdz, true) + ' руб.' : '0 руб.') : ''}}
    </p>

    <order-table
        v-model:orderProduct="orderProduct"
        :apply_discount="apply_discount"
        class="b2b-order__row"
    />

    <p
        v-if="orderProduct.length > 0"
        class="b2b-order__description"
    >
      Выбрано: количество наименований <span class="b2b-order__description_orange-bold">{{ orderProduct.length }}</span>,
      единиц товара <span class="b2b-order__description_orange-bold">{{ order_total_amount }}</span>,
      стоимость заказа {{apply_discount ? ' со скидкой ' : ''}}<span class="b2b-order__description_orange-bold">{{ apply_discount ? formatNumber(order_discount_total_price.toFixed(2)) : formatNumber(order_total_price.toFixed(2)) }} руб.</span>
    </p>

    <p
        v-if="orderProduct.length > 0 && apply_discount"
        class="b2b-order__description"
    >
      Ваша скидка составила <span class="b2b-order__description_orange-bold">{{ formatNumber((+order_total_price - order_discount_total_price).toFixed(2)) }} руб.</span>
    </p>

    <p
        v-if="current_treaty.type === 'Кредитный'"
        :class="['b2b-order__description', {'b2b-order__description_orange-bold': current_treaty_limit < order_total_price}, {'b2b-order__description_red-bold': out_of_limit}]"
    >
      Доступный остаток по Вашему кредитному договору составляет <span class="b2b-order__description_orange_bold">{{ formatNumber(current_treaty_limit, true) }} руб.</span>,
      сумма текущего заказа {{ apply_discount ? 'со скидкой' : '' }} составляет <span class="b2b-order__description_orange_bold">{{ formatNumber(order_total_price.toFixed(2)) }} руб.</span>
    </p>

    <div class="b2b-order-buttons">
      <el-button
          v-if="orderProduct.length > 0"
          type="primary"
          class="b2b-order-buttons__btn"
          :disabled="!!out_of_limit || !select_treaty || !!company_pdz"
          @click="apply_discount ? show_send_form = true : getDiscount()"
      >
        {{ apply_discount ? 'Оформить заказ' : 'Рассчитать скидку' }}
      </el-button>

      <el-button
          v-if="apply_discount"
          type="primary"
          class="b2b-order-buttons__btn"
          @click="changeOrder"
      >
        Изменить заказ
      </el-button>
    </div>

    <p
        v-if="!select_treaty"
        class="b2b-order__description b2b-order__description_pb20 b2b-order__description_warning-text"
    >
      Чтобы сформировать заказ обязательно выберите организацию и договор!
    </p>

    <h2
        v-if="company_pdz"
        class="b2b-order__title b2b-order__title_red b2b-title b2b-title_h2"
    >
      Имеется просроченная дебиторская задолженность в размере {{ formatNumber(company_pdz) }} руб.
    </h2>

    <send-order
        v-if="show_send_form"
        :company_list="company_list"
        :select_company="select_company"
        :select_treaty="select_treaty"
        @close_send_form="show_send_form = false"
    />
  </pre-loader>
</template>

<script setup>
import { ref, inject, reactive, watchEffect, watch, computed } from "vue";
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import OrderTable from "./components/order_table";
import SendOrder from "./components/send_order";
import { ElMessageBox } from 'element-plus';
import {ClientRepo, OrderRepo} from "@/repositories";

const notify          = inject('notify');
const client          = inject('client');
const formatNumber    = inject('formatNumber');

const orderProduct    = inject('orderProduct');

const select_company  = inject('select_company');
const select_treaty   = inject('select_treaty');
const company_list    = inject('company_list');
const treaties_list   = inject('treaties_list');

const myStorage             = window.localStorage;
const router                = useRouter();
const loading               = ref(false);

const current_treaty        = reactive({});
const company_pdz           = ref(null);
const current_treaty_limit  = ref(null);
const apply_discount        = ref(false);
const show_send_form        = ref(false);

const order_total_price           = computed(() => {
  return orderProduct.reduce((sum, el) => sum + +el.total_price, 0);
});
const order_total_amount          = computed(() => {
  return orderProduct.reduce((sum, el) => sum + +el.amount, 0);
});
const order_discount_total_price  = computed(() => {
  return orderProduct.reduce((sum, el) => sum + +el.discount_total_price, 0);
});
const out_of_limit                = computed(() => {
  return current_treaty.type === 'Кредитный' && (current_treaty_limit.value - order_discount_total_price.value) < 0;
});

async function getData(){
  try {
    loading.value = true;
    let result = await ClientRepo.get({ client_id : client.id, client_guid : client.guid});

    if(result.status == 200 && result.body.data) {
      if(!company_list.length){
        result.body.data.forEach(company => {
          company_pdz.value = +company_pdz.value + +company.pdz
          company_list.push({
            id       : company.id,
            guid     : company.guid,
            name     : company.name,
            treaties : company.treaties,
          })
        })
      } else result.body.data.forEach(company => company_pdz.value = +company_pdz.value + +company.pdz)

    } else {
      await router.push({name : 'login'})
    }
  } catch (e) {
    notify({ title: 'Ошибка получение информации о клиенте', message: e.message, type: 'error', duration: 5000 });
  } finally {
    loading.value = false;
  }
}

function changeOrder(){
  ElMessageBox.confirm(`Вы уверены, что хотите изменить заказ? Информация о скидках будет удалена. После изменения заказа необходимо будет расчитать скидку.`)
      .then( async() => {
        apply_discount.value = false;
        await myStorage.removeItem('b2b_discount');
        await myStorage.setItem('b2b_discount', '0');
        orderProduct.forEach(el => {
          el.discount_price = 0;
          el.discount_total_price = 0;
        })
      })
      .catch(() => {
      })
}

async function getDiscount(){
  let result = '';
  try {
    await ElMessageBox.confirm(`Отправить ваш заказ для рассчета скидки ?`)

    loading.value = true;

    let sendGoods = [];
    await orderProduct.forEach(el => {
      sendGoods.push({
        product_guid : el.guid,
        count        : el.amount,
        price        : el.price,
        sum          :  el.total_price,
      })
    })

    let client_guid = company_list.find(el => {
      return el.id === select_company.value
    }).guid;

    let payload = {
      client_guid      : client_guid,
      client_id        : select_company.value,
      treaty_guid      : select_treaty.value,
      subdivision_guid : client.subdivision,
      goods            : sendGoods,
    }

    result = await OrderRepo.discount(payload);

    if (result.status == 200 && result.body.data) {
      result.body.data.result.forEach(goods => {
        let product = orderProduct.find(product => {
          return goods.product_guid === product.guid
        });
        product.discount_price       = goods.price_after;
        product.discount_value       = goods.discount_value;
        product.discount_total_price = goods.sum_after;
      })
      apply_discount.value = true;
      await myStorage.removeItem('b2b_discount');
      await myStorage.setItem('b2b_discount', '1');

    } else {
      await router.push({name: 'login'})
    }

  } catch (e) {
    if (e !== 'cancel') {
      notify({title: 'Проблема с получением данных с сервера', message: 'Не удалось расчитать скидку на заказ', type: 'error', duration: 5000 });
    }

  } finally {
    loading.value = false;
  }
}

watch([
      () => select_company.value,
      () => select_treaty.value,
    ],

    (values, oldValues) => {

      if (select_company && values[0] !== oldValues[0]){
        select_treaty.value = null;
        let treaties = company_list.find(company => {return company.id === values[0]}).treaties;
        treaties_list.length = 0;
        treaties.forEach(treaty => treaties_list.push({
          type       : treaty.type,
          sum_credit : treaty.type === 'Кредитный' ? treaty.sum_credit : null,
          dz         : treaty.type === 'Кредитный' ? treaty.dz  : null,
          pdz        : treaty.type === 'Кредитный' ? treaty.pdz : null,

          guid       : treaty.guid,
          label      : '№ ' + treaty.number + ' до ' + treaty.date_final + ((treaty.type === 'Кредитный' && treaty.pdz) ? (', ПДЗ = ' + treaty.pdz) : ''),

          number     : treaty.number,
          company    : treaty.company,
          date_start : treaty.date_start,
          date_final : treaty.date_final,
        }));
      };

      if (select_treaty.value && values[1] !== oldValues[1]){
        let treaty = treaties_list.find(treaty => {return treaty.guid === values[1]});
        Object.keys(treaty).forEach(key => {current_treaty[key] = treaty[key]});
        current_treaty_limit.value = (+current_treaty.sum_credit - (+current_treaty.dz)).toFixed(2);
      };

    }
)

watchEffect(() => {
  client.id ? getData() : '';
});

</script>

<style scoped lang="scss">

.b2b {
  &-order {

    &__title {
      padding-bottom: 25px;
      &_red{
        color: red
      }
      &_pb-10{
        padding-bottom: 10px;
      }
    }

    &__sub-title{
      padding-bottom: 10px;
      line-height: 25px;
    }

    &__label {
      margin-bottom: 20px;
    }

    &__row{
      margin-bottom: 20px;
    }

    &__select{
      width: 100% !important;
    }

    &__description{
      margin-bottom: 10px;
      &_pb20{
        padding-bottom: 20px;
      }
      &_orange-bold{
        font-weight: bold;
        color: #EF7C00;
      }
      &_red-bold{
        font-weight: bold;
        color: red;
      }
      &_warning-text{
        color: red;
      }
    }

    &-buttons{
      display: flex;
      justify-content: space-between;
      flex-direction: row-reverse;
      &__btn{
        margin: 10px 0px 20px 0px !important;
      }
    }
  }
}

</style>