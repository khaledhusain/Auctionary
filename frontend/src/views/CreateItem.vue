<template>
  <div class="form-page">
    <h1 class="form-title">List Item</h1>

    <div class="form-box">
      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <form @submit.prevent="submit">
        <div class="form-row">
          <label class="form-label">Name</label>
          <input class="form-input" v-model="name" type="text" />
        </div>

        <div class="form-row">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" v-model="description"></textarea>
        </div>

        <div class="form-row">
          <label class="form-label">Starting Bid</label>
          <input class="form-input" v-model.number="starting_bid" type="number" min="1" />
        </div>

        <div class="form-row">
          <label class="form-label">End Date</label>
          <input class="form-input" v-model="end_date" type="date" />
        </div>

        <div class="form-actions">
          <button class="btn" type="submit">List</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  data() {
    return {
      name: "",
      description: "",
      starting_bid: 1,
      end_date: "",
      error: "",
      success: ""
    };
  },
  methods: {
    toIso(value) {
      if (!value) return "";

      // YYYY-MM-DD
      const dt = new Date(value + "T00:00:00");
      return dt.toISOString();
    },

    async submit() {
      this.error = "";
      this.success = "";

      try {
        await api.createItem({
          name: this.name,
          description: this.description,
          starting_bid: this.starting_bid,
          end_date: this.toIso(this.end_date)
        });

        this.success = "Item created.";
        this.name = "";
        this.description = "";
        this.starting_bid = 1;
        this.end_date = "";
      } catch (err) {
        this.error = err?.response?.data?.error_message || "Could not create item";
      }
    }
  }
};
</script>
