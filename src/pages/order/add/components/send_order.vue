<template>
  <pre-loader
      class="b2b-send-order"
      :loading="loading"
  >
    <el-dialog
        title="Выбор места доставки"
        v-model="openModal.sendOrder"
        width="470px"
        :show-close="false"
        :close-on-click-modal="false"
    >

      <label
          v-if="!client.trade_points.length"
          class="b2b-send-order__label b2b-send-order__label_red b2b-label"
      >
        Невозможно оформить заказ, так как нет торговых точек. Обратитесь к менеджеру.
      </label>

      <div class="b2b-send-order__row">
        <el-select
            v-model="selectTradePoint"
            class="b2b-send-order__field"
            placeholder="Выберите адрес доставки">
          <el-option
              v-for="item in client.trade_points"
              :key="item.guid"
              :label="item.name + ', ' + item.address"
              :value="item.guid"
          >
          </el-option>
        </el-select>
      </div>

      <div class="b2b-send-order__row">
        <el-input
            v-model="orderComment"
            class="b2b-send-order__field"
            type="textarea"
            :rows="5"
            placeholder="Комментарий к заказу">
        </el-input>
      </div>

      <div class="b2b-send-order-buttons">
        <el-button
            class="b2b-send-order-buttons__btn"
            @click="emit('close_send_form')"
        >
          Отмена
        </el-button>

        <el-button
            type="primary"
            class="b2b-send-order-buttons__btn_orange, b2b-send-order-buttons__btn"
            @click="sendOrder"
            :disabled="!selectTradePoint"
        >
          Отправить
        </el-button>
      </div>

    </el-dialog>
  </pre-loader>
</template>

<script setup>
import {inject, reactive, ref} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PreLoader from "@/components/pre_loader";
import {ElMessageBox} from "element-plus";
import {OrderRepo} from "@/repositories";

const props = defineProps({
  company_list:{
    type : Array
  },
  select_company : {
    type : Number
  },
  select_treaty:{
    type: String
  }
});

const emit = defineEmits(['close_send_form',])

const orderProduct     = inject('orderProduct');
const client           = inject('client');
const notify           = inject('notify');

const router           = useRouter();
const loading          = ref(false);

const openModal        = reactive({ sendOrder: true });
const selectTradePoint = ref(null);
const orderComment     = ref(null);

async function sendOrder() {
  let result = '';
  try {
    await ElMessageBox.confirm(`Отправить ваш заказ для оформления?`)

    openModal.sendOrder = false;
    loading.value = true;

    let sendGoods = [];
    await orderProduct.forEach(el => {
      sendGoods.push({
        product_guid  : el.guid,
        count         : el.amount,
        price         : el.discount_price,
        sum           : el.discount_total_price,
      })
    })

    let client_guid = props.company_list.find(el => {
      return el.id === props.select_company
    }).guid;

    let payload = {
      client_guid       : client_guid,
      client_id         : props.select_company,
      treaty_guid       : props.select_treaty,
      subdivision_guid  : client.subdivision,
      goods             : sendGoods,
      trade_point       : selectTradePoint.value,
      comment           : orderComment.value,
    }

    result = await OrderRepo.add(payload);

    if (result.status == 200) {

      notify({title: 'Оформление заказа', message: 'Ваш заказ успешно отправлен на оформление.', type: result.status});
      orderProduct.length = 0;
      let b2b_basket_count = document.querySelector('.b2b_basket_count');
      b2b_basket_count ? b2b_basket_count.setAttribute("hidden", "hidden") : '';
      await router.push({name: 'order_history'})

    } else {
      await router.push({name: 'login'})
    }

  } catch (e) {
    if (e !== 'cancel') {
      emit('close_send_form')
      notify({title: 'Проблема с получением данных с сервера', message: 'Не удалось оформить заказ', type: 'error', duration: 5000 });
    }

  } finally {
    loading.value = false;
  }

}

</script>

<style scoped lang="scss">

.b2b{
  &-send-order{
    &__label{
      padding-bottom: 15px;
      &_red{
        color: red;
      }
    }

    &__row{
      margin-bottom: 15px;
    }

    &__field{
      width: 100%;
    }

    &-buttons{
      display: flex;
      justify-content: space-between;
      flex-direction: row-reverse;
      &__btn{
        margin: 0px 0px 15px 0px !important;
        &_orange{
          background: #EF7C00!important;
          border-color: #EF7C00!important;
          color: white!important;
        }
      }
    }
  }
}

</style>