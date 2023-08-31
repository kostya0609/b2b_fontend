<template>
  <div
      v-loading="loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="app_container"
  >
    <el-container>
      <el-aside width="220px">
        <navBar/>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import navBar from "./components/navBar";
import { useRouter, useRoute } from 'vue-router';
import {ref, provide, reactive, onMounted, inject} from "vue";
import  {ElNotification}  from 'element-plus'
import moment from 'moment';
moment.locale('ru');
export default {
  name: 'App',
  components: {navBar},
  setup() {
    const echo      = inject('echo');

    const router           = useRouter();
    const route            = useRoute();
    const svg              = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
    const loading          = ref(false);
    const domain           = ref( 'https://api.kraton.ru');
    const notify           = (title, message, type) => {
      ElNotification({
        title: title,
        message: message,
        type: type,
        duration: 4000,
      })
    };
    const myStorage        = window.localStorage;
    const client           = reactive({
      id                    : null,
      token                 : null,
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

    let date                = new Date;
    let year                = date.getMonth() > 0 ?  date.getFullYear() : date.getFullYear() - 1;

    const orderProduct     = reactive([]);
    const select_company   = ref(null);
    const select_treaty    = ref(null);
    const company_list     = reactive([]);
    const treaties_list    = reactive([]);

    if(!client.token && myStorage.getItem('b2b_client_token')) client.token = myStorage.getItem('b2b_client_token');

    if(client.token && !client.id) getClientData();

    setTimeout(() => {
      if(route.name === 'retro_bonus') router.push({name : 'client'})
    }, 0)

    async function getClientData(){
      loading.value = true;
      let result = await loadJson('/b2b/client/refresh', {})
      loading.value = false;
      if (result.status === 'success' && result.authorisation && result.authorisation.token) {
          client.id                    = result.client.id;
          client.token                 = result.authorisation.token;
          client.name                  = result.client.name;
          client.inn                   = result.client.inn;
          client.guid                  = result.client.guid;
          client.subdivision           = result.client.subdivision;
          client.ur_address            = result.client.ur_address;
          client.count_trade_points    = result.client.count_trade_points;
          client.revolving_credit      = result.client.revolving_credit;
          client.single_credit         = result.client.single_credit;

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

        }else{
          notify('Ошибка авторизации', result.message, 'error');
          router.push({name : 'login'});
        }
    }

    async function updateData(){
      let diffDate = {
        statistic   : moment().diff(client.update_date.statistic, 'minutes')   >= client.update_interval.statistic   ? true : false,
        treaties    : moment().diff(client.update_date.treaties, 'minutes')    >= client.update_interval.treaties    ? true : false,
        retro_bonus : moment().diff(client.update_date.retro_bonus, 'minutes') >= client.update_interval.retro_bonus ? true : false,
      };

      if(diffDate.statistic){
        loadJson('/b2b/statistic/update', {client_id: client.id});
        client.waiting.statistic = true;
      }

      if(diffDate.retro_bonus){
        loadJson('/b2b/retro-bonus/update', {guid: client.guid, client_id : client.id, date : year + '0101'});
        client.waiting.retro_bonus = true;
      }else{
        let retro_bonus = await loadJson('/b2b/retro-bonus/get', {client_id: client.id});
        if (retro_bonus.status === 'success' && retro_bonus.data && retro_bonus.data.length > 0)
            menu.find(el => {return el.name === 'Ретробонусы'}).show = true;
      }

      if(diffDate.treaties){
        client.waiting.treaties = true;
        client.waiting.dz = true;
        let treaties = await loadJson('/b2b/treaties/update', {client_id: client.id});
        loadJson('/b2b/treaties/update-dz', {client_id: client.id});
      }
    };

    onMounted(() => {
      echo.channel('histories').listen('Histories',async (e) =>{
        if(e.client_id === client.id) {
          +client.update_date.history++;
          notify('Получение истории заказов', 'Информация по заказам обновлена.', 'success');
        }
      });

      echo.channel('statistics').listen('Statistics',async (e) =>{
        if(e.client_id === client.id){
          client.update_date.statistic = moment();
          client.waiting.statistic = false;
          notify('Получение статистики заказов','Информация по статистике заказов обновлена.','success');
        }
      });

      echo.channel('treaties').listen('TreatiesUpdate',async (e) =>{
        if(e.client_id === client.id) {
          client.update_date.treaties = moment();
          client.waiting.treaties = false;
          notify('Получение информации об условиях сотрудничества', 'Информация по условиям сотрудничества обновлена.', 'success');
        }
      });

      echo.channel('dz').listen('DZUpdate',async (e) =>{
        if(e.client_id === client.id) {
          client.update_date.dz = moment();
          client.waiting.dz = false;
          notify('Получение информации о взаиморасчетах', 'Информация о взаиморасчетах обновлена.', 'success');
        }
      });

      echo.channel('retro_bonuses').listen('RetroBonuses',async (e) =>{
        if(e.client_id === client.id) {
          client.update_date.retro_bonus = moment();
          client.waiting.retro_bonus = false;
          menu.find(el => {return el.name === 'Ретробонусы'}).show = true;
          notify('Получение информации о ретробонусах', 'Информация о ретробонусах обновлена.', 'success');
        }
      });

    })

    function loadJson(url , data, type, downloadRequest){
      let body   = {};
      let header = {
        'Authorization': `Bearer ${client.token}`
      };

      if(type === 'file'){
        body = data;
      }else{
        body = {...data};
        header['Content-Type'] = 'application/json;charset=utf-8';
      }

      return fetch(
          domain.value + url,
          {
            method: 'post',
            headers: header,
            body: type === 'file' ? body : JSON.stringify(body, function(key, val) {
              return (typeof val === 'function') ? ''+ val : val;
            })
          }
      ).then(res => {
        if(res.status == 401){
          client.token = null;
          myStorage.removeItem('b2b_client_token');
          router.push({name : 'login'})
        }

        if (downloadRequest)
          return res
        else
          return res.json()

      }).catch(err => {
        return {status : 'error',message : 'Некорректный ответ сервера',system : err.message}
      });
    };
    function loadJson_kraton(url , data){
      let header   = {};
        header['Content-Type'] = 'application/json;charset=utf-8';
        header['HTTP_HASH'] = 'f6ffc64fa51d4bfa9952f27983733f37';

      return fetch(
          'https://kraton.ru' + url,
          {
            method: 'post',
            headers: header,
            body: JSON.stringify({...data})
          }
      ).then(res => {
        return res.json()

      }).catch(err => {
        return {status : 'error',message : 'Некорректный ответ сервера',system : err.message}
      });
    };

    function formatNumber(number, credit){
      if (number > 0){
        if(credit) number = Number(number).toFixed(0);
        return (+number).toLocaleString('ru-RU',{ minimumFractionDigits: credit ? null : 2 }).replace(',', '.');
      }
    }

    provide('domain', domain);
    provide('loadJson', loadJson);
    provide('loadJson_kraton', loadJson_kraton)
    provide('svg', svg);
    provide('client', client);
    provide('domain', domain);
    provide('notify', notify);
    provide('formatNumber', formatNumber);

    provide('menu', menu);

    provide('orderProduct', orderProduct);
    provide('select_company', select_company);
    provide('select_treaty', select_treaty);
    provide('company_list', company_list);
    provide('treaties_list', treaties_list);

    provide('updateData', updateData);

    return{
      svg, loading
    }
  }
}

</script>

<style>
/* ниже стили общие на все приложение*/
#workarea {
  overflow-x: hidden!important;
}
#workarea-content {
  overflow: unset !important;
}
.workarea-content-paddings{
  overflow-x: unset !important;
}
.app_container{}

* {
  margin: 0;
  padding: 0;
  box-sizing: content-box;
}

#app ::selection {
  background: #cfcfcf;
}

/*Общий класс - если не все поля на форме заполнены*/
small {
  color: #ff2400;
}

.invalid {
  border:solid 1px !important;
  border-color: #ff2400 !important;
}

.gray {
  background-color: #f5f7fa!important;
}
.red_bold{
  color: red!important;
  font-weight: bold;
}
.orange_bold{
  color: #EF7C00;
  font-weight: bold;
}
.green_bold{
  color: #1BC400FF;
  font-weight: bold;
}

.row_has_children{
  border: #443e3e 2px solid;
  color: blue;
}

.el-table .cell{
  word-break: break-word!important;
  padding: 0 6px;
}

.route_page_container{
}

/*Добавление аккаунта*/
.add-edit-label{
  font-weight: 500;
}
.add-edit-element{
  margin-top: 10px !important;
  width: 100% !important;
}

.main-h1{
  color: #EF7C00;
  /*color: #383838;*/
  font-size: 36px;
  font-weight: 500;
  line-height: 38px;
  padding-bottom: 25px;
  padding-right: 55px;
}

.main-h2{
  color: #383838;
  font-size: 25px;
  font-weight: 500;
  line-height: 28.73px;
  padding-top: 25px;
  padding-bottom: 12px;
  padding-right: 55px;
}

.main-h4{
  color: #383838;
  font-size: 20px;
  font-weight: 500;
  line-height: 28.73px;
  padding-top: 25px;
  padding-bottom: 12px;
  padding-right: 55px;
}

/*Данные организации*/
.client-info-div{
  margin-bottom: 15px;
}
.client-info-p{
  display: inline;
  color: #383838;
  font-size: 15px;
  font-weight: 500;
}
.client-info-p{
  color: #555555;
}
.back_feel{
  color: #EF7C00;
  text-decoration: #EF7C00 underline 1px;
}

.add_order_button{
  background: #EF7C00!important;
  border-color: #EF7C00!important;
  color: white!important;
}
.add_order_button_disabled{
  background: #a7a0a0!important;
  border-color: #a7a0a0!important;
}
.add_order_footer_button{
  width: 24%;
  height: 40px;
  margin: 0!important;
  background: #EF7C00!important;
  border-color: #EF7C00!important;
  color: white!important;
}
.add_order_footer_button_disable{
  background: #a7a0a0!important;
  border-color: #a7a0a0!important;
}
.underline_price{
  text-decoration: line-through #EF7C00 2px;
}
.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
  color: #EF7C00!important;
}
.el-tabs--border-card>.el-tabs__header .el-tabs__item:not(.is-disabled):hover {
  color: #EF7C00!important;
}

.el-scrollbar__bar.is-vertical>div{
  background-color: #ff8400!important;
}
.el-scrollbar__bar.is-horizontal>div{
  background-color: #ff8400!important;
}

.badgeItem {
  position: absolute;
  top: -10px;
  right: -30px;
  padding: 0 5px;
  /*z-index: 200;*/
  color: white;
  background: #EF7C00;
  border-radius: 20px;
}
.product_name_span:hover{
  color: #EF7C00;
  text-decoration: underline;
  cursor: pointer;
}
button.el-button.el-button--primary{
  background-color: #EF7C00!important;
  border-color: #EF7C00!important;
}
button.el-button.el-button--primary:hover{
  color: white!important;
  border-color: #EF7C00!important;
  background-color:#EF7C00!important;
}
button.el-button:hover{
  color: #EF7C00!important;
  background-color:white!important;
  border-color: #EF7C00!important;
}

.el-dialog__body{
  padding: 0 10px 10px 10px !important;
}
.el-select-dropdown__item.selected{
  color: #EF7C00!important;
}
.route_page_container .el-select .el-input.is-focus .el-input__wrapper{
  box-shadow: 0 0 0 1px #EF7C00 inset !important;
}
.route_page_container .el-select .el-input__wrapper.is-focus{
  box-shadow: 0 0 0 1px #EF7C00 inset !important;
}
.route_page_container .el-input__wrapper.is-focus{
  box-shadow: 0 0 0 1px #EF7C00 inset !important;
}
.route_page_container .el-textarea__inner:focus{
  box-shadow: 0 0 0 1px #EF7C00 inset !important;
}

.el-pager li.is-active{
  color: #EF7C00!important;
}
.el-pager li:hover{
  color: #EF7C00!important;
}

</style>
