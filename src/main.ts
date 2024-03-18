import { createApp } from 'vue';
import App from './App.vue';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { OiRocket } from "oh-vue-icons/icons";

addIcons(OiRocket);

const app = createApp(App)
app.component("v-icon", OhVueIcon);
app.mount(
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })(),
);
