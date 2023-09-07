<template>
  <div>
    <div>
      <p>User: {{ user }}</p>
      <p>activePlayers: {{ user }}</p>
    </div>
  </div>

</template>

<script>
export default {
  name: "DebugControls",
  components: { },
  data: function () {
    return {

    };
  },
  props: {

  },
  computed: {
    activePlayers: function () {
      if (this.$store.state.activePlayers) {
        return this.$store.state.activePlayers;
      }
      return [];
    },
    user: function () {
      if (this.$store.state.user) {
        return this.$store.state.user;
      }
      return {};
    },
  },
  methods: {

  }
}
</script>