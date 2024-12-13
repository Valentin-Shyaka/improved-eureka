<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { supabase } from '../components/lib/supabase';
import { Field, Form, ErrorMessage, useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useUserStore } from '../store/userStore';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/vue-query';

const userStore = useUserStore();
const router = useRouter();


interface UserData {
  created_at: Date | string; 
  username: string;
  user_type: string;
  password: string;
  id: number | string; 
}

interface LoginCredentials {
  username: string;
  password: string;
}


const schema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});




const { handleSubmit, values } = useForm({
  validationSchema: toTypedSchema(schema),
});

const loginUser = async (credentials: LoginCredentials): Promise<UserData[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", credentials.username)
    .eq("password", credentials.password);

  if (error) throw error;

  if (!data || data.length === 0) 
  throw new Error('Invalid credentials');

  return data;
};


const loginMutation = useMutation({
  mutationFn: loginUser,
  onSuccess: (userData) => {
      userStore.setUser(userData);
      toast.success("Login successful");
      router.push({ name: "home" });
  },
  onError: (error) => {toast.error(error instanceof Error ? error.message : 'Login failed'); }
});


const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential) {
      const token = credential.accessToken;
      const user = result.user;
    localStorage.setItem('token', token as string);
      localStorage.setItem('user', JSON.stringify(user));
      
        router.push({ name: 'home' });
    }
  } catch (error) {
      toast.error('Error during Google sign-in');
    console.error('Error during google authentication', error);
  }
};


const onSubmit = handleSubmit((formData) => {
  const credentials = {
      username: formData.username.trim(),
    password: formData.password.trim(),
  };

   loginMutation.mutate(credentials);
});
</script>

<template>
  <div class="flex items-center align-middle p-10 justify-center text-4xl">
    <div 
      v-if="loginMutation.isPending.value" 
      class="fixed inset-0 flex items-center justify-center font-bold text-white bg-black bg-opacity-50 z-50"
    >
      Signing You In...
    </div>
    <div class="bg-white border p-6 shadow-lg rounded-xl w-full sm:w-1/2">
      <h2 class="font-bold text-3xl">Login</h2>
      <p class="text-sm mt-2 text-gray-500">We are thrilled to welcome you back to our portal!</p>
      <form @submit.prevent="onSubmit" class="text-sm">
        <div class="border rounded-xl mt-8">
          <Field
            name="username"
            v-model="values.username"
            as="input"
            placeholder="e.g. John Doe"
            type="text"
            class="border text-md outline-none indent-4 py-4 w-full"
          />
        </div>
        <ErrorMessage name="username" class="text-red-500 text-sm mt-1" />
        
        <div class="border rounded-xl mt-8">
          <Field
            name="password"
            v-model="values.password"
            as="input"
            placeholder="password"
            type="password"
            class="border text-md outline-none indent-4 py-4 w-full"
          />
        </div>
        <ErrorMessage name="password" class="text-red-500 text-sm mt-1" />
        
        <button 
          type="submit" 
          :disabled="loginMutation.isPending.value"
          class="mt-6 cursor-pointer bg-green-400 px-6 py-4 w-full rounded-xl text-white font-bold disabled:opacity-50"
        >
          {{ loginMutation.isPending.value ? 'Signing In...' : 'Sign In' }}
        </button>
        
        <p class="text-center mt-4">or</p>
        
        <button
          @click="handleGoogleLogin"
          type="button"
          class="mt-6 cursor-pointer text-green-400 border outline-none border-green-400 px-6 py-4 w-full rounded-xl font-bold"
        >
          Sign In with Google
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
