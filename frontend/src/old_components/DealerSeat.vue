<template>
  <div>
    <div class="dealer-info" v-if="dealer">
      {{dealer.name}}
      <div>Remaining: {{deckLength}}</div>
    </div>
    <div class="dealer-hands">
      {{dealer.hands}}
      <div class="controller">
        <DebugControls
          :hands="dealer.hands"
          :playerId="dealer.id"
          :isDealer="dealer.isDealer"
        />
    </div>
    </div>
  </div>
</template>

<script>
import DebugControls from "@/components/DebugControls.vue"
export default {
  name: "DealerSeat",
  components: { DebugControls },
  data: function () {
    return {
      dealer: {},
    }
  },
  computed: {
    deckLength: function () {
      if (this.$store.state.deck) {
        return this.$store.state.deck.length;
      }
      return 0;
    }
  },
  methods: {
    getDealer: async function () {
      return await this.$store.state.players.find(player => player.isDealer === true) || {};
    },
  },
  mounted: async function () {
    this.dealer = await this.getDealer();
  }
}
</script>
