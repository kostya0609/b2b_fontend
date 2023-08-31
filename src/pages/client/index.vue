<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
       class="route_page_container"
  >
    <h1 class="main-h1">{{client.name}}</h1>
      <div>
        <div class="client-info-div"><h4 class="client-info-p">ИНН </h4> &nbsp;{{client.inn}}</div>
        <div class="client-info-div"><h4 class="client-info-p">Юридический адрес </h4> &nbsp;{{client.ur_address}}</div>
        <div class="client-info-div"><h4 class="client-info-p">Количество торговых точек </h4> &nbsp;{{client.count_trade_points}}</div>
        <div class="client-info-div"><h4 class="client-info-p">Сумма выданых возобновляемых кредитов по договорам </h4> &nbsp;{{formatNumber(client.revolving_credit)}}</div>
        <div class="client-info-div"><h4 class="client-info-p">Сумма выданых разовых кредитов по договорам </h4> &nbsp;{{formatNumber(client.single_credit)}}</div>

        <h2 v-if="client.trade_points.length>0" class="main-h2">Торговые точки</h2>
        <div
            v-for="point in client.trade_points"
            class="client-info-div"
        >
          <h4 class="client-info-p" style="margin-left: 20px"> - {{point.name}} </h4> &nbsp;{{point.address}}
        </div>

        <div v-if="client.children.length > 0">
          <h2 class="main-h2">Состав холдинга</h2>
          <div
              v-for="child in client.children"
              class="client-info-div"
          >
            <h4 class="client-info-p" style="margin-left: 20px"> - </h4> {{child.name}}, &nbsp;<h4 class="client-info-p">ИНН</h4> {{child.inn}}
          </div>
        </div>

        <br>
        <p
          class="back_feel"
          style="cursor: pointer"
          @click="openModal.feelBack = true"
        >
          Если вы обнаружили ошибки в информации, сообщите нам.
        </p>
      </div>
    <el-dialog
      v-model="openModal.feelBack" title="Напишите нам"
      width="600px"
      align-center
      @close="openModal.feelBack=false"
      :close-on-click-modal="false"
    >
      <div style="padding: 0 10px; margin-top: 10px">
        <el-row style="margin-bottom: 20px">
          <el-col>
            <label class="add-edit-label">
              E-Mail
            </label>
            <el-input
                v-model="openModal.email"
                :class="['add-edit-element']"
                placeholder="Введите ваш e-mail"
            >
            </el-input>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 20px">
          <el-col>
            <label class="add-edit-label">
              Телефон
            </label>
            <el-input
                v-model="openModal.phone"
                :class="['add-edit-element']"
                placeholder="Введите ваш телефон"
            >
            </el-input>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 20px">
          <el-col>
            <label class="add-edit-label">
              Комментарий
            </label>
            <el-input
                v-model="openModal.comment"
                :class="['add-edit-element', {'invalid' : openModal.error}]"
                type="textarea"
                rows="5"
                placeholder="Введите комментарий"
            >
            </el-input>
            <small v-if="openModal.error">{{openModal.error}}</small>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 10px">
          <el-col align="right">
            <el-button
                @click="sendFeelBack"
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
  </div>
</template>

<script>
import {inject, reactive, ref, watchEffect} from "vue";
export default {
  name  : "client_page",
   setup(){
     const client          = inject('client');
     const formatNumber    = inject('formatNumber');
     const loadJson_kraton = inject('loadJson_kraton');
     const svg             = inject('svg');
     const notify          = inject('notify');

     const loading         = ref(false);

     const openModal       = reactive({
       feelBack : false,
       email    : '',
       phone    : '',
       comment  : '',
       error    : null,
     });

     async function sendFeelBack(){
       if(!openModal.comment){ openModal.error = 'Необходимо обязательно указать комментарий!'; return}
       loading.value = true;
       let result = await loadJson_kraton('/local/rest/element/add/', {
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
       });
       loading.value = false;
       if(result.status === 'success'){
         openModal.feelBack = false;
         openModal.phone    = '';
         openModal.email    = '';
         openModal.comment  = '';
       }
       notify('Отправка сообщения', result.message, result.status);
     }

     watchEffect(() => {
       openModal.comment ? openModal.error = null : '';
     });

     return {
      client, svg, loading, formatNumber, openModal,
      sendFeelBack
     }
   }
}
</script>

<style scoped>

</style>
