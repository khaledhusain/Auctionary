<template>
  <div>
    <h1>Create Item</h1>

    <p v-if="error" style="color:red">{{ error }}</p>
    <p v-if="success" style="color:green">{{ success }}</p>

    <form @submit.prevent="submit">
      <div>
        <label>Name:</label>
        <input v-model="name" type="text" />
      </div>

      <div>
        <label>Description:</label>
        <input v-model="description" type="text" />
      </div>

      <div>
        <label>Starting Bid:</label>
        <input v-model.number="starting_bid" type="number" min="1" />
      </div>

      <div>
        <label>End Date (ISO):</label>
        <input v-model="end_date" type="text" placeholder="2026-12-31T23:59:59.000Z" />
      </div>

      <button type="submit">Create</button>
    </form>
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
    async submit() {
      this.error = "";
      this.success = "";

      try {
        await api.createItem({
          name: this.name,
          description: this.description,
          starting_bid: this.starting_bid,
          end_date: this.end_date
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
