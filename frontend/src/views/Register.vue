<template>
  <div class="form-page">
    <h1 class="form-title">Create Account</h1>

    <div class="form-box">
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <label class="form-label" for="first_name">First name</label>
          <input
            class="form-input"
            id="first_name"
            type="text"
            v-model="first_name"
          />
          <div class="form-error" v-show="submitted && !first_name">
            First name is required.
          </div>
        </div>

        <div class="form-row">
          <label class="form-label" for="last_name">Last name</label>
          <input
            class="form-input"
            id="last_name"
            type="text"
            v-model="last_name"
          />
          <div class="form-error" v-show="submitted && !last_name">
            Last name is required.
          </div>
        </div>

        <div class="form-row">
          <label class="form-label" for="email">Email</label>
          <input
            class="form-input"
            id="email"
            type="email"
            v-model="email"
          />
          <div class="form-error" v-show="submitted && !email">
            Email is required.
          </div>
        </div>

        <div class="form-row">
          <label class="form-label" for="password">Password</label>
          <input
            class="form-input"
            id="password"
            type="password"
            v-model="password"
          />
          <div class="form-error" v-show="submitted && !password">
            Password is required.
          </div>
        </div>

        <div class="form-actions">
          <button class="btn" type="submit">Create Account</button>
        </div>

        <div class="form-success" v-if="success">{{ success }}</div>
        <div class="form-error" v-if="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import EmailValidator from "email-validator";

export default {
  data() {
    return {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      submitted: false,
      error: "",
      success: "",
     };
    },

    mounted() {
        if (this.$route.query.created) {
            this.success = "Account created. Please log in.";
        }
        },



  methods: {
    async handleSubmit() {
      this.submitted = true;
      this.error = "";
      this.success = "";

      const { first_name, last_name, email, password } = this;
      if (!(first_name && last_name && email && password)) return;

      if (!EmailValidator.validate(email)) {
        this.error = "Email must be a valid email.";
        return;
      }

      try {
        await api.post("/users", {
          first_name,
          last_name,
          email,
          password,
        });


        this.first_name = "";
        this.last_name = "";
        this.email = "";
        this.password = "";
        this.$router.push({ path: "/login", query: { created: "1" } });
        return;


    
      } catch (e) {
        this.error = e.message || "Registration failed";
      }
    },
  },
};
</script>

<style scoped></style>
