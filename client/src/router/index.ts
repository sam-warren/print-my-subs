import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import LoginCallback from "../views/LoginCallback.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/login-callback",
    name: "Login Callback",
    component: LoginCallback
  },
  {
    path: "/",
    name: "Home",
    component: Home
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
