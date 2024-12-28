<template>
  <div class="p-10" v-if="editor">
    <div class="w-full flex gap-10">
      <div class="w-2/3">
      <menu-bar class="flex text-gray-400" :editor="editor" />
      <editor-content class="p-10 h-96 border my-10 rounded-xl  bg-white outline-none" :editor="editor"  />
    </div>
    <div class="w-1/3 flex flex-col space-y-4 ">
        <button class="btn bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold" @click="addComment">Add Comment</button>
        <button class="btn bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold" @click="removeComment">Remove Comment</button>
      </div>
    </div>
   
    <button class="bg-black px-4 py-2 cursor-pointer rounded-lg text-white font-bold">Submit</button>
    
    <pre class="p-4 bg-gray-300 border rounded-md mt-20">
      {{ jsonContent }}
    </pre>
  </div>
</template>

<script>
import { HocuspocusProvider } from "@hocuspocus/provider";
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import Document from '@tiptap/extension-document'
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import CommentExtension from "@sereneinserenade/tiptap-comment-extension";
import { Editor, EditorContent } from "@tiptap/vue-3";
import * as Y from "yjs";

import { v4 as uuidv4 } from "uuid";


import MenuBar from "@/components/MenuBar.vue";
import * as awarenessProtocol from "y-protocols/awareness.js";

const getRandomElement = (list) => {
  return list[Math.floor(Math.random() * list.length)];
};

const getRandomRoom = () => {
 
  const roomNumbers = [...Array(99).keys()];
  return getRandomElement(roomNumbers.map((number) => `rooms.${number}`));
};

export default {
  components: {
    EditorContent,
    MenuBar,
  
  },

  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem("currentUser")) || {
        name: this.getRandomName(),
        color: this.getRandomColor(),
        uuid: uuidv4(),
      },
      provider: null,
      editor: null,
      status: "connecting",
      room: 'icyumba.120',
      activeCommentId: null,
      jsonContent: "{}",
    };
  },

  created() {
    console.log("router", this.$router, this.$route);
    if (this.$route.query.room) {
      this.room = this.$route.query.room;
      console.log("room", this.room);
    }
  },
  mounted() {
    this.createEditor();
  },
  methods: {
    createEditor() {
      const ydoc = new Y.Doc();

      this.provider = new HocuspocusProvider({
        //appId: '7j9y6m10',
        url: "wss://hocus-noosphere.glitch.me/",
        name: this.room,
        document: ydoc,
      });

      const awareness = this.provider.awareness;
      console.log("awareness", awareness);

      window.addEventListener("beforeunload", () => {
        awarenessProtocol.removeAwarenessStates(
          awareness,
          [ydoc.clientID],
          "window unload"
        );
      });

      console.log("EDITOR awareness", awareness, awareness.clientID);


      awareness.on("change", (changes) => {
        console.log("changes", changes);
        // Whenever somebody updates their awareness information,
        // we log all awareness information from all users.
        console.log("USERS", Array.from(awareness.getStates().values()));
       
      });

      this.provider.on("status", (event) => {
        this.status = event.status;
      });

      this.currentUser.rooms[this.room] = { room: this.room, date: Date.now() };
      //this.currentUser.clientID = this.awareness.clientID

      this.editor = new Editor({
        extensions: [
          Document,
          StarterKit.configure({
            history: false,
          }),
          Highlight,
          TaskList,
          TaskItem,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCursor.configure({
            provider: this.provider,
            user: this.currentUser,
          }),
          CommentExtension.configure({
            HTMLAttributes: {
              class: "my-comment",
            },
            onCommentActivated: (commentId) => {
              this.activeCommentId = commentId;
              if (commentId) {
                setTimeout(() => this.focusCommentWithActiveId(commentId));
              }
            },
          }),
          CharacterCount.configure({
            limit: 10000,
          }),
        ],
          // adding the json content when the document is updated
        onUpdate: ({ editor }) => {
          this.jsonContent = JSON.stringify(editor.getJSON(), null, 2);
        },
      });
      this.editor.on("create", ({ editor }) => {
        //  console.log(editor.getJSON())
        let step = { room: this.room, data: editor.getJSON(), type: "tiptap" };
        this.store?.dispatch("push", step);
        // The content has changed.

        // let user = this.currentUser
        // user.room = this.room
        // delete user.rooms[this.room]
        // let room = {room: this.room, date : Date.now()}
        //user.rooms[this.room] = room
        console.log("setEDitoruser", this.currentUser);
        this.$store.commit("setUser", this.currentUser);
        console.log("setEDITORRoom", this.room);
        this.$store.commit("setEDITORRoom", this.room);

        // You can think of your own awareness information as a key-value store.
        // We update our "user" field to propagate relevant user information.
      });
      this.editor.on("update", ({ editor }) => {
        
        let step = { room: this.room, data: editor.getJSON(), type: "tiptap" };
        this.store?.dispatch("push", step);
       
        // The content has changed.
      });

      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      localStorage.setItem("currentRoom", JSON.stringify(this.room));
      let r = { room: this.room, users: this.editor.storage.collaborationCursor.users };
      console.log("users in room ", r);
      console.log("clientID is CORE awareness, ClienId is editor awareness");
      this.$store.commit("updateRooms", r);
     
    },

    addComment() {
      const commentId = `comment-${uuidv4()}`;
      this.editor.commands.setComment(commentId);
     alert(`Comment added with ID: ${commentId}`);
    },
    removeComment() {
      if (this.activeCommentId) {
        this.editor.commands.unsetComment(this.activeCommentId);
        alert(`Comment with ID: ${this.activeCommentId} removed.`);
        this.activeCommentId = null;
      } else {
        alert("No active comment to remove.");
      }
    },
    focusCommentWithActiveId(commentId) {
      console.log(`Focusing on comment with ID: ${commentId}`);
      // Optional logic for focusing or scrolling to the comment area.
    },
    setName() {
      const name = (window.prompt("Name") || "").trim().substring(0, 32);

      if (name) {
        return this.updateCurrentUser({
          name,
        });
      }
    },
    setRoom() {
      const room = (window.prompt("Choose a Room from 0 to 99") || "")
        .trim()
        .substring(0, 32);
      if (room) {
        return this.updateCurrentRoom({
          room,
        });
      }
    },

    updateCurrentUser(attributes) {
      this.currentUser = { ...this.currentUser, ...attributes };
      this.editor.chain().focus().updateUser(this.currentUser).run();

      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    },
    updateCurrentRoom(attributes) {
      console.log(attributes);
      this.room = attributes.room.startsWith("rooms.")
        ? attributes.room
        : "rooms." + attributes.room;

      this.editor.destroy();
      this.provider.destroy();
      this.createEditor();
      this.store.commit("setUsersInRoom", {
        room: this.room,
        users: this.collaborationUsers,
      });
    },

    getRandomColor() {
      return getRandomElement([
        "#958DF1",
        "#F98181",
        
      ]);
    },

    getRandomName() {
      return getRandomElement([
        "Leon Thompson",
        "Bonnie Journey",
        
      ]);
    },
  },
  beforeUnmount() {
    this.editor.destroy();
    this.provider.destroy();
  },
  watch: {
    roomFromSomewhere() {
      if (this.room != this.roomFromSomewhere) {
        let room = this.roomFromSomewhere;
        console.log(room);
        // if (room.rooms) this.updateCurrentRoom({room})
        this.updateCurrentRoom({
          room,
        });
      }
    },
    collaborationUsers() {
      if (this.users != this.collaborationUsers) {
        console.log("collaborationUsers changed", this.collaborationUsers);
      }
    },
  },
  computed: {
    roomFromSomewhere() {
      return this.store?.state?.room;
    },
    collaborationUsers() {
      return this.editor == null ? [] : this.editor.storage.collaborationCursor.users;
    },
    users() {
      return this.$store?.state?.users;
    },
  },
};
</script>
<style lang="scss">
.my-comment {
  background-color: #ffeb3b; /* Light yellow highlight */
  border-radius: 4px;
  padding: 2px 4px;
  transition: background-color 0.3s ease;
}
.my-comment:hover {
  background-color: #ffd740; /* Slightly darker yellow on hover */
}
</style>