<script setup lang="ts">
import { RouterLink, RouterView,useRouter } from 'vue-router'

import NavBar from './components/NavBar.vue'
import { useUserStore } from './store/userStore';
import Sidebar from './components/Sidebar.vue';

const userStore=useUserStore()
const router= useRouter()

const isAuthenticated = () => {
    const user = userStore.user
    return !!user; //niba nta token get outta here !!
  };

router.beforeEach((to, from, next) => {

 
  

  if (!isAuthenticated() && to.name !== "login") {

    console.log(isAuthenticated())
    
    next({ name: "login" });
  } else if (isAuthenticated() && to.name === "login") {
    
    next({ name: "home" });
  } else {
    
    next();
  }
});


</script>

<template>
<div class="flex">

<div v-if="isAuthenticated()"  class=" hidden sm:block w-1/4" >
  <Sidebar/>
</div>

  <div class=" w-full">
  <NavBar/>
 
  <RouterView />
  </div>
</div>
  
</template>


