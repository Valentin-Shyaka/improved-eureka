<script setup lang="js">


import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import Editor from '../components/Editor.vue'

const appId = '7j9y6m10'
const collabRoom = `room.${new Date()
  .getFullYear()
  .toString()
  .slice(-2)}${new Date().getMonth() + 1}${new Date().getDate()}-ok`



// ydoc and provider for Editor 
const ydocA = new Y.Doc()
const providerA = new TiptapCollabProvider({
  appId,
  name: collabRoom,
  document: ydocA,
})

// ydoc and provider for Editor 
const ydocB = new Y.Doc()
const providerB = new TiptapCollabProvider({
  appId,
  name: collabRoom,
  document: ydocA,
})

</script>

    <template>
      <div class="">
        <Editor :provider={providerA} :ydoc={ydocA} :room={collabRoom} />
        <!-- <Editor :provider={providerB} :ydoc={ydocB} :room={collabRoom} /> -->
        
      </div>
    </template>


export default App