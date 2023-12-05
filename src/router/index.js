import { createRouter, createWebHistory } from 'vue-router'
import Client        from '@/pages/client'
import Registration  from '@/pages/client/registration'
import Login         from '@/pages/client/login'
import Statistic     from '@/pages/statistic'
import Retro_bonus   from '@/pages/retro_bonus'
import Conditions    from '@/pages/conditions'
import Treaties      from '@/pages/treaties'
import Order_add     from '@/pages/order/add'
import Order_history from '@/pages/order/history'

const routes = [
  {
    path: '/b2b/',
    children: [
      {
        path: 'client',
        name: 'client',
        component: Client,
        meta : {name : 'Данные организации', order : 1, onlyAdmin : false, auth : true, show : true},
      },
      {
        path: 'client/registration',
        name: 'registration',
        component: Registration,
        meta : {name : 'Добавление аккаунта', order : 8, onlyAdmin : true, auth : false, show : true},
      },
      {
        path: 'client/login',
        name: 'login',
        component: Login,
      },
      {
        path: 'statistic',
        name: 'statistic',
        component: Statistic,
        meta : {name : 'Статистика заказов', order : 2, onlyAdmin : false, auth : true, show : true},
      },
      {
        path: 'retro_bonus',
        name: 'retro_bonus',
        component: Retro_bonus,
        meta : {name : 'Ретробонусы', order : 7, onlyAdmin : false, auth : true, show : false},
      },
      {
        path: 'conditions',
        name: 'conditions',
        component: Conditions,
        meta : {name : 'Условия сотрудничества', order : 4, onlyAdmin : false, auth : true, show : true},
      },
      {
        path: 'treaties',
        name: 'treaties',
        component: Treaties,
        meta : {name : 'Взаиморасчеты', order : 3, onlyAdmin : false, auth : true, show : true},
      },
      {
        path: 'order/',
        children : [
          {
            path: 'add',
            name: 'order_add',
            component: Order_add,
            meta : {name : 'Корзина', order : 5, onlyAdmin : false, auth : true, show : true},
          },
          {
            path: 'history',
            name: 'order_history',
            component: Order_history,
            meta : {name : 'История ваших заказов', order : 6, onlyAdmin : false, auth : true, show : true},
          },
        ],
      },
    ]
  }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {

  if(to.meta.auth){
    if(!window.localStorage.getItem('b2b_client_token')) return next('/b2b/client/login');
  }

  !router.getRoutes().find(el => {return el.path === to.fullPath}) ? router.push({name : 'client'}) : '';

  next();
})

export default router
