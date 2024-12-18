import './assets/index.css'
import "./assets/index.scss";
import { createApp } from 'vue'
import { createPinia } from "pinia";
import App from './App.vue'
import router from './router'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { VueQueryPlugin } from '@tanstack/vue-query'




const app = createApp(App)

app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 20,
    newestOnTop: true
  });

app.use(VueQueryPlugin)
const pinia = createPinia();
app.use(pinia); 
app.use(router)

app.mount('#app')
