<template>
  <div>
    <nav class="app-nav">
      <div class="nav-inner">
        <div class="nav-left">
          <router-link class="nav-brand underline" to="/">AUCTIONARY</router-link>
        </div>

        <div class="nav-center">
          <router-link class="nav-link underline" to="/">Home</router-link>
          <router-link class="nav-link underline" to="/create">List Item</router-link>
        </div>

        <div class="nav-right">
          <span class="auth-slot">
            <router-link
              v-if="!isLoggedIn"
              class="nav-link underline"
              to="/login"
            >
              Login
            </router-link>

            <button
              v-else
              class="nav-btn underline"
              @click="logout"
            >
              Logout
            </button>
          </span>
        </div>
      </div>
    </nav>

    <section class="hero" v-if="$route.path === '/'">
      <h1 class="hero-title">AUCTIONARY</h1>
      <div class="hero-subtitle">BID ON ITEMS. LIST YOUR OWN.</div>
      <p class="hero-desc">
        Browse auctions, place bids, and list items in seconds.
      </p>
    </section>

    <div class="hero-divider" v-if="$route.path === '/'"></div>


    <main class="page">
      <router-view />
    </main>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loggedIn: !!localStorage.getItem("session_token"),
      };
    },

    computed: {
      isLoggedIn() {
        return this.loggedIn;
      },
    },

    watch: {
      $route() {
        this.loggedIn = !!localStorage.getItem("session_token");
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

        this.loggedIn = false; // ensure UI updates immediately
        this.$router.push("/login");
      },
    },
  };
</script>
