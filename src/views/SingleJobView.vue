<script setup>

import { toast } from "@/hooks/use-toast"; 
import { useQuery } from "@tanstack/vue-query";
import {useRoute,useRouter} from "vue-router"
import { supabase } from '../components/lib/supabase';

const route=useRoute()
const router=useRouter()

console.log('id: ', route.params.id)

const getJob= async ()=>{
    const {data,error} = await supabase.from("jobs").select("*").eq('id', route.params.id)
    if(error) throw new Error(error.message)
    console.log(data)
    return data
}

const {data: job ,isLoading, isEror, error}= useQuery({
    queryKey: ["jobs"],
    queryFn: getJob,
    onError:(err)=>{
        console.error("Failed to Fetch Job: ", err);
        toast.error("Failed to FetchJob")
    },
    
})

const goBack=()=>{
    router.back()
}

</script>

<template>

    <div class=" bg-white self-center w-full p-10 h-full">

        <span @click="goBack()" class="bg-gray-100 text-sm font-bold border rounded-lg p-2 cursor-pointer">back</span>
       
        <h2 class="font-bold text-black text-2xl mt-10">{{ job ? job[0].title : 'Job View'}}</h2>

        <h4 class="mt-8 text-black">Description:</h4>
        <p>{{ job[0].description }}</p>

        <h4 class="mt-8 text-black">Instructions:</h4>
        <p>{{ job[0].application_instructions }}</p>

        <h4 class="mt-8 text-black">Sector:</h4>
        <p>{{ job[0].sector }}</p>

        <h4 class="mt-8 text-black">Employmant Type:</h4>
        <p>{{ job[0].employment_type }}</p>

        <h4 class="mt-8 text-black">Deadline:</h4>
        <p>{{ job[0].application_deadline.split('T')[0] }}</p>


        <button class="mt-8 w-full bg-green-400 rounded-lg cursor-pointer font-bold text-white p-4">
            Apply
        </button>
    </div>

    
</template>