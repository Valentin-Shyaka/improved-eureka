<script setup >
import { ref, computed } from "vue";
import { useUserStore } from "../store/userStore";
import { useRouter } from "vue-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "../components/lib/supabase";
import {toast }from "@/hooks/use-toast"; 
import Post from "../components/Post.vue";


const userStore = useUserStore();
const router = useRouter();


const showModal = ref(false);
const input_title = ref("");
const input_description = ref("");
const input_sector = ref("");
const input_employment_type = ref("");
const input_application_instruction = ref("");
const input_application_deadline = ref("");


const getJobs = async () => {
  const { data, error } = await supabase.from("jobs").select("*");
  if (error) throw new Error(error.message);
  return data; 
};


const {data: jobs, isLoading, isError, error } = useQuery({
  queryKey: ["jobs"],
  queryFn: getJobs,
  onError: (err) => {
    console.error("Failed to fetch jobs:", err);
    toast.error("Failed to fetch jobs. Please try again.");
  },
  staleTime: 1000 * 60 * 5, //inimota 5
  cacheTime: 1000 * 60 * 30, //iminota 30
});

const postings_asc = computed(() => {
  return jobs?.value?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) ;
});




const queryClient = useQueryClient();
const addPosting = async () => {
  if (
    input_title.value.trim() === "" ||
    input_description.value.trim() === "" ||
    input_sector.value.trim() === "" ||
    input_employment_type.value.trim() === "" ||
    input_application_instruction.value.trim() === "" ||
    input_application_deadline.value.trim() === ""
  ) {
    toast.error("All fields are required.");
    return;
  }

  const newJob = {
    title: input_title.value,
    description: input_description.value,
    skills: input_sector.value || 'Frontend Wizard',
    sector: input_sector.value,
    employment_type: input_employment_type.value,
    application_instructions: input_application_instruction.value,
    application_deadline: new Date(input_application_deadline.value),
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from("jobs").insert(newJob);
    if (error) throw new Error(error.message);

    toast.success("Job posted successfully!");

    
    queryClient.invalidateQueries(["jobs"]);

   
    input_title.value = "";
    input_description.value = "";
    input_sector.value = "";
    input_employment_type.value = "";
    input_application_instruction.value = "";
    input_application_deadline.value = "";
    showModal.value = false;
  } catch (err) {
    console.error("Failed to post job:", err);
    toast.error("Failed to post job. Please try again.");
  }
};


const removePosting = async (jobId) => {
  try {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) throw new Error(error.message);

    toast.success("Job removed successfully!");
    queryClient.invalidateQueries(["jobs"]);
  } catch (err) {
    console.error("Failed to remove job:", err);
    toast.error("Failed to remove job. Please try again.");
  }
};

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

    <!-- Add Job Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-10  z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3">
        <h2 class="text-xl font-bold mb-4">Add Job Post</h2>
        <form @submit.prevent="addPosting">
          <div class="mb-4">
            <label for="title" class="block text-sm font-bold mb-2">Title</label>
            <input
              id="title"
              type="text"
              v-model="input_title"
              class="w-full p-2 border rounded"
              placeholder="Enter job title"
            />
          </div>
          <div class="mb-4">
            <label for="description" class="block text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              v-model="input_description"
              class="w-full p-2 border rounded"
              placeholder="Enter job description"
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="sector" class="block text-sm font-bold mb-2">Sector</label>
            <input
              id="sector"
              type="text"
              v-model="input_sector"
              class="w-full p-2 border rounded"
              placeholder="Enter job sector"
            />
          </div>
          <div class="mb-4">
            <label for="emp-type" class="block text-sm font-bold mb-2">Employment type</label>
            <input
              id="emp-type"
              type="text"
              v-model="input_employment_type"
              class="w-full p-2 border rounded"
              placeholder="Enter employment type"
            />
          </div>
          <div class="mb-4">
            <label for="instruction" class="block text-sm font-bold mb-2">Instructions</label>
            <textarea
              id="instruction"
              v-model="input_application_instruction"
              class="w-full p-2 border rounded"
              placeholder="Enter job instruction"
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="deadline" class="block text-sm font-bold mb-2">Application deadline</label>
            <input
              id="slug"
              type="datetime"
              v-model="input_application_deadline"
              class="w-full p-2 border rounded"
              placeholder="MM/DD/YY format"
            />
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              @click="showModal = false"
              class="bg-gray-300 py-2 px-4 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button type="submit"  class="bg-green-400 py-2 px-4 text-white rounded-lg">
              Add Post
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>
