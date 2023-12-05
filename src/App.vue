<template>
  <pre-loader
      class="b2b-app-container"
      :loading="loading"
  >
    <el-container>
      <el-aside width="220px">
        <navBar/>
      </el-aside>
      <el-main>
        <router-view v-if="!loading"/>
      </el-main>
    </el-container>
  </pre-loader>
</template>

<script setup>
import {ref, provide, reactive, onMounted, inject} from "vue";
import {useRouter, useRoute} from 'vue-router';
import {ElNotification} from "element-plus";
import moment from 'moment';
import {useCookies} from '@vueuse/integrations/useCookies';
moment.locale('ru');
import {ClientRepo, StatisticRepo, RetroBonusRepo, TreatiesRepo, BasketRepo} from "@/repositories";
import PreLoader from "@/components/pre_loader";
import navBar from "./components/navBar";

const notify = ({title = '', message = '', type = '', duration = 2000} = {}) => {
  ElNotification({
    title,
    message,
    type,
    duration,
    dangerouslyUseHTMLString: true,
  })
};
const echo             = inject('echo');
const cookies          = useCookies(['b2b_client_token','b2b_client_id', 'b2b_client_name']);
const router           = useRouter();
const route            = useRoute();
const loading          = ref(false);
const myStorage        = window.localStorage;
const client           = reactive({
  id                    : null,
  name                  : null,
  guid                  : null,
  subdivision           : null,
  inn                   : null,
  ur_address            : null,
  count_trade_points    : null,
  revolving_credit      : null,
  single_credit         : null,
  trade_points          : [],
  update_date           : {
    statistic   : moment('2023-01-01T00:00:00.000000Z'),
    treaties    : moment('2023-01-01T00:00:00.000000Z'),
    dz          : moment('2023-01-01T00:00:00.000000Z'),
    retro_bonus : moment('2023-01-01T00:00:00.000000Z'),
    history     : null,
  },
  waiting               : {
    statistic   : false,
    treaties    : false,
    dz          : false,
    retro_bonus : false,
  },
  update_interval       : {
    statistic   : 60,
    treaties    : 60,
    dz          : 60,
    retro_bonus : 60,
  },
  children              : [],
});
const menu             = reactive([]);
let date               = new Date;
let year               = date.getMonth() > 0 ?  date.getFullYear() : date.getFullYear() - 1;
const orderProduct     = reactive([]);
const select_company   = ref(null);
const select_treaty    = ref(null);
const company_list     = reactive([]);
const treaties_list    = reactive([]);

const updateData       = async () => {
  let diffDate = {
    statistic   : moment().diff(client.update_date.statistic, 'minutes')   >= client.update_interval.statistic   ? true : false,
    treaties    : moment().diff(client.update_date.treaties, 'minutes')    >= client.update_interval.treaties    ? true : false,
    retro_bonus : moment().diff(client.update_date.retro_bonus, 'minutes') >= client.update_interval.retro_bonus ? true : false,
  };

  if(diffDate.statistic){
    StatisticRepo.update({client_id: client.id});
    client.waiting.statistic = true;
  }

  if(diffDate.retro_bonus){
    RetroBonusRepo.update({guid: client.guid, client_id : client.id, date : year + '0101'}); // тут уходит дата год на первое января
    client.waiting.retro_bonus = true;
  } else {
    let retro_bonus = await RetroBonusRepo.get({client_id: client.id});
    if (retro_bonus.status == 200 && retro_bonus.body.data && retro_bonus.body.data.length > 0)
      menu.find(el => {return el.name === 'Ретробонусы'}).show = true;
 }

  if(diffDate.treaties){
    client.waiting.treaties = true;
    client.waiting.dz = true;
    await TreatiesRepo.update({client_id: client.id});
    TreatiesRepo.updateDZ({client_id: client.id});
  }
};

const getBasket        = async () => {
  let b2b_basket_count = document.querySelector('.b2b_basket_count');
  try {
    loading.value = true;
    let result = await BasketRepo.get({ client_id : client.id});
    if(result.status == 200 && result.body.data){
        orderProduct.length = 0;
        orderProduct.push(...result.body.data);
        if (b2b_basket_count){
            if (result.body.data.length > 0 && b2b_basket_count){
                b2b_basket_count.innerHTML = result.body.data.length;
                b2b_basket_count.removeAttribute("hidden");
            } else {
                b2b_basket_count.setAttribute("hidden", "hidden")
            }
        }
    } else {
       b2b_basket_count.setAttribute("hidden", "hidden");
       await router.push({name : 'login'})
    }
  } catch (e) {
    b2b_basket_count.setAttribute("hidden", "hidden");
    notify({ title: 'Получение товаров корзины', message: e.message, type: 'error', duration: 5000 });
  } finally {
   loading.value = false;
  }
};

const getClientData    = async () => {
  try {
    loading.value = true;
    let result = await ClientRepo.refresh();

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

    } else {
      await router.push({name : 'login'})
    }

  } catch (e) {
      notify({ title: 'Ошибка при выполнении запроса на получение данных о клиенте', message: e.message, type: 'error', duration: 5000 });

  } finally {
    loading.value = false;
  }
};

const formatNumber     = (number, credit) => {
  if (number > 0){
    if(credit) number = Number(number).toFixed(0);
    return (+number).toLocaleString('ru-RU',{ minimumFractionDigits: credit ? null : 2 }).replace(',', '.');
  }
};

if(myStorage.getItem('b2b_client_token') && !client.id) getClientData();

setTimeout(() => {
  if(route.name === 'retro_bonus') router.push({name : 'client'})
}, 0);

onMounted(() => {
  echo.channel('histories').listen('Histories',async (e) =>{
    if(e.client_id === client.id) {
      +client.update_date.history++;
      notify({title : 'Получение истории заказов', message : 'Информация по заказам обновлена.', type : 'success'});
    }
  });
  echo.channel('statistics').listen('Statistics',async (e) =>{
    if(e.client_id === client.id){
      client.update_date.statistic = moment();
      client.waiting.statistic = false;
      notify({title : 'Получение статистики заказов',message : 'Информация по статистике заказов обновлена.', type : 'success'});
    }
  });
  echo.channel('treaties').listen('TreatiesUpdate',async (e) =>{
    if(e.client_id === client.id) {
      client.update_date.treaties = moment();
      client.waiting.treaties = false;
      notify({title : 'Получение информации об условиях сотрудничества', message : 'Информация по условиям сотрудничества обновлена.', type : 'success'});
    }
  });
  echo.channel('dz').listen('DZUpdate',async (e) =>{
    if(e.client_id === client.id) {
      client.update_date.dz = moment();
      client.waiting.dz = false;
      notify({title : 'Получение информации о взаиморасчетах', message : 'Информация о взаиморасчетах обновлена.', type : 'success'});
    }
  });
  echo.channel('retro_bonuses').listen('RetroBonuses',async (e) =>{
    if(e.client_id === client.id) {
      client.update_date.retro_bonus = moment();
      client.waiting.retro_bonus = false;
      menu.find(el => {return el.name === 'Ретробонусы'}).show = true;
      notify({title : 'Получение информации о ретробонусах', message : 'Информация о ретробонусах обновлена.', type : 'success'});
    }
  });
});

provide('client', client);
provide('notify', notify);
provide('menu', menu);
provide('orderProduct', orderProduct);
provide('select_company', select_company);
provide('select_treaty', select_treaty);
provide('company_list', company_list);
provide('treaties_list', treaties_list);
provide('updateData', updateData);
provide('getBasket', getBasket);
provide('formatNumber', formatNumber);
</script>

<style>
</style>
