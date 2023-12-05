<template>
  <pre-loader
      class="b2b-client"
      :loading="loading"
  >
    <h1 class="b2b-client__title b2b-title b2b-title_h1">{{client.name}}</h1>

    <div
        v-for="(info, idx) in  client_info"
        :key="idx"
        class="b2b-row b2b-client__row"
    >
      <h4 class="b2b-title b2b-title_h4"> {{info.label}} </h4>

      {{info.format ? formatNumber(info.value, true) : info.value}}
    </div>

    <h2
        v-if="client.trade_points.length>0"
        class="b2b-client__sub-title b2b-title b2b-title_h2"
    >
      Торговые точки
    </h2>

    <div
        v-for="(point, idx) in client.trade_points"
        :key="idx"
        class="b2b-row b2b-client__row"
    >
      <h4 class="b2b-title b2b-title_h4 b2b-title_ml-20"> - {{point.name}} </h4>

      {{point.address}}
    </div>

    <div v-if="client.children.length > 0">
      <h2 class="b2b-client__sub-title b2b-title b2b-title_h2">Состав холдинга</h2>
      <div
          v-for="(child, idx) in client.children"
          :key="idx"
          class="b2b-row b2b-client__row"
      >
        <h4 class="b2b-title b2b-title_h4 b2b-title_ml-20"> - </h4>

        {{child.name}},

        <h4 class="b2b-title b2b-title_h4"> ИНН </h4>

        {{child.inn}}
      </div>
    </div>

    <p
        class="b2b-client__back-feel"
        @click="openModal.feelBack = true"
    >
      Если вы обнаружили ошибки в информации, сообщите нам.
    </p>

    <el-dialog
      v-model="openModal.feelBack" title="Напишите нам"
      class="b2b-back-feel"
      width="600px"
      align-center
      @close="openModal.feelBack=false"
      :close-on-click-modal="false"
    >
      <div class="b2b-back-feel__body">
        <el-row class="b2b-row b2b-back-feel__row">
          <el-col>
            <label class="b2b-back-feel__label b2b-label">
              E-Mail
            </label>
            <el-input
                v-model="openModal.email"
                placeholder="Введите ваш e-mail"
            >
            </el-input>
          </el-col>
        </el-row>
        <el-row class="b2b-row b2b-back-feel__row">
          <el-col>
            <label class="b2b-back-feel__label b2b-label">
              Телефон
            </label>
            <el-input
                v-model="openModal.phone"
                placeholder="Введите ваш телефон"
            >
            </el-input>
          </el-col>
        </el-row>
        <el-row class="b2b-row b2b-back-feel__row">
          <el-col>
            <label class="b2b-back-feel__label b2b-label">
              Комментарий
            </label>
            <el-input
                v-model="openModal.comment"
                :class="{'b2b-invalid' : openModal.error}"
                type="textarea"
                rows="5"
                placeholder="Введите комментарий"
            >
            </el-input>
            <small
                v-if="openModal.error"
                class="b2b-small"
            >
              {{openModal.error}}
            </small>
          </el-col>
        </el-row>
        <el-row class="b2b-row b2b-back-feel__row">
          <el-col align="right">
            <el-button
                @click="sendBackFeel"
                type="primary"
            >
              Отправить
            </el-button>
            <el-button
                @click="openModal.feelBack = false"
            >
              Отменить
            </el-button>

          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </pre-loader>
</template>

<script setup>
import {inject, reactive, ref, watchEffect} from "vue";
import PreLoader from "@/components/pre_loader";
import {BackFeelRepo} from "@/repositories"
import {useRouter, useRoute} from 'vue-router';

const client          = inject('client');
const formatNumber    = inject('formatNumber');
const notify          = inject('notify');

const router          = useRouter();
const loading         = ref(false);

const client_info     = ref([
  {value : client.inn,                label : 'ИНН'},
  {value : client.ur_address,         label : 'Юридический адрес'},
  {value : client.count_trade_points, label : 'Количество торговых точек'},
  {value : client.revolving_credit,   label : 'Сумма выданых возобновляемых кредитов по договорам', format : true},
  {value : client.single_credit,      label : 'Сумма выданых разовых кредитов по договорам',        format : true},
]);

const openModal       = reactive({
  feelBack : false,
  email    : '',
  phone    : '',
  comment  : '',
  error    : null,
});

async function sendBackFeel(){
  if(!openModal.comment){
    openModal.error = 'Необходимо обязательно указать комментарий!';
    return
  }

  try {
    loading.value = true;
    let result = await BackFeelRepo.add(
        {
                   NAME            : client.name,
                   ACTIVE          : 'Y',
                   MODIFIED_BY     : 5,
                   IBLOCK_ID       : 24,
                   PROPERTY_VALUES : {
                      430  : openModal.email,
                      542  : openModal.phone,
                      437  : openModal.comment,
                      6694 : client.inn,
                      436  : client.name,
                   },
        },
        {kraton : true});

    if(result.status == 200) {
      openModal.feelBack = false;
      openModal.phone    = '';
      openModal.email    = '';
      openModal.comment  = '';
      notify({ title: 'Отправка сообщения', message: '', type: 'success'});

    } else {
      await router.push({name : 'login'})
    }

  } catch (e) {
    notify({ title: 'Ошибка при отправке сообщения', message: e.message, type: 'error', duration: 5000 });

  } finally {
    loading.value = false;
  }
}

watchEffect(() => {
  openModal.comment ? openModal.error = null : '';
});

</script>

<style scoped lang="scss">

.b2b{
  &-client{
    &__row{
      margin-bottom: 20px;
    }
    &__title{
      padding-bottom: 25px;
    }
    &__sub-title{
      margin-top: 25px;
      margin-bottom: 15px;
    }
    &__back-feel{
      padding-top: 15px;
      color: #EF7C00;
      text-decoration: #EF7C00 underline 1px;
      cursor: pointer
    }
  }
  &-back-feel{
    &__body{
      padding: 0 10px;
      margin-top: 10px;
    }
    &__row{
      margin-bottom: 20px;
    }
    &__label{
      margin-bottom: 10px;
    }
  }
}

</style>
