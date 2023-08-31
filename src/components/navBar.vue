<template>
  <div
      class="navBar-container"
  >
    <el-menu
        :default-active="activeIndex"
        mode="vertical"
        :router=true
        background-color="#f9f9f9"
        text-color="#555555"
    >
      <template
        v-for="(item, key) in menu"
        :key="key"
      >
        <el-menu-item
         v-if="item.show"
         :index="item.path"
        >
          <a>{{item.name}}</a>
        </el-menu-item>
      </template>

    </el-menu>
  </div>
</template>

<script>
import {ref, reactive, watchEffect, inject, computed} from "vue";
import {useRoute, useRouter} from 'vue-router'
export default {
  name: "navBar",
  setup(){

    const route             = useRoute();
    const router            = useRouter();
    const menu              = inject('menu');
    const activeIndex       = ref(null);



    menu.length = 0;
    router.getRoutes().forEach(el => {
      let menuItem = {path : el.path, name : el.meta.name, order : el.meta.order, show : el.meta.show};

      if (el.meta.name){

        if (el.meta.onlyAdmin)

          window._admin ? menu.push({path : el.path, name : el.meta.name, order : el.meta.order, show : el.meta.show}) : '';
          else
            menu.push(menuItem)

      };
    })

    menu.sort((a, b) => a.order > b.order ? 1 : -1);

    watchEffect(() => { activeIndex.value = route.path })

    return{activeIndex, menu}
  },
}
</script>

<style scoped>

.navBar-container >>> .el-menu-item{
  position: relative;
}

.navBar-container >>> .el-menu-item:hover> a:after{
  content: "";
  position: absolute;
  left: 0px;
  top: 0px;
  width: 3px;
  height: 100%;
  background: #535b61;
  display: block;
}
.navBar-container >>> .el-menu-item.is-active {
  background-color: #535b61;
  /*color: #fff!important;*/
}
.navBar-container >>> .el-menu-item.is-active > a{
    color: #fff!important;
}

</style>