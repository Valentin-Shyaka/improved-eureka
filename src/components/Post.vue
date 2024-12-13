<template>
    <div class=' bg-white relative border p-4 shadow-lg rounded-xl w-full '>
        <div class="flex justify-between items-center">

            <h3 class="font-bold ">{{ props.title }}</h3>
            <div :class="`absolute right-4 top-2 rounded-xl p-2 text-sm border cursor-pointer ${flagJobOpening() ? 'border-red-500' : 'border-green-400' }`">
            <p v-if="!flagJobOpening()">open</p> 
            <p v-if="flagJobOpening()">closed</p> 
            </div>
        </div>
       
        <p class="mt-4 text-sm ">{{ props.description }}</p>
        <div class="mt-4" >
            <p class="font-bold mt-2">Date: <span class="font-light ">{{ props.created_at.split('T')[0] }} </span></p>
            <p class="font-bold mt-2">Deadline: <span class="font-light ">{{ props.application_deadline.split('T')[0] }} </span> </p>
            <p class="font-bold mt-2">Sector: <span class="font-light ">{{ props.sector }} </span></p>
            <p class="font-bold mt-2">Type: <span class="font-light ">{{ props.employment_type }} </span></p>
        </div>

    </div>
</template>
<script setup lang="ts">



interface PostProps {
    id: string
    created_at: Date;
    title: string;
    description: string;
    application_deadline: Date;
    sector: string;
    employment_type:string;
    application_instruction: string;

}

const props = defineProps<PostProps>()

const flagJobOpening = () => {
    const currentDate = new Date().getTime(); // Current timestamp in milliseconds
    const applicationDeadline = new Date(props.application_deadline).getTime(); // Parse application_deadline to Date and get timestamp

   
    if (applicationDeadline > currentDate) {
        return false; 
    }

    return true; 
};


</script>