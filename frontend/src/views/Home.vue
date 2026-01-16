<template>
  <div>
    <h1>Home</h1>

    <div class="search-bar">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search items"
      />
      <button @click="search">Search</button>
      
    </div>

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
import api from "../services/api";

export default {
  data() {
    return {
      items: [],
      loading: false,
      error: "",
      searchTerm: "",
      searchTimeout: null,
    };
  },

  async mounted() {
    await this.loadItems();
  },

  watch: {
    searchTerm(newVal) {
      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(async () => {
        if (newVal.trim() === "") {
          await this.loadItems();
        } else {
          try {
            this.items = await api.searchItems(newVal);
          } catch (err) {
            this.error = err.message;
            this.items = [];
          }
        }
      }, 300);
    },
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

    async search() {
      try {
        this.items = await api.searchItems(this.searchTerm);
      } catch (err) {
        alert(err.message);
      }
    },
  },
};
</script>
