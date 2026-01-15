<template>
  <div>
    <h1>Item {{ itemId }}</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color:red">{{ error }}</p>

    <div v-if="item && !loading">
      <p><strong>Name:</strong> {{ item.name }}</p>
      <p><strong>Description:</strong> {{ item.description }}</p>
      <p><strong>Current Bid:</strong> {{ item.current_bid }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      itemId: null,
      item: null,
      loading: false,
      error: "",
    };
  },

  async mounted() {
    this.itemId = this.$route.params.id;
    await this.loadItem();
  },

  methods: {
    async loadItem() {
      this.loading = true;
      this.error = "";

      try {
        const res = await fetch(`http://localhost:3333/item/${this.itemId}`);
        const data = await res.json();

        if (!res.ok) {
          this.error = data?.error_message || `Request failed (${res.status})`;
          return;
        }

        this.item = data;
      } catch {
        this.error = "Could not connect to backend";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
