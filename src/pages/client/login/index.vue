<template>
  <pre-loader
      class="b2b-login"
      :loading="loading"
  >
    <h1 class="b2b-login__title b2b-title b2b-title_h1"> Авторизация в личном кабинете </h1>
    <el-row class="b2b-row b2b-login__row">
      <el-col :md="12">
        <label class="b2b-login__label b2b-label"> E-MAIL </label>
        <el-input
            v-model="loginData.email"
            :class="{'b2b-invalid' : errors.email}"
            placeholder="E-MAIL"
        >
        </el-input>
        <small
            v-if="errors.email"
            class="b2b-small"
        >
          {{errors.email}}
        </small>
      </el-col>
    </el-row>
    <el-row class="b2b-row b2b-login__row">
      <el-col :md="12">
        <label class="b2b-login__label b2b-label"> Пароль </label>
        <el-input
            v-model="loginData.password"
            type="password"
            :class="{'b2b-invalid' : errors.password}"
            v-on:keyup.enter="toLogin"
            placeholder="Пароль"
        >
        </el-input>
        <small
            v-if="errors.password"
            class="b2b-small"
        >
          {{errors.password}}
        </small>
      </el-col>
    </el-row>
    <el-row class="b2b-row">
      <el-col :md="12">
        <el-button
            type="primary"
            @click="toLogin"
            class="b2b-login__button"
        >
          Войти
        </el-button>
      </el-col>
    </el-row>

  </pre-loader>
 </template>

<script setup>
import { useRouter, useRoute} from 'vue-router';
import {ref, reactive, inject, watchEffect, provide} from "vue";
import { useCookies } from '@vueuse/integrations/useCookies'
import PreLoader from "@/components/pre_loader";
import moment from "moment";
import {ClientRepo} from "@/repositories"

const router            = useRouter();
const route             = useRoute();
const myStorage         = window.localStorage;

const client            = inject('client');
const notify            = inject('notify');
const cookies           = useCookies(['b2b_client_token','b2b_client_id', 'b2b_client_name'])

const updateData        = inject('updateData');
const getBasket         = inject('getBasket');

const loading           = ref(false);
const loginData         = reactive({
  email    : 'kirpich@mail.ru',
 // email    : null,
 // password : null,
  password : '123123',
});
const errors            = reactive({
  email    : null,
  password : null,
});

if (myStorage.getItem('b2b_client_token') && route.name === 'login') router.push({name  : 'client'});

function isValid(){
  let valid = true;
  if (!loginData.email)    {valid = false; errors.email    = 'Необходимо указать электронную почту!'};
  if (!loginData.password) {valid = false; errors.password = 'Необходимо указать пароль!'};
  return valid;
};

async function toLogin() {
  if (!isValid()) return;

  try {
    loading.value = true;
    let result = await ClientRepo.login(loginData);

    if(result.status == 200 && result.body.authorisation && result.body.authorisation.token) {

      client.id                      = result.body.client.id;
      client.name                    = result.body.client.name;
      client.inn                     = result.body.client.inn;
      client.guid                    = result.body.client.guid;
      client.subdivision             = result.body.client.subdivision;
      client.ur_address              = result.body.client.ur_address;
      client.count_trade_points      = result.body.client.count_trade_points;
      client.revolving_credit        = result.body.client.revolving_credit;
      client.single_credit           = result.body.client.single_credit;
      client.update_date.statistic   = result.body.client.date_update_statistic ? moment(result.body.client.date_update_statistic) : moment('2023-01-01T00:00:00.000000Z');
      client.update_date.treaties    = result.body.client.date_update_treaties  ? moment(result.body.client.date_update_treaties)  : moment('2023-01-01T00:00:00.000000Z');
      client.update_date.dz          = result.body.client.date_update_dz        ? moment(result.body.client.date_update_dz)        : moment('2023-01-01T00:00:00.000000Z');
      client.update_date.retro_bonus = result.body.client.date_update_rb        ? moment(result.body.client.date_update_rb)        : moment('2023-01-01T00:00:00.000000Z');

      client.trade_points.length = 0;
      result.body.client.trade_points.forEach(el => client.trade_points.push(el));

      client.children.length = 0;
      result.body.client.children.forEach(el => client.children.push(el));

      await myStorage.removeItem('b2b_client_token');
      await myStorage.removeItem('b2b_client_id');
      await myStorage.removeItem('b2b_client_name');
      await myStorage.removeItem('b2b_discount');

      cookies.set('b2b_client_token', result.body.authorisation.token, { path: '/' });
      cookies.set('b2b_client_id',    result.body.client.id, { path: '/' });
      cookies.set('b2b_client_name',  result.body.client.name, { path: '/' });

      await myStorage.setItem('b2b_client_token', result.body.authorisation.token);
      await myStorage.setItem('b2b_client_id',    result.body.client.id);
      await myStorage.setItem('b2b_client_name',  result.body.client.name);
      await myStorage.setItem('b2b_discount', '0');

      await getBasket();
      updateData();

      if(window.b2bShowOut) window.b2bShowOut();
      await router.push({name: 'client'});

    } else {
      notify({ title: 'Ошибка авторизации', message: e.message, type: 'error', duration: 5000 });
    }

  } catch (e) {
    notify({ title: 'Ошибка авторизации', message: e.message, type: 'error', duration: 5000 });
  } finally {
    loading.value = false;
  }

};

watchEffect(() => {
  loginData.email    ? errors.email    = null : '';
  loginData.password ? errors.password = null : '';
});


</script>

<style scoped lang="scss">

.b2b{
  &-login{
    &__row{
      margin-bottom: 20px;
    }
    &__title{
      padding-bottom: 25px;
    }
    &__label{
      margin-bottom: 10px;
    }
    &__button{
      width: 50%;
    }
  }
}

</style>