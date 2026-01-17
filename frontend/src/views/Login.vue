<template>
  <div class="form-page">
    <h1 class="form-title">Login</h1>

    <div class="form-box">
      <!-- <div class="form-success" v-if="success">{{ success }}</div> -->
      <div class="form-error" v-if="error">{{ error }}</div>
      <form v-on:submit.prevent="handleSubmit">
        <div class="form-row">
          <label class="form-label" for="email1">Email</label>
          <input
            class="form-input"
            type="email"
            id="email1"
            name="email1"
            v-model="email1"
          />
          <div class="form-error" v-show="submitted && !email1">Email is required</div>
        </div>

        <div class="form-row">
          <label class="form-label" for="password">Password</label>
          <input
            class="form-input"
            type="password"
            id="password"
            name="password"
            v-model="password"
          />
          <div class="form-error" v-show="submitted && !password">Password is required</div>
        </div>

        <div class="form-actions">
          <button class="btn" type="submit">Login</button>
        </div>

        <div class="form-actions" v-if="!isLoggedIn">
          <router-link class="btn" to="/register">Create Account</router-link>
        </div>

        <div class="form-success" v-if="success">{{ success }}</div>
        <div class="form-error" v-if="error">{{ error }}</div>

        <!-- <p>{{ email1 }} + {{ password }}</p> -->
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
    email1: "",
    password: "",
    submitted: false,
    error: "",
    success : "",
  }; 
},

mounted() {
  if (this.$route.query.created) {
    this.success = "Account created. Please log in.";
    this.$router.replace({ path: "/login" });
  }
},

computed: {
  isLoggedIn() {
    return !!localStorage.getItem("session_token");
  },
},
  methods: {
    async handleSubmit() {
      this.submitted = true;
      this.error = "";
      this.success = "";

      const { email1, password } = this;

      if (!(email1 && password)) return;

      if (!EmailValidator.validate(email1)) {
        this.error = "Email must be a valid email.";
        return;
      }

      // const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      // if (!password_pattern.test(password)) {
      //   this.error = "Password not strong enough.";
      //   return;
      // }

      try {
        const data = await api.post("/login", { email: email1, password });

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("session_token", data.session_token);

        this.$router.push({ path: "/", query: { logged: "1" } });
        return;

      } catch (e) {
        this.error = e.message || "Login failed";
      }
    }
,
  },
};
</script>

<style scoped></style>
