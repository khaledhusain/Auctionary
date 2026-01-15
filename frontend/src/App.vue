<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      |
      <router-link to="/login">Login</router-link>
      |
      <router-link to="/comments">Comments</router-link>
      |
      <button v-if="isLoggedIn" @click="logout">Logout</button>
    </nav>

    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("session_token");
    },
  },

  methods: {
    async logout() {
      try {
        await fetch("http://localhost:3333/logout", {
          method: "POST",
          headers: {
            "X-Authorization": localStorage.getItem("session_token"),
          },
        });
      } catch {
        // ignore errors, still log out locally
      }

      localStorage.removeItem("user_id");
      localStorage.removeItem("session_token");

      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
nav {
  margin-bottom: 16px;
}
</style>
