import './assets/form.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"

import "bootstrap/dist/css/bootstrap.min.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js"

createApp(App).use(router).mount('#app')