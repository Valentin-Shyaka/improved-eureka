import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {useUserStore} from '../store/userStore'
import SingleJobView from '@/views/SingleJobView.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/job/:id/',
      name: 'jobDetails ',
      component: SingleJobView,
      props: true
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  

  if (to.name !== "login" && !userStore.isAuthenticated) {
    console.log('Unauthenticated---------')
    next({ name: "login" }); // Redirect to login niba user ari unauthenticated
  } else {
    console.log('Authenticated-----------')
    next(); 
  }
});

export default router
