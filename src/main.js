import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import './styles/app.scss'
import './styles/element/index.scss'
import locale from 'element-plus/es/locale/lang/ru'
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import LaravelEcho from 'laravel-echo-vue3'
import Pusher from 'pusher-js'

if (process.env.NODE_ENV == 'development'){
    window._admin  = true;
}

const options = {
    cluster: 'mt1',
    broadcaster: 'pusher',
    key: 'local',
    wsHost: 'api.kraton.ru',
    wssPort: 6002,
    forceTLS: false,
    disableStats: true,
}

const app = createApp(App)
app.use(ElementPlus,  {locale})
app.use(router)
app.use(LaravelEcho, {
    ...options,
    client: new Pusher(options.key, options),
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')


