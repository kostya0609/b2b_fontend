<template>
  <pre-loader
      class="b2b-registration"
      :loading="loading"
  >
    <h1 class="b2b-registration__title b2b-title b2b-title_h1"> Добавление пользователя </h1>
    <el-row class="b2b-row b2b-registration__row">
      <el-col :md="12">
        <label class="b2b-registration__label b2b-label"> E-MAIL </label>
        <el-input
          v-model="newUser.email"
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
    <el-row class="b2b-row b2b-registration__row">
      <el-col :md="12">
        <label class="b2b-registration__label b2b-label"> Пароль </label>
        <el-input
            v-model="newUser.password"
            type="password"
            :class="{'b2b-invalid' : errors.password}"
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
    <el-row class="b2b-row b2b-registration__row">
      <el-col :md="12">
        <label class="b2b-registration__label b2b-label"> Наименование организации </label>
        <el-input
            v-model="newUser.name"
            :class="{'b2b-invalid' : errors.name}"
            placeholder="Наименование"
        >
        </el-input>
        <small
            v-if="errors.name"
            class="b2b-small"
        >
          {{errors.name}}
        </small>
      </el-col>
    </el-row>
    <el-row class="b2b-row b2b-registration__row">
      <el-col :md="12">
        <label class="b2b-registration__label b2b-label"> ИНН организации </label>
        <el-input
            v-model="newUser.inn"
            :class="{'b2b-invalid' : errors.inn}"
            placeholder="ИНН"
        >
        </el-input>
        <small
            v-if="errors.inn"
            class="b2b-small"
        >
          {{errors.inn}}
        </small>
      </el-col>
    </el-row>
    <el-row class="b2b-row b2b-registration__row">
      <el-col :md="12">
        <label class="b2b-registration__label b2b-label"> КПП организации </label>
        <el-input
            v-model="newUser.kpp"
            placeholder="КПП"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row class="b2b-row">
      <el-col :md="12">
        <el-button
            type="primary"
            @click="saveUser"
            class="b2b-registration__button"
        >
          Добавить аккаунт
        </el-button>
      </el-col>
    </el-row>

  </pre-loader>
</template>

<script setup>
import {ref, reactive, inject, watchEffect} from "vue";
import PreLoader from "@/components/pre_loader";
import {ClientRepo} from "@/repositories"

const loadJson       = inject('loadJson');
const svg            = inject('svg');
const notify         = inject('notify');

const loading        = ref(false);

const newUser = reactive({
  email    : '',
  password : '',
  inn      : '',
  kpp      : '',
  name     : '',
})
const errors  = reactive({
  email    : null,
  password : null,
  inn      : null,
  name     : null,
})

function isValid(){
  let valid = true;
  if (!newUser.email)                                   {valid = false; errors.email    = 'Необходимо указать электронную почту!'};
  if (!newUser.password || newUser.password.length < 6) {valid = false; errors.password = 'Необходимо указать пароль не менее 6 символов!'};
  if (!newUser.inn)                                     {valid = false; errors.inn      = 'Необходимо указать ИНН организации!'};
  if (!newUser.name)                                    {valid = false; errors.name     = 'Необходимо указать Наименование организации!'};
  return valid;
};

async function saveUser(){
  if(!isValid()) return;
  try {
    loading.value = true;
    let result = await ClientRepo.register(newUser);

    if(result.status == 200 ) {
      newUser.email    = '';
      newUser.password = '';
      newUser.inn      = '';
      newUser.kpp      = '';
      newUser.name     = '';
    }
    notify({ title: 'Добавление пользователя', message: '', type: 'success'});
  } catch (e) {
    notify({ title: 'Ошибка добавление пользователя', message: e.message, type: 'error', duration: 5000 });
  } finally {
    loading.value = false;
  }
};

watchEffect(() => {
  newUser.email    ? errors.email    = null : '';
  newUser.password ? errors.password = null : '';
  newUser.inn      ? errors.inn      = null : '';
  newUser.name     ? errors.name     = null : '';
});


</script>

<style scoped lang="scss">

.b2b{
  &-registration{
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