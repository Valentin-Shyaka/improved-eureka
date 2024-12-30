<template>
  <div class="p-10" v-if="editor">
    <div class="w-full flex gap-10">
      <div class="w-2/3">
      <menu-bar class="flex text-gray-400" :editor="editor" />
      <editor-content class="p-10 h-fit min-h-screen border my-10 rounded-xl  bg-white outline-none" :editor="editor"  />
    </div>
    <div class="w-1/3 flex flex-col space-y-4 ">
        <button class="btn bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold" @click="addComment">Add Comment</button>
        <button class="btn bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold" @click="removeComment">Remove Comment</button>
        <button class="btn bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold" @click="addImage">Add Image</button>
      </div>
    </div>
   
    <button class="bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold">Submit</button>
    
    <pre class="p-4 bg-gray-300 border rounded-md mt-20">
      {{ jsonContent }}
    </pre>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent } from "@tiptap/vue-3";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from '@/store/userStore';

// Component imports
import MenuBar from "@/components/MenuBar.vue"
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import Document from '@tiptap/extension-document';
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import Image from '@tiptap/extension-image';
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import CommentExtension from "@sereneinserenade/tiptap-comment-extension";


const getRandomElement = (list) => list[Math.floor(Math.random() * list.length)];

const getRandomColor = () => {
  return getRandomElement([
    "#958DF1",
    "#F98181",
  ]);
};

const getRandomName = () => {
  return getRandomElement([
    "Leon Thompson",
    "Bonnie Journey",
  ]);
};


const store = useStore();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();


const provider = ref(null);
const editor = ref(null);
const status = ref('connecting');
const room = ref("project-name");
const activeCommentId = ref(null);
const jsonContent = ref('{}');
const currentUser = ref(JSON.parse(localStorage.getItem("user")) || {
  name: userStore?.user?.[0]?.username || getRandomName(),
  color: getRandomColor(),
  uuid: uuidv4(),
  rooms: {}
});


const roomFromSomewhere = computed(() => store?.state?.room);
const collaborationUsers = computed(() => 
  editor.value == null ? [] : editor.value.storage.collaborationCursor.users
);
const users = computed(() => store?.state?.users);

// Methods
const createEditor = () => {
  const ydoc = new Y.Doc
  ();

  provider.value = new HocuspocusProvider({
    url:"wss://hocus-noosphere.glitch.me/",
    name: "project-name",
    document: ydoc,
  });

  const awareness = provider.value.awareness;

  window.addEventListener("beforeunload", () => {
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [ydoc.clientID],
      "window unload"
    );
  });

  awareness.on("change", (changes) => {
    console.log("USERS", Array.from(awareness.getStates().values()));
  });

  provider.value.on("status", (event) => {
    status.value = event.status;
  });

  // currentUser.value.rooms[room.value] = { room: room.value, date: Date.now() };

  editor.value = new Editor({
    
    extensions: [
      Document,
      StarterKit.configure({
        history: false,
      }),
      Image.configure({
        HTMLAttributes: {
            class: 'editor-image',
        },
        inline: false,
        allowBase64: true,
        
      }),
      Highlight,
      TaskList,
      TaskItem,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider.value,
        user: currentUser.value,
      }),
      CommentExtension.configure({
        HTMLAttributes: {
          class: "my-comment",
        },
        onCommentActivated: (commentId) => {
          activeCommentId.value = commentId;
          if (commentId) {
            setTimeout(() => focusCommentWithActiveId(commentId));
          }
        },
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    onUpdate: ({ editor }) => {
      jsonContent.value = JSON.stringify(editor.getJSON(), null, 2);
    },
  });

  editor.value.on("create", ({ editor }) => {
    let step = { room: room.value, data: editor.getJSON(), type: "tiptap" };
    store?.dispatch("push", step);
    
    store.commit("setUser", currentUser.value);
    store.commit("setEDITORRoom", room.value);
  });

  editor.value.on("update", ({ editor }) => {
    let step = { room: room.value, data: editor.getJSON(), type: "tiptap" };
    store?.dispatch("push", step);
  });

  localStorage.setItem("currentUser", JSON.stringify(currentUser.value));
  localStorage.setItem("currentRoom", JSON.stringify(room.value));
  
  let r = { room: room.value, users: editor.value.storage.collaborationCursor.users };
  store.commit("updateRooms", r);
};


const addImage = () => {
  const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
  }

const addComment = () => {
  const commentId = `comment-${uuidv4()}`;
  editor.value.commands.setComment(commentId);
  alert(`Comment added with ID: ${commentId}`);
};

const removeComment = () => {
  if (activeCommentId.value) {
    editor.value.commands.unsetComment(activeCommentId.value);
    alert(`Comment with ID: ${activeCommentId.value} removed.`);
    activeCommentId.value = null;
  } else {
    alert("No active comment to remove.");
  }
};

const focusCommentWithActiveId = (commentId) => {
  console.log(`Focusing on comment with ID: ${commentId}`);
};

const setName = () => {
  const name = (window.prompt("Name") || "").trim().substring(0, 32);
  if (name) {
    updateCurrentUser({ name });
  }
};

const setRoom = () => {
  const room = (window.prompt("Choose a Room from 0 to 99") || "").trim().substring(0, 32);
  if (room) {
    updateCurrentRoom({ room });
  }
};

const updateCurrentUser = (attributes) => {
  currentUser.value = { ...currentUser.value, ...attributes };
  editor.value.chain().focus().updateUser(currentUser.value).run();
  localStorage.setItem("currentUser", JSON.stringify(currentUser.value));
};

const updateCurrentRoom = (attributes) => {
  room.value = attributes.room.startsWith("rooms.") 
    ? attributes.room 
    : "rooms." + attributes.room;

  editor.value.destroy();
  provider.value.destroy();
  createEditor();
  store.commit("setUsersInRoom", {
    room: room.value,
    users: collaborationUsers.value,
  });
};

// Lifecycle hooks
onMounted(() => {
  if (route.query.room) {
    room.value = route.query.room;
  }
  createEditor();
});

onBeforeUnmount(() => {
  editor.value.destroy();
  provider.value.destroy();
});

// Watchers
watch(roomFromSomewhere, (newRoom) => {
  if (room.value !== newRoom) {
    updateCurrentRoom({ room: newRoom });
  }
});

watch(collaborationUsers, (newUsers) => {
  if (users.value !== newUsers) {
    console.log("collaborationUsers changed", newUsers);
  }
});

// Expose necessary methods and components for the template
defineExpose({
  addComment,
  removeComment,
  setName,
  setRoom,
  addImage
});
</script>
<style lang="scss">
.my-comment {
  background-color: #ffeb3b; /* Light yellow highlight */
  border-radius: 4px;
  padding: 2px 4px;
  transition: background-color 0.3s ease;
}
.my-custom-class{
  display: block;
}
.my-comment:hover {
  background-color: #ffd740; /* Slightly darker yellow on hover */
}

.editor-image {
  .editor-image {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  display: block;
}
}

img {
    display: block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--purple);
    }
  } 
</style>