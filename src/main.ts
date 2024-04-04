import { createApp } from 'vue';
import App from './App.vue';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { OiCheckCircle, OiAlert, OiXCircle, OiQuestion, OiHash, OiTasklist, OiRocket, OiChevronDown, OiHorizontalRule, OiShareAndroid, OiCodescan, OiFileBadge, OiStar, OiStop, OiVerified, OiClock } from "oh-vue-icons/icons";

addIcons(OiCheckCircle, OiAlert, OiXCircle, OiQuestion, OiHash, OiTasklist, OiRocket, OiChevronDown, OiHorizontalRule, OiShareAndroid, OiCodescan, OiFileBadge, OiStar, OiStop, OiVerified, OiClock);

const app = createApp(App)
app.component("v-icon", OhVueIcon);
app.mount(
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })(),
);
