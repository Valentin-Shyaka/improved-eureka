<script setup lang="ts">
    import {ref} from 'vue'
    import {onBeforeMount} from 'vue'
 
    import {useUserStore} from '../store/userStore'
    import { useRouter } from 'vue-router';


    const router=useRouter()
    const userStore= useUserStore()

    

  
  const isAuthenticated = () => {
    const user = userStore.user
    return !!user; //niba nta token get outta here !!
  };

    const logout = () => {
      userStore.clearUser(); 
      router.push({ name: "login" }); 
    };
</script>

<template>
    <nav class=" sticky top-0 bg-white  w-full h-20 justify-center  items-center flex border-b p-10 ">
      <div class="flex items-center self-center w-full max-w-7xl justify-between">
        <h2 class="title text-2xl font-bold">
        What's up, {{ userStore.user[0]?.username || "Guest" }} 👋
        </h2> 
      <div class="flex gap-6 font-bold">
       
        <div v-if="isAuthenticated()">
          <button @click="logout" class="px-4 py-2 text-red-400 border border-red-400 cursor-pointer">Logout</button>
        </div>
        <div v-else class="px-4 py-2 text-red-400 border border-red-400 cursor-pointer">
          <RouterLink  class="px-4 py-2 cursor-pointer" to="/login">Login</RouterLink>
        </div>
        
      </div>
    </div>
    </nav>
</template>