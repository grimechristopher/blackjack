<template>
  <div class="modal-overlay" @click.self="hideModal">
    <div class="modal">
      <div class="modal-header">
        <slot name="header">
          Title
        </slot>

      </div>
      <div class="modal-body">
        <slot name="body"></slot>
      </div>
      <div class="modal-footer">
        <slot name="footer"></slot>
        <button @click="hideModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['hideModal', 'submitModal'])


function hideModal() {
  emit('hideModal');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  top: 0;
  z-index: 1; 
  width: 100vw;
  height: 100vh;
  overflow: auto; 
  background-color: rgba(0,0,0,0.5);
}

.modal {
  display: flex;
  width: 80%;
  padding-top: 0.25em;
  padding-left: 0.33em;
  padding-right: 0.33em;
  background-color: #fefefe;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  flex-direction: column;
}
.modal-footer {
  display: flex;
  justify-content: center;
  /* gap: 1rem; */
  padding: 0.5rem;
  /* padding: 0.33em */
}
</style>