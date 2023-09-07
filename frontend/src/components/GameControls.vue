<template>
  <div>
    <div v-if="userHasSeat">
      User ok
    </div>
    <div v-if="!userHasSeat">
      No User
    </div>
  </div>
</template>

<script>
export default {
  name: "GameControls",
  components: { },
  data: function () {
    return {

    };
  },
  computed: {
    userHasSeat: function () {
      if (this.$store.state.user) {
        return this.$store.state.user.seat ? true : false
      }
      return false;
    }
  }
}
</script>