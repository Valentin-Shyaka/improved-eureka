<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-10 z-50" @click="$emit('close')">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3">

            <div class="flex items-center w-full ">
                <img src=""  alt="user" class="w-20 h-20 rounded-full " />
                <div>
                    <p>Shyaka Damas</p>
                    <p>Collaborator</p>
                </div>
            </div>
            <div>

            </div>

        </div>
    </div>

</template>
<script setup>
import { ref } from "vue";

const emit = defineEmits(['close']);


</script>