<template>
<div class="home">
  <div class="home-search">
    <div class="search-joined">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search Auctionary"
        class="search-joined-input"
      />
      <button class="search-joined-btn" @click="search" aria-label="Search">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M10.5 18a7.5 7.5 0 1 1 5.2-12.9A7.5 7.5 0 0 1 10.5 18Zm0-2a5.5 5.5 0 1 0-3.9-1.6A5.5 5.5 0 0 0 10.5 16Zm7.8 5.4-4.2-4.2 1.4-1.4 4.2 4.2-1.4 1.4Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <!-- META LINE GOES HERE -->
    <div class="home-meta">
      {{ items.length }} active auctions
    </div>
  </div>

  <!-- ITEMS stay below (leave them as-is for now) -->
  <ul class="home-items">
    <!-- your v-for items -->
  </ul>

  <p v-if="loading">Loading...</p>
  <p v-if="error" class="home-error">{{ error }}</p>

<div class="item-list">
  <router-link
    v-for="item in items"
    :key="item.item_id"
    :to="`/item/${item.item_id}`"
    class="item-card"
  >

  <div class="item-title">
    {{ item.name }}
  </div>

  <div class="item-desc" v-if="item.description">
    {{ item.description }}
  </div>

  </router-link>
</div>

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
