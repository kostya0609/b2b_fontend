<link rel="stylesheet" href="../../../../dist/css/app.860e65d2.css">
<template>
  <div v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
       class="route_page_container"
  >
    <h1 class="main-h1">Оформление заказа {{company_pdz ? ' не возможно' : ''}}</h1>
    <h4
        v-if="!select_treaty"
        class="main-h4"
    >
      Чтобы сформировать заказ обязательно выберите организацию и договор.
    </h4>
    <div style="display: flex; justify-content: space-between; margin-bottom: 25px">
      <span style="width: 48%">
        <el-select
            v-model="select_company"
            :class="['add-edit-element']"
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
      </span>
      <span style="width: 48%">
        <el-select
            v-model="select_treaty"
            :class="['add-edit-element']"
            style="width: 48%"
            placeholder="Выберете договор"
            :disabled="apply_discount"
        >
          <el-option
              v-for="item in treaties_list"
              :class="{'red_bold' : item.pdz}"
              :key="item.guid"
              :label="item.label"
              :value="item.guid"
          >
          </el-option>
        </el-select>
      </span>
    </div>

    <div v-if="!company_pdz">
      <div
        v-if="select_treaty"
      >
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px"
        >
          <span style="width: 29%">
            <el-select
                v-model="search.column"
                :class="['add-edit-element']"
                placeholder="Искать по"
                @change="search.q=null"
            >
          <el-option
              v-for="item in [{value : 'name', label : 'Искать по наименованию'},{value : 'article', label : ' Искать по артикулу'}]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>

        </el-select>
          </span>
          <span style="width: 59%">
            <el-input
                v-model="search.q"
                :class="['add-edit-element']"
                v-on:keyup.enter="getProduct"
                placeholder="Поиск"
            >
        </el-input>
          </span>
          <span style="width: 9%">
            <el-button
                type="primary"
                @click="getProduct"
                :class="['add_order_button', 'add-edit-element']"
            >
          Найти
        </el-button>
          </span>
        </div>
        <el-breadcrumb
            :separator-icon="ArrowRight"
            style="display: inline-flex; min-height: 40px; background: #f9f9f9; width: 100%; margin-bottom: 5px"
        >
          <el-breadcrumb-item
              v-for="(item, idx) in breadcrumbData"
              :key="item.guid"
              :to="{}"
              @click="breadcrumbClick(item.guid, idx)"
              style="margin-left: 10px"
          >
            {{item.name}}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div
            style="display: flex; flex-wrap: wrap; justify-content: space-between "
        >
          <el-button
              v-for="item in sections"
              :key="item.guid"
              style="
              width: 48%;
              margin: 10px auto;
              min-height: 40px;
              text-transform: uppercase;
              overflow: hidden;
              white-space: normal;
              margin: 10px 0;
            "
              @click="clickSection(item.guid, item.parent_guid, item.name)"
          >
            {{item.name}}
          </el-button>
        </div>

        <el-tabs v-model="activeTab" type="border-card" style="margin-bottom: 15px">
          <el-tab-pane label="Каталог" name="product">
            <product_table
                :productData="productData"
                :apply_discount="apply_discount"
                @addProduct="addProduct"
                @sortChange="sortChange"
                @getInfoProduct="getInfoProduct"
                :defaultSort="sort"
                style="width: 100%; margin-top: 5px"
            />
            <el-pagination
                v-if="productData.length > 0"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                style="width: 100%; margin-top: 10px;"
            />
          </el-tab-pane>
          <el-tab-pane name="order">
            <template #label>
              <span style="position: relative">Заказ<span v-if="order_total_amount" class="badgeItem"> {{order_total_amount > 99 ? '+99' : order_total_amount}}</span></span>
            </template>
            <h2 class="main-h2" style="width: 100%; margin-top: 40px; margin-bottom: 20px; padding: 0" >Ваш заказ {{current_treaty.type === 'Кредитный' ? ('(доступный лимит по заказу: ' + formatNumber(current_treaty_limit) +' руб.)') : ''}}</h2>
            <p
                v-if="select_treaty"
                style="margin-bottom: 15px"
            >
              Выбран договор № {{current_treaty.number}} с
              {{current_treaty.company}},
              тип договора - {{current_treaty.type}},
              срок действия с {{current_treaty.date_start}} по {{current_treaty.date_final}}
              {{current_treaty.type === 'Кредитный' ? ', сумма кредита - ' + current_treaty.sum_credit + ' руб., ДЗ - ' + (current_treaty.dz ? current_treaty.dz : '0 руб.')  + ', ПДЗ - ' + (current_treaty.pdz ? current_treaty.pdz : '0 руб.') : ''}}.
            </p>
            <order_table
                v-model:orderProduct="orderProduct"
                :apply_discount="apply_discount"
                :productData="productData"
                @deleteProduct="deleteProduct"
                @getInfoProduct="getInfoProduct"
                style="width: 100%; margin-bottom: 15px"
            />
            <p
                v-if="orderProduct.length>0 && !apply_discount"
                style="margin-bottom: 15px"
            >
              Выбрано: количество наименований <span class="orange_bold">{{orderProduct.length}}</span>, единиц товара <span class="orange_bold">{{order_total_amount}}</span>, стоимость заказа <span class="orange_bold">{{formatNumber(order_total_price.toFixed(2))}} руб.</span>
            </p>
            <p
                v-if="orderProduct.length>0 && apply_discount"
                style="margin-bottom: 15px"
            >
              Выбрано: количество наименований <span class="orange_bold">{{orderProduct.length}}</span>, единиц товара <span class="orange_bold">{{order_total_amount}}</span>, стоимость заказа со скидкой <span class="orange_bold">{{formatNumber(order_discount_total_price.toFixed(2))}} руб.</span>
            </p>
            <p
                v-if="orderProduct.length>0 && apply_discount"
                style="margin-bottom: 15px"
            >
              Ваша скидка составила <span class="orange_bold">{{formatNumber((+order_total_price - order_discount_total_price).toFixed(2))}} руб.</span>
            </p>

            <p
                v-if="current_treaty.type === 'Кредитный'"
                :class="[{'orange_bold' : current_treaty_limit < order_total_price }, {'red_bold' : out_of_limit}]"
                style="margin-bottom: 15px"
            >
              Доступный остаток по Вашему кредитному договору составляет <span class="orange_bold">{{formatNumber(current_treaty_limit)}} руб.</span>, сумма текущего заказа {{apply_discount ? 'со скидкой' : ''}} составляет <span class="orange_bold">{{formatNumber(order_total_price.toFixed(2))}} руб.</span>
            </p>
            <div style="display: flex; justify-content: space-between; flex-direction:row-reverse">
              <el-button
                  v-if="select_treaty && orderProduct.length>0"
                  type="primary"
                  :class="['add_order_footer_button', {'add_order_footer_button_disable' : out_of_limit}]"
                  @click="apply_discount ? openModal.sendOrder = true : sendOrder()"
                  :disabled="out_of_limit"
              >
                {{apply_discount ? 'Оформить заказ' : 'Рассчитать скидку'}}
              </el-button>
              <el-button
                  v-if="apply_discount"
                  type="primary"
                  class="add_order_footer_button"
                  @click="changeOrder"
              >
                Изменить заказ
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div v-if="company_pdz">
      <h1 class="main-h2" style="color: red"> Имеется просроченная дебиторская задолженность в размере {{formatNumber(company_pdz)}} руб.</h1>
    </div>
    <el-dialog
        title="Выбор места доставки"
        v-model="openModal.sendOrder"
        width="470px"
        :show-close="false"
        :close-on-click-modal="false"
    >
      <div style="margin-bottom: 15px">
        <el-select
            v-model="selectTradePoint"
            :class="['add-edit-element']"
            placeholder="Выберите адрес доставки"

        >
          <el-option
              v-for="item in client.trade_points"
              :key="item.guid"
              :label="item.name + ', ' + item.address "
              :value="item.guid"
          >
          </el-option>
        </el-select>
      </div>
      <div style="margin-bottom: 15px">
        <el-input
            v-model="orderComment"
            :class="['add-edit-element']"
            type="textarea"
            :rows="5"
            placeholder="Комментарий к заказу"
        >
        </el-input>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <el-button
            style="width: 48%"
            :class="['add-edit-element']"
            @click="openModal.sendOrder = false"
        >
          Отмена
        </el-button>
        <el-button
            type="primary"
            :class="['add_order_button', 'add-edit-element']"
            style="width: 48%"
            @click="sendOrder"
            :disabled="!selectTradePoint"
        >
          Отправить
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {ref, inject, reactive, watchEffect, watch, computed, provide} from "vue";
import { ArrowRight } from '@element-plus/icons-vue'
import product_table from "./components/product_table";
import order_table from "./components/order_table";
import  {ElMessageBox }  from 'element-plus';
import { useRouter} from 'vue-router';

export default {
  name: "order_add_page",
  components : {product_table, order_table},
  setup(){
    const loadJson             = inject('loadJson');
    const loadJson_kraton      = inject('loadJson_kraton');
    const svg                  = inject('svg');
    const notify               = inject('notify');
    const client               = inject('client');
    const formatNumber         = inject('formatNumber');
    const orderProduct         = inject('orderProduct');
    const select_company       = inject('select_company')
    const select_treaty        = inject('select_treaty');
    const company_list         = inject('company_list');
    const treaties_list        = inject('treaties_list');

    const router               = useRouter();
    const loading              = ref(false);
    const upper_parent_guid    = '0cac16de-22ab-4049-a34b-9d15ba8d3815';

    const activeTab            = ref('product');

    const current_treaty       = reactive({});
    const company_pdz          = ref(null);
    const current_treaty_limit = ref(null);
    const apply_discount       = ref(false);

    const breadcrumbData       = reactive([
      {guid : upper_parent_guid,  parent_guid : null, name : 'Каталог'},
    ]);
    const catalogData          = reactive([]);
    const sections             = reactive([]);
    const productData          = reactive([]);

    const section_guid         = ref(null);
    const search               = reactive({
      column : 'name',
      q      : null,
    });

    const openModal           = reactive({
      sendOrder : false,
    });
    const selectTradePoint    = ref(null);
    const orderComment        = ref(null);

    const currentPage          = ref(1);
    const pageSize             = ref(10);
    const total                = ref(1000);
    const sort                 = reactive({name : 'id', order : 'asc' });

    const order_total_price          = computed(() => {
      let sum = 0;
      orderProduct.forEach(el => {sum += +el.total_price;})
      return sum;
    });
    const order_total_amount         = computed(() => {
      let sum = 0;
      orderProduct.forEach(el => {sum += +el.amount;})
      return sum;
    });
    const order_discount_total_price = computed(() => {
      let sum = 0;
      orderProduct.forEach(el => {sum += +el.discount_total_price;})
      return sum;
    });
    const out_of_limit               = computed(() => {
      let out_of_limit = false;
      if(current_treaty.type === 'Кредитный'){
        out_of_limit = (current_treaty_limit.value - order_discount_total_price.value) >=0 ? false : true;
      }
      return out_of_limit;
    });

    const handleSizeChange     = (val) => {
      pageSize.value = val;
      getProduct();
    };
    const handleCurrentChange  = (val) => {
      currentPage.value = val;
      getProduct();
    };

    function breadcrumbClick(guid, idx){
      breadcrumbData.splice(idx+1);
      findSections(guid);
      section_guid.value = guid;
      currentPage.value = 1;
      pageSize.value = 10;
      activeTab.value = 'product';
      clearSearch();
      getProduct();
    };

    function findSections(parent_guid){
      sections.length = 0;
      catalogData.filter(el => el.parent_guid === parent_guid).forEach(item => sections.push(item));
    };

    function clickSection(guid, parent_guid, name){
      breadcrumbData.push({guid, parent_guid, name});
      findSections(guid);
      section_guid.value = guid;
      currentPage.value = 1;
      pageSize.value = 10;
      activeTab.value = 'product';
      clearSearch();
      getProduct();
    };

    function clearSearch(){
      search.column = 'name';
      search.q      = null;
    };

    async function getInfoProduct(guid){
      loading.value = true;
      let result = await loadJson_kraton('/local/rest/link_product/', {
        product_guid : guid,
      });
      loading.value = false;
      if (result.link){
        let link      = document.createElement('a');
        link.href     = 'https://kraton.ru' + result.link
        link.target   = '_blank';
        link.click();
      }
    };

    function addProduct(product_row){
      let product = orderProduct.find( el => {return el.id === product_row.id});

      if (product){
        product.amount++;
        product.total_price += +product_row.price;

        product_row.amount += 1;

      }else{
        product_row.amount = 1;
        let new_product = {
          id                   : product_row.id,
          amount               : product_row.amount,
          article              : product_row.article,
          count                : product_row.count,
          guid                 : product_row.guid,
          name                 : product_row.name,
          price                : +product_row.price,
          discount_price       : 0,
          discount_total_price : 0,
          total_price          : +product_row.price,
        }
        orderProduct.push(new_product);
        notify('Добавление товара', `Товар ${product_row.name} добавлен в заказ`, 'success');
      }
    };

    function deleteProduct(idx, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить из заказа товар - ${row.name} ?`)
          .then( () => {
              orderProduct.splice(idx, 1);
              let product_row = productData.find(el => {return el.guid === row.guid});
              product_row ? product_row.amount = 0 : '';
          })
          .catch(() => {
            row.amount = 1;
            row.total_price = row.price;
          })
    };

    function sortChange(sortData){
      let order = 'asc';
      let name = 'id'
      sortData.order === 'ascending' ? order = 'asc' : ''
      sortData.order === 'descending' ? order = 'desc' : ''
      sortData.prop ? name = sortData.prop : '';
      sort.name  = name; sort.order = order;
      getProduct();
    }

    async function getProduct(){
        loading.value = true;
        productData.length = 0;
        let result = await loadJson('/b2b/catalog/get-product', {
          client_id        : client.id,
          client_guid      : client.guid,
          subdivision_guid : client.subdivision,
          section_guid     : section_guid.value,
          search           : {...search},
          count            : pageSize.value,
          page             : currentPage.value,
          sort,
        });
        loading.value = false;

        if (result.status === 'success' && result.data){
          total.value = result.total;
          clearSearch();
          result.data.forEach(el => {
            // это сделано чтоб синхронизировать amount из заказа с тем что прийдет в продуктах
            let product = orderProduct.find(item => {return el.guid === item.guid});
            product ? el.amount = +product.amount : el.amount = 0;
            //
            el.discount_price = 0;
            el.discount_total_price = 0;
            el.discount_value = 0;
            productData.push(el)
          });
        } else notify('Проблема с получением данных о товарах', 'Возникла ошибка с получением данных с сервера.', 'error');

    }

    async function getData(){
      loading.value = true;
      let result = await loadJson('/b2b/client/get', { client_id : client.id, client_guid : client.guid,});
      if (result.status === 'success' && result.data) {

        if(company_list.length == 0 ){
          result.data.forEach(company => {
            company_pdz.value = +company_pdz.value + +company.pdz
            company_list.push({
              id       : company.id,
              guid     : company.guid,
              name     : company.name,
              treaties : company.treaties,
            })
          })
        } else result.data.forEach(company => company_pdz.value = +company_pdz.value + +company.pdz)
      }

      result = await loadJson('/b2b/catalog/get', {
        client_id        : client.id,
        client_guid      : client.guid,
        subdivision_guid : client.subdivision,
      });
      if (result.status === 'success' && result.data) {
        catalogData.length = 0;
        result.data.forEach(el => catalogData.push(el));

        section_guid.value = upper_parent_guid;

        findSections(section_guid.value);

        await getProduct();

      } else notify('Проблема с получением данных каталога', 'Возникла ошибка с получением данных с сервера.', 'error');


      loading.value = false;
    }

    function sendOrder(){
      ElMessageBox.confirm(apply_discount.value ? `Отправить ваш заказ для оформления?` : `Отправить ваш заказ для рассчета скидки ?`)
          .then( async () => {
            let url = apply_discount.value ? '/b2b/order/add' : '/b2b/order/discount';
            apply_discount.value ? openModal.sendOrder = false : '';

            loading.value = true;
            let sendGoods = [];
            await orderProduct.forEach(el => {
              sendGoods.push({
                product_guid : el.guid,
                count        : el.amount,
                price        : apply_discount.value ? el.discount_price       : el.price,
                sum          : apply_discount.value ? el.discount_total_price : el.total_price,
              })
            })

            let client_guid = company_list.find(el => {return el.id === select_company.value}).guid;

            let result = await loadJson(url, {
              client_guid      : client_guid,
              client_id        : select_company.value,
              treaty_guid      : select_treaty.value,
              subdivision_guid : client.subdivision,
              goods            : sendGoods,
              trade_point      : apply_discount.value ? selectTradePoint.value : null,
              comment          : apply_discount.value ? orderComment.value : null,
            });
            loading.value = false;

            if (apply_discount.value){
              if (result.status === 'success'){
                notify('Оформление заказа', 'Ваш заказ успешно отправлен на оформление.', result.status);
                orderProduct.length = 0;
                router.push({name : 'order_history'})

              } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных об оформлении заказа с сервера.', 'error');

            }else{

              if (result.status === 'success' && result.data && result.data.result){
                result.data.result.forEach(goods => {
                  let product = orderProduct.find(product => {return goods.product_guid === product.guid});
                  product.discount_price = goods.price_after;
                  product.discount_value = goods.discount_value;
                  product.discount_total_price = goods.sum_after;
                })
                apply_discount.value = true;
              } else notify('Проблема с получением данных', 'Возникла ошибка с получением данных о скидках с сервера.', 'error');

            }
          })
          .catch(() => {
          })
    };

    function changeOrder(){
      ElMessageBox.confirm(`Вы уверены, что хотите изменить заказ? Информация о скидках будет удалена. После изменения заказа необходимо будет расчитать скидку.`)
          .then( () => {
            apply_discount.value = false;
            orderProduct.forEach(el => {
              el.discount_price = 0;
              el.discount_total_price = 0;
            })
          })
          .catch(() => {
          })
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
          }
        }
    )

    watchEffect(() => {
      client.id ? getData() : '';
    });

    return{
      svg, loading, ArrowRight, breadcrumbData, catalogData, sections, productData, currentPage, pageSize, total,
      orderProduct, sort, select_company, select_treaty, company_list, treaties_list, current_treaty, company_pdz,
      current_treaty_limit, order_total_price, order_discount_total_price, order_total_amount, apply_discount,
      out_of_limit, search, activeTab, openModal, client, selectTradePoint, orderComment,

      breadcrumbClick, clickSection, handleSizeChange, handleCurrentChange, addProduct, sortChange, deleteProduct,
      sendOrder, changeOrder, getProduct, getInfoProduct, formatNumber
    }
  },
}
</script>

<style scoped>

</style>