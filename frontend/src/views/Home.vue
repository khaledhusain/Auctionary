<template>
  <div>
    <h1>Home</h1>

    <button @click="loadItems">Reload items</button>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>

    <ul v-if="!loading && !error">
      <li v-for="item in items" :key="item.item_id">
        <router-link :to="`/item/${item.item_id}`">
          {{ item.item_id }} - {{ item.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      loading: false,
      error: "",
    };
  },

  async mounted() {
    await this.loadItems();
  },

  methods: {
    async loadItems() {
      this.loading = true;
      this.error = "";

      try {
        const res = await fetch("http://localhost:3333/search");
        const data = await res.json();

        if (!res.ok) {
          this.error = data?.error_message || `Request failed (${res.status})`;
          this.items = [];
          return;
        }

        this.items = data;
      } catch (e) {
        this.error = "Could not connect to backend";
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
