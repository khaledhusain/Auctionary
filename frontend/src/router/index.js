import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import SingleItem from "../views/SingleItem.vue";
import CreateItem from "../views/CreateItem.vue";
import Register from "../views/Register.vue";


const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  { path: "/item/:id", name: "single-item", component: SingleItem },
  { path: "/create", name: "create", component: CreateItem },
  { path: "/register", name: "register", component: Register }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
