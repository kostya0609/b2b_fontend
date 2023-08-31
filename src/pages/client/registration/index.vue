<template>
  <div v-loading="loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
       class="route_page_container"
  >
    <h1 class="main-h1">Добавление пользователя</h1>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          E-MAIL
        </label>
        <el-input
          v-model="newUser.email"
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
            v-model="newUser.password"
            type="password"
            :class="['add-edit-element', {'invalid' : errors.password}]"
            placeholder="Пароль"
        >
        </el-input>
        <small v-if="errors.password">{{errors.password}}</small>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          Наименование организации
        </label>
        <el-input
            v-model="newUser.name"
            :class="['add-edit-element', {'invalid' : errors.name}]"
            placeholder="Наименование"
        >
        </el-input>
        <small v-if="errors.name">{{errors.name}}</small>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          ИНН организации
        </label>
        <el-input
            v-model="newUser.inn"
            :class="['add-edit-element', {'invalid' : errors.inn}]"
            placeholder="ИНН"
        >
        </el-input>
        <small v-if="errors.inn">{{errors.inn}}</small>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 20px">
      <el-col :span="12">
        <label class="add-edit-label">
          КПП организации
        </label>
        <el-input
            v-model="newUser.kpp"
            :class="['add-edit-element']"
            placeholder="КПП"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" align="right">
        <el-button
            type="primary"
            @click="saveUser"
            style="width: 50%; background: #EF7C00; border-color: #EF7C00; color: white"
        >
          Добавить аккаунт
        </el-button>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import {ref, reactive, inject, watchEffect} from "vue";
export default {
  name: "client_registration_page",
  setup(){
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
      loading.value = true;
      let result = await loadJson('/b2b/client/register', {...newUser});
      if (result.status === 'success') {
        newUser.email    = '';
        newUser.password = '';
        newUser.inn      = '';
        newUser.kpp      = '';
        newUser.name     = '';
      };
      notify('Добавление пользователя', result.message, result.status);
      loading.value = false;
    };

    watchEffect(() => {
      newUser.email    ? errors.email    = null : '';
      newUser.password ? errors.password = null : '';
      newUser.inn      ? errors.inn      = null : '';
      newUser.name     ? errors.name     = null : '';
    });

    return{
      newUser, errors, loading, svg,
      saveUser
    }
  }
}
</script>

<style scoped>

</style>