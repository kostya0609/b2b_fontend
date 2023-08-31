<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="route_page_container"
  >
    <h1 class="main-h1">Авторизация в личном кабинете</h1>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          E-MAIL
        </label>
        <el-input
            v-model="loginData.email"
            :class="['add-edit-element', {'invalid' : errors.email}]"
            placeholder="E-MAIL"
        >
        </el-input>
        <small v-if="errors.email">{{errors.email}}</small>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          Пароль
        </label>
        <el-input
            v-model="loginData.password"
            type="password"
            :class="['add-edit-element', {'invalid' : errors.password}]"
            v-on:keyup.enter="toLogin"
            placeholder="Пароль"
        >
        </el-input>
        <small v-if="errors.password">{{errors.password}}</small>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-button
            type="primary"
            @click="toLogin"
            style="width: 50%; background: #EF7C00; border-color: #EF7C00; color: white"
        >
          Войти
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useRouter, useRoute} from 'vue-router';
import {ref, reactive, inject, watchEffect, provide} from "vue";
import moment from "moment";
export default {
  name: "login_page",
  setup(){
    const router            = useRouter();
    const route             = useRoute();
    const myStorage         = window.localStorage;
    const loadJson          = inject('loadJson');
    const svg               = inject('svg');
    const client            = inject('client');
    const notify            = inject('notify');

    const updateData        = inject('updateData');

    const loading   = ref(false);
    const loginData = reactive({
      email    : null,
      password : null,
    })
    const errors    = reactive({
      email    : null,
      password : null,
    })

    if (client.token && route.name === 'login') router.push({name  : 'client'});

    function isValid(){
      let valid = true;
      if (!loginData.email)    {valid = false; errors.email    = 'Необходимо указать электронную почту!'};
      if (!loginData.password) {valid = false; errors.password = 'Необходимо указать пароль!'};
      return valid;
    };

    async function toLogin() {
      if (!isValid()) return;
      loading.value = true;
      let result = await loadJson('/b2b/client/login', {...loginData});
      loading.value = false;

      if (result.status === 'success' && result.authorisation && result.authorisation.token) {
        client.id                      = result.client.id;
        client.token                   = result.authorisation.token;
        client.name                    = result.client.name;
        client.inn                     = result.client.inn;
        client.guid                    = result.client.guid;
        client.subdivision             = result.client.subdivision;
        client.ur_address              = result.client.ur_address;
        client.count_trade_points      = result.client.count_trade_points;
        client.revolving_credit        = result.client.revolving_credit;
        client.single_credit           = result.client.single_credit;
        client.update_date.statistic   = result.client.date_update_statistic ? moment(result.client.date_update_statistic) : moment('2023-01-01T00:00:00.000000Z');
        client.update_date.treaties    = result.client.date_update_treaties  ? moment(result.client.date_update_treaties)  : moment('2023-01-01T00:00:00.000000Z');
        client.update_date.dz          = result.client.date_update_dz        ? moment(result.client.date_update_dz)        : moment('2023-01-01T00:00:00.000000Z');
        client.update_date.retro_bonus = result.client.date_update_rb        ? moment(result.client.date_update_rb)        : moment('2023-01-01T00:00:00.000000Z');

        client.trade_points.length = 0;
        result.client.trade_points.forEach(el => client.trade_points.push(el));

        client.children.length = 0;
        result.client.children.forEach(el => client.children.push(el));

        await myStorage.removeItem('b2b_client_token');
        await myStorage.setItem('b2b_client_token', result.authorisation.token);

        updateData();

        router.push({name: 'client'});
        window.b2bShowOut();

      } else {
        notify('Ошибка авторизации', result.message, 'error');
        router.push({name: 'login'});
      }
    };

    watchEffect(() => {
      loginData.email    ? errors.email    = null : '';
      loginData.password ? errors.password = null : '';
    });

    return{
      svg, loading, loginData, errors,
      toLogin
    }
  }
}
</script>

<style scoped>

</style>