<script setup>
import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { supabase } from "../components/lib/supabase";
import { toast } from "@/hooks/use-toast";

const emit = defineEmits(['close']);

const input_title = ref("");
const input_description = ref("");
const input_sector = ref("");
const input_employment_type = ref("");
const input_application_instruction = ref("");
const input_application_deadline = ref("");

const queryClient = useQueryClient();

const addJobs = async () => {
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

  const { error } = await supabase.from("jobs").insert(newJob);
  if (error) throw new Error(error.message);
  return newJob; 
};

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

  try {
    await addJobs();
    toast.success("Job posted successfully!");
    
   
    queryClient.invalidateQueries(["jobs"]);

  
    input_title.value = "";
    input_description.value = "";
    input_sector.value = "";
    input_employment_type.value = "";
    input_application_instruction.value = "";
    input_application_deadline.value = "";
    
    
    emit('close');
  } catch (err) {
    console.error("Failed to post job:", err);
    toast.error("Failed to post job. Please try again.");
  }
};
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-10 z-50">
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
            id="deadline"
            type="datetime-local"
            v-model="input_application_deadline"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-300 py-2 px-4 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button type="submit" class="bg-green-400 py-2 px-4 text-white rounded-lg">
            Add Post
          </button>
        </div>
      </form>
    </div>
  </div>
</template>