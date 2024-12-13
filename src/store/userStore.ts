import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { defineStore } from "pinia";

interface UserData{
  created_at: Date
  username: string
  user_type: string
  password: string
  id: any
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null, 
  }),

  getters: {
    isAuthenticated: (state) => !!state.user, 
  },

  actions: {
    
    setUser(userData: UserData | null ) {
      this.user = userData ;
    },

    
    clearUser() {
      this.user = null;
    },
  },
});