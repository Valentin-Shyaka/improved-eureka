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
    user: JSON.parse(localStorage.getItem("user") || "null") as UserData | null 
  }),

  getters: {
    isAuthenticated: (state) => !!state.user, 
  },

  actions: {
    
    setUser(userData: UserData | null ) {
      this.user = userData ;
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData)); 
      } else {
        localStorage.removeItem("user"); 
      }
    },

    
    clearUser() {
      this.user = null;
      localStorage.removeItem("user"); 
    },
  },
});