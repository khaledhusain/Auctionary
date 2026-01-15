import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Comments from "../views/Comments.vue";
import SingleItem from "../views/SingleItem.vue";


const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  { path: "/comments", name: "comments", component: Comments },
  { path: "/item/:id", name: "single-item", component: SingleItem },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
