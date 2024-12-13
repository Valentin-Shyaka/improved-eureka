import { createStore } from 'vuex'
import { useToast } from 'vue-toastification'

const toast = useToast()

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
      toast.success("incremented!")
    }
  }
})