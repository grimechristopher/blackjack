<template>
  <div>
    <div>
      <RouterLink
        :to="{ name: 'CardGameTable', params: {
          roomId: props.room.id
        } }"
      >{{ props.room.name }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps(['room']);

</script>