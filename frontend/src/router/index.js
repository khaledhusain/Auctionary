import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import SingleItem from "../views/SingleItem.vue";
import CreateItem from "../views/CreateItem.vue";


const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  { path: "/item/:id", name: "single-item", component: SingleItem },
  { path: "/create", name: "create", component: CreateItem }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
