<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "../store/userStore";
import { useQuery } from "@tanstack/vue-query";
import { supabase } from "../components/lib/supabase";
import { toast } from "@/hooks/use-toast"; 
import Post from "../components/Post.vue";
import AddJobModal from "../components/AddJobModal.vue";

const userStore = useUserStore();

const showModal = ref(false);

const getJobs = async () => {
  const { data, error } = await supabase.from("jobs").select("*");
  if (error) throw new Error(error.message);
  return data; 
};

const { data: jobs, isLoading, isError, error } = useQuery({
  queryKey: ["jobs"],
  queryFn: getJobs,
  onError: (err) => {
    console.error("Failed to fetch jobs:", err);
    toast.error("Failed to fetch jobs. Please try again.");
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 30, // 30 minutes
});

const postings_asc = computed(() => {
  return jobs?.value?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
});
</script>

<template>
  <main class="app">
    
    

    
    <section class="w-full p-10">
      <div class="w-full flex justify-between items-center">
        <h3 class="sm:text-xl font-bold">Available Job Postings</h3>
        <button
          v-if="userStore.user[0]?.user_type=='PARTRNER_COMPANY_ADMIN'"
          @click="showModal = true"
          class="bg-green-400 py-2 px-4 font-bold text-sm text-white rounded-xl cursor-pointer"
        >
          Add Job Post
        </button>
      </div>

     <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

  
      <div v-for="post in postings_asc" :key="post.id" class=" flex mt-10">
        <Post
          :title="post.title"
          :description="post.description"
          :application_deadline="post.application_deadline"
          :sector="post.sector"
          :application_instruction="post.application_instruction"
          :created_at="post.created_at"
          :id="post.id"
          :employment_type="post.employment_type"

        />
      </div>
    </div>
    </section>

    
    <AddJobModal 
      v-if="showModal" 
      @close="showModal = false"
    />
   
  </main>
</template>
