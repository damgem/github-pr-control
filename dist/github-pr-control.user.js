// ==UserScript==
// @name         GitHub PR Control Center
// @namespace    npm/vite-plugin-monkey
// @version      0.0.0
// @author       Damian Gleumes
// @description  A control center to manage the lifecycle of your PR
// @match        https://github.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.4.21/dist/vue.global.prod.js
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_setClipboard
// ==/UserScript==

(a=>{if(typeof GM_addStyle=="function"){GM_addStyle(a);return}const t=document.createElement("style");t.textContent=a,document.head.append(t)})(' div[data-v-1904f9fa]{display:block;position:relative}span[data-v-1904f9fa]{position:absolute;right:0;bottom:0;transform:translate(calc(50% - 3px),calc(50% - 3px));padding:0 3px;color:var(--7a817548);background-color:var(--1782d0ec);-webkit-user-select:none;user-select:none;--text-body-size-small: .75rem;--base-size-20: .75rem}.hover-visible[data-v-a75a78da]{display:none}.wrapper:hover .hover-visible[data-v-a75a78da]{display:unset}.wrapper[data-v-a75a78da]{position:relative}.details-pane[data-v-a75a78da]{position:absolute;top:0;left:0;width:max-content;max-width:480px;transform:translate(calc(-100% - var(--924a43f6)),-3px);z-index:10}.details-pane[data-v-a75a78da]:before,.details-pane[data-v-a75a78da]:after{position:absolute;top:15.5px;display:block;pointer-events:none;content:" ";transform:translateY(-50%);clip-path:polygon(0 0,100% 50%,0 100%);left:calc(100% - 1px)}.details-pane[data-v-a75a78da]:after{width:4px;height:8px;background-color:var(--13f28647)}.details-pane.alt-mode[data-v-a75a78da]:after{background-color:var(--dce4a704)}.details-pane[data-v-a75a78da]:before{width:calc((4 + sqrt(2))*1px);height:calc((4 + sqrt(2))*2px);background-color:var(--b0b19e12)}.extended-hover-area[data-v-a75a78da]{position:absolute;right:0;top:0;bottom:0;width:48px;transform:translate(100%)}.head-container[data-v-a75a78da]{border:1px solid var(--b0b19e12);border-top-left-radius:6px;font-weight:600;background-color:var(--13f28647)}.content-container[data-v-a75a78da]{background-color:var(--dce4a704);border:1px solid var(--b0b19e12);border-radius:6px 0 6px 6px;color:var(--65269982)}.content-container[data-v-a75a78da]:not(.alt-mode){padding:8px 16px;border-top-left-radius:0;border-top:unset;overflow-y:scroll;max-height:50vh}.head-container[data-v-a75a78da],.content-container.alt-mode[data-v-a75a78da]{padding:4px 16px}.content-container.alt-mode[data-v-a75a78da]{border-bottom-right-radius:0}.icon-container[data-v-a75a78da]{position:relative;z-index:20}.control-center[data-v-de682685]{color:var(--2ac30510);position:fixed;top:208px;right:0;padding:8px 4px 8px var(--cc1be32e);border:1px solid var(--61c11cb8);border-right-width:0;border-radius:6px 0 0 6px;background-color:var(--115423ab)}.unaddressed-task[data-v-de682685]{display:block}.unaddressed-task[data-v-de682685] span[data-v-de682685]{cursor:pointer;margin-left:4px;font-weight:400}li[data-v-de682685]{margin-left:16px}p[data-v-de682685]{margin-bottom:0} ');

(function (vue) {
  'use strict';

  function tryOnScopeDispose(fn) {
    if (vue.getCurrentScope()) {
      vue.onScopeDispose(fn);
      return true;
    }
    return false;
  }
  function toValue(r) {
    return typeof r === "function" ? r() : vue.unref(r);
  }
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";
  typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
  const notNullish = (val) => val != null;
  function unrefElement(elRef) {
    var _a;
    const plain = toValue(elRef);
    return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
  }
  const defaultWindow = isClient ? window : void 0;
  function useMounted() {
    const isMounted = vue.ref(false);
    const instance = vue.getCurrentInstance();
    if (instance) {
      vue.onMounted(() => {
        isMounted.value = true;
      }, instance);
    }
    return isMounted;
  }
  function useSupported(callback) {
    const isMounted = useMounted();
    return vue.computed(() => {
      isMounted.value;
      return Boolean(callback());
    });
  }
  function useMutationObserver(target, callback, options = {}) {
    const { window: window2 = defaultWindow, ...mutationOptions } = options;
    let observer;
    const isSupported = useSupported(() => window2 && "MutationObserver" in window2);
    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = void 0;
      }
    };
    const targets = vue.computed(() => {
      const value = toValue(target);
      const items = (Array.isArray(value) ? value : [value]).map(unrefElement).filter(notNullish);
      return new Set(items);
    });
    const stopWatch = vue.watch(
      () => targets.value,
      (targets2) => {
        cleanup();
        if (isSupported.value && window2 && targets2.size) {
          observer = new MutationObserver(callback);
          targets2.forEach((el) => observer.observe(el, mutationOptions));
        }
      },
      { immediate: true, flush: "post" }
    );
    const takeRecords = () => {
      return observer == null ? void 0 : observer.takeRecords();
    };
    const stop = () => {
      cleanup();
      stopWatch();
    };
    tryOnScopeDispose(stop);
    return {
      isSupported,
      stop,
      takeRecords
    };
  }
  function $(selector, root = "document") {
    if (root === void 0) {
      return void 0;
    }
    const element = (root === "document" ? document : root).querySelector(selector);
    return element instanceof HTMLElement ? element : void 0;
  }
  function $$(selector, root = "document") {
    if (root === void 0) {
      return [];
    }
    const rootElement = root === "document" ? document : root;
    const elements = rootElement.querySelectorAll(selector);
    return Array.from(elements).filter((el) => el instanceof HTMLElement);
  }
  function useComputedElementQuery(getElement) {
    const element = vue.ref(getElement());
    useMutationObserver(
      () => $("body > div[data-turbo-body]"),
      () => {
        const newValue = vue.unref(getElement());
        if (newValue !== element.value) {
          element.value = newValue;
        }
      },
      { subtree: true, childList: true, attributes: true }
    );
    return vue.readonly(element);
  }
  var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _GM_notification = /* @__PURE__ */ (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
  var _GM_openInTab = /* @__PURE__ */ (() => typeof GM_openInTab != "undefined" ? GM_openInTab : void 0)();
  var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  function highlightScrollTo(element) {
    if (!element)
      return;
    element.classList.add("scroll-highlight");
    element.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      element.classList.remove("scroll-highlight");
    }, 1e3);
  }
  _GM_addStyle(`
    .scroll-highlight {
        scroll-margin-top: calc(60px + 16px);
        border: 1px solid #fde047 !important;
        box-sizing: border-box;
        transition: border-color 1s ease, border-width 1s ease, padding 1s ease;
    }
`);
  function toStatusString(success, error) {
    if (success === error) {
      return void 0;
    }
    return success ? "success" : "error";
  }
  const ACTION_IGNORE_LIST = [
    "All checks have passed",
    "Some checks were not successful",
    "Some checks haven’t completed yet",
    "This branch has not been deployed"
  ];
  function usePRDetails() {
    const currentGitHubPR = useComputedElementQuery(() => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length !== 4 || parts[2] !== "pull") {
        return void 0;
      }
      return {
        organization: parts[0],
        repository: parts[1],
        issueNumber: parseInt(parts[3])
      };
    });
    const status = useComputedElementQuery(() => {
      var _a;
      return (_a = $(".State")) == null ? void 0 : _a.title.toLowerCase().replace("status: ", "");
    });
    const linkedIssue = useComputedElementQuery(() => {
      const link = $(".timeline-comment .issue-link");
      if (!link) {
        return void 0;
      }
      return {
        issueNumber: link.innerText.replace("#", ""),
        href: link.getAttribute("href")
      };
    });
    const unaddressedTasks = useComputedElementQuery(() => {
      const tasks = $$('input[type="checkbox"].task-list-item-checkbox:not(:checked)').map((checkbox) => {
        var _a;
        if (!(checkbox instanceof HTMLInputElement)) {
          return void 0;
        }
        return {
          description: (_a = checkbox.parentElement) == null ? void 0 : _a.innerText.split("\n")[0].trim(),
          scrollIntoView: () => highlightScrollTo(checkbox == null ? void 0 : checkbox.parentElement),
          check: () => checkbox.checked = true
        };
      }).filter(Boolean);
      return tasks;
    });
    const checks = useComputedElementQuery(() => {
      return $$(".merge-status-list > .merge-status-item").map((item) => {
        var _a;
        const name = (_a = $("strong", item)) == null ? void 0 : _a.innerHTML.replace("(pull_request)", "").replace("CI /", "").trim();
        const success = !!item.querySelector("svg.octicon-check");
        const error = !!item.querySelector("svg.octicon-x");
        const status2 = toStatusString(success, error);
        return { name, status: status2 };
      });
    });
    const hasPreviewLabel = useComputedElementQuery(() => !!$('.discussion-sidebar-item .IssueLabel[data-name="preview"]'));
    const previewDeploymentLinks = useComputedElementQuery(() => {
      const comments = $$('.TimelineItem-avatar a[href="/apps/github-actions"]').map((e) => {
        var _a;
        return (_a = e == null ? void 0 : e.parentElement) == null ? void 0 : _a.parentElement;
      }).filter(Boolean).filter((e) => e.classList.contains("TimelineItem"));
      const comment = comments[comments.length - 1];
      function getLink(a) {
        const href = a.getAttribute("href");
        if (!href) {
          return void 0;
        }
        try {
          return { text: new URL(href).host, href };
        } catch {
          return void 0;
        }
      }
      const links = $$(".comment-body a", comment).map(getLink).filter(Boolean).filter((link) => !link.text.includes("notion"));
      return links;
    });
    const actions = useComputedElementQuery(() => {
      const actionItems = $$(".mergeability-details > .branch-action-item");
      function isVisibleInActionItem(item) {
        let element = item;
        while (element && !element.classList.contains("branch-action-item")) {
          if (window.getComputedStyle(element).display === "none") {
            return false;
          }
          element = element.parentElement;
        }
        return !!element;
      }
      function getTitle(item) {
        return $$(".status-heading", item).filter(isVisibleInActionItem).map((h2) => h2.innerText).join(" | ");
      }
      const getDescription = (item) => {
        return $$(".status-meta", item).filter(isVisibleInActionItem).map((h2) => h2.innerText).join(" | ");
      };
      function getStatus(item) {
        const statuses = $$(".completeness-indicator", item).filter(isVisibleInActionItem).map((icon) => {
          const indicatorClassList = Array.from(icon.classList);
          const success = indicatorClassList.includes("completeness-indicator-success");
          const error = indicatorClassList.some((className) => className.startsWith("completeness-indicator-") && className !== "completeness-indicator-success");
          return toStatusString(success, error);
        });
        return statuses.length === 1 ? statuses[0] : void 0;
      }
      function isChecksAction(item) {
        const toggle = $("span.statuses-toggle-opened", item);
        if (!toggle) {
          return false;
        }
        return ["Hide all checks", "Show all checks"].includes(toggle.innerText);
      }
      return actionItems.filter((item) => !isChecksAction(item)).map((item) => ({ title: getTitle(item), description: getDescription(item), status: getStatus(item) })).filter(({ title }) => !ACTION_IGNORE_LIST.includes(title));
    });
    return {
      currentGitHubPR,
      status,
      linkedIssue,
      unaddressedTasks,
      checks,
      hasPreviewLabel,
      previewDeploymentLinks,
      actions
    };
  }
  function copyShareable(directlyOpenSlack = false) {
    var _a, _b;
    const title = (_a = $(".js-issue-title")) == null ? void 0 : _a.innerText;
    const headerNumber = (_b = $(".gh-header-number")) == null ? void 0 : _b.innerText;
    const fullURL = new URL(window.location.href);
    const displayURL = `${fullURL.protocol}//${fullURL.host}${fullURL.pathname}`;
    const isPullRequest = $("#pull-requests-tab.selected") !== null;
    const type = isPullRequest ? "PR" : "Issue";
    const copyValue = `${type}: ${title} ${headerNumber} | ${displayURL}`;
    _GM_setClipboard(copyValue, "text");
    if (directlyOpenSlack) {
      window.open("slack://open");
    } else {
      _GM_notification({
        title: "PR Sharable copied",
        text: "Directly open Slack?",
        silent: true,
        timeout: 2500,
        onclick: () => _GM_openInTab("slack://open")
      });
    }
  }
  const COLORS = {
    purple: "#8957E5",
    green: "#238636",
    orange: "#D29922",
    red: "#DA3633",
    normalText: "#E6EDF3",
    fgHighlight: "#C9D1D9",
    fgMuted: "#848D97",
    bgHighlight: "#21262d",
    bgMuted: "#161B22",
    borderHighlight: "#363B42",
    borderMuted: "#30363d",
    pillBg: "#343941"
  };
  const CONTROLL_CENTER_PADDING_LEFT = "6px";
  const _hoisted_1$2 = ["title"];
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "Icon",
    props: {
      name: {},
      title: {},
      color: {},
      pillText: {},
      hidePill: { type: Boolean },
      clickEffect: { type: Function }
    },
    setup(__props) {
      vue.useCssVars((_ctx) => ({
        "7a817548": vue.unref(COLORS).fgMuted,
        "1782d0ec": vue.unref(COLORS).pillBg
      }));
      const props = __props;
      const pillText = vue.computed(() => typeof props.pillText === "number" ? String(props.pillText) : props.pillText);
      const showPill = vue.computed(() => props.hidePill === void 0 ? !!pillText.value : !props.hidePill);
      const fill = vue.computed(() => COLORS[props.color ?? "fgMuted"]);
      return (_ctx, _cache) => {
        const _component_v_icon = vue.resolveComponent("v-icon");
        return vue.openBlock(), vue.createElementBlock("div", {
          onClick: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => _ctx.clickEffect && _ctx.clickEffect(...args)),
          style: vue.normalizeStyle({ cursor: _ctx.clickEffect ? "pointer" : void 0 })
        }, [
          vue.createVNode(_component_v_icon, {
            name: _ctx.name,
            fill: fill.value,
            title: _ctx.title,
            scale: "1.33"
          }, null, 8, ["name", "fill", "title"]),
          showPill.value ? (vue.openBlock(), vue.createElementBlock("span", {
            key: 0,
            title: _ctx.title,
            class: "Counter"
          }, vue.toDisplayString(pillText.value), 9, _hoisted_1$2)) : vue.createCommentVNode("", true)
        ], 4);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const Icon = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-1904f9fa"]]);
  const _withScopeId$1 = (n) => (vue.pushScopeId("data-v-a75a78da"), n = n(), vue.popScopeId(), n);
  const _hoisted_1$1 = { class: "wrapper" };
  const _hoisted_2$1 = { style: { "overflow": "hidden" } };
  const _hoisted_3$1 = {
    key: 0,
    class: "head-container"
  };
  const _hoisted_4$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("div", { class: "extended-hover-area" }, null, -1));
  const _hoisted_5$1 = { class: "icon-container" };
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "Section",
    props: {
      altMode: { type: Boolean, default: false }
    },
    setup(__props) {
      vue.useCssVars((_ctx) => ({
        "924a43f6": vue.unref(CONTROLL_CENTER_PADDING_LEFT),
        "13f28647": vue.unref(COLORS).bgHighlight,
        "dce4a704": vue.unref(COLORS).bgMuted,
        "b0b19e12": vue.unref(COLORS).borderMuted,
        "65269982": vue.unref(COLORS).fgMuted
      }));
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
          vue.createElementVNode("div", {
            class: vue.normalizeClass(["hover-visible details-pane", { "alt-mode": _ctx.altMode }])
          }, [
            vue.createElementVNode("div", _hoisted_2$1, [
              !_ctx.altMode ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$1, [
                vue.renderSlot(_ctx.$slots, "head", {}, void 0, true)
              ])) : vue.createCommentVNode("", true),
              vue.createElementVNode("div", {
                class: vue.normalizeClass(["content-container", { "alt-mode": _ctx.altMode }])
              }, [
                _ctx.altMode ? vue.renderSlot(_ctx.$slots, "alt", { key: 0 }, void 0, true) : vue.renderSlot(_ctx.$slots, "default", { key: 1 }, void 0, true)
              ], 2)
            ]),
            _hoisted_4$1
          ], 2),
          vue.createElementVNode("div", _hoisted_5$1, [
            vue.renderSlot(_ctx.$slots, "icon", {}, void 0, true)
          ])
        ]);
      };
    }
  });
  const Section = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a75a78da"]]);
  const _withScopeId = (n) => (vue.pushScopeId("data-v-de682685"), n = n(), vue.popScopeId(), n);
  const _hoisted_1 = {
    key: 0,
    class: "control-center"
  };
  const _hoisted_2 = ["href"];
  const _hoisted_3 = { class: "unaddressed-task" };
  const _hoisted_4 = { style: { "display": "flex", "align-items": "start" } };
  const _hoisted_5 = ["onClickOnce"];
  const _hoisted_6 = ["onClick"];
  const _hoisted_7 = { key: 0 };
  const _hoisted_8 = ["href"];
  const _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("code", null, "github-actions", -1));
  const _hoisted_10 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("code", null, "Preview", -1));
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "ControlCenter",
    setup(__props) {
      vue.useCssVars((_ctx) => ({
        "2ac30510": vue.unref(COLORS).normalText,
        "cc1be32e": vue.unref(CONTROLL_CENTER_PADDING_LEFT),
        "61c11cb8": vue.unref(COLORS).borderHighlight,
        "115423ab": vue.unref(COLORS).bgHighlight
      }));
      const { currentGitHubPR, unaddressedTasks, status, linkedIssue, hasPreviewLabel, checks, actions, previewDeploymentLinks } = usePRDetails();
      const successActions = vue.computed(() => actions.value.filter(({ status: status2 }) => status2 === "success"));
      const nonSuccessActions = vue.computed(() => actions.value.filter(({ status: status2 }) => status2 !== "success"));
      function openInNewTab(url) {
        window.open(url, "_blank");
      }
      const isMerged = vue.computed(() => status.value === "merged");
      const failedChecks = vue.computed(() => checks.value.filter(({ status: status2 }) => status2 === "error"));
      const successfulChecks = vue.computed(() => checks.value.filter(({ status: status2 }) => status2 === "success"));
      const pendingChecks = vue.computed(() => checks.value.filter(({ status: status2 }) => !status2));
      vue.computed(() => checks.value.length);
      const numFailedChecks = vue.computed(() => failedChecks.value.length);
      const numSuccessfulChecks = vue.computed(() => successfulChecks.value.length);
      const numPendingChecks = vue.computed(() => pendingChecks.value.length);
      const checksPillNumber = vue.computed(() => numFailedChecks.value || numPendingChecks.value);
      function scrollToChecks() {
        var _a;
        highlightScrollTo((_a = $(".merge-status-list")) == null ? void 0 : _a.parentElement);
      }
      function scrollToActions() {
        highlightScrollTo($(".branch-action-body"));
      }
      function mergeColorOr(nonMergeColor, mergeColor) {
        return isMerged.value ? mergeColor ?? "purple" : nonMergeColor;
      }
      function statusToColor(status2) {
        if (!status2) {
          return COLORS.orange;
        }
        return status2 === "success" ? COLORS.green : COLORS.red;
      }
      return (_ctx, _cache) => {
        return vue.unref(currentGitHubPR) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
          vue.createVNode(Section, {
            "alt-mode": !vue.unref(linkedIssue)
          }, {
            icon: vue.withCtx(() => [
              vue.createVNode(Icon, {
                name: "oi-hash",
                color: vue.unref(linkedIssue) ? mergeColorOr("green") : "fgMuted",
                title: "Open issue page",
                style: { "cursor": "pointer" },
                onClick: _cache[0] || (_cache[0] = () => {
                  var _a;
                  return openInNewTab(((_a = vue.unref(linkedIssue)) == null ? void 0 : _a.href) ?? "");
                })
              }, null, 8, ["color"])
            ]),
            head: vue.withCtx(() => [
              vue.createTextVNode("Linked Issue")
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("First comment does not include the issue that this PR addresses")
            ]),
            default: vue.withCtx(() => {
              var _a, _b;
              return [
                vue.createElementVNode("a", {
                  href: ((_a = vue.unref(linkedIssue)) == null ? void 0 : _a.href) ?? "",
                  target: "_blank"
                }, "#" + vue.toDisplayString((_b = vue.unref(linkedIssue)) == null ? void 0 : _b.issueNumber), 9, _hoisted_2)
              ];
            }),
            _: 1
          }, 8, ["alt-mode"]),
          vue.createVNode(Icon, { name: "oi-chevron-down" }),
          vue.createVNode(Section, {
            "alt-mode": !vue.unref(unaddressedTasks).length
          }, {
            icon: vue.withCtx(() => {
              var _a;
              return [
                vue.createVNode(Icon, {
                  name: "oi-tasklist",
                  color: vue.unref(unaddressedTasks).length ? mergeColorOr("red", "fgMuted") : mergeColorOr("green"),
                  "pill-text": vue.unref(unaddressedTasks).length,
                  "hide-pill": !vue.unref(unaddressedTasks).length,
                  title: "Scroll to first unaddressed tasks",
                  "click-effect": (_a = vue.unref(unaddressedTasks)[0]) == null ? void 0 : _a.scrollIntoView
                }, null, 8, ["color", "pill-text", "hide-pill", "click-effect"])
              ];
            }),
            head: vue.withCtx(() => [
              vue.createTextVNode("Unadressed Tasks")
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("All tasks are adressed 🎉")
            ]),
            default: vue.withCtx(() => [
              vue.unref(unaddressedTasks).length ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(vue.unref(unaddressedTasks), (task, i) => {
                return vue.openBlock(), vue.createElementBlock("div", _hoisted_3, [
                  vue.createElementVNode("div", _hoisted_4, [
                    vue.createElementVNode("input", {
                      style: { "margin-top": "5px" },
                      type: "checkbox",
                      value: true,
                      onClickOnce: task.check
                    }, null, 40, _hoisted_5),
                    vue.createElementVNode("span", {
                      onClick: task.scrollIntoView
                    }, vue.toDisplayString(task.description), 9, _hoisted_6)
                  ])
                ]);
              }), 256)) : vue.createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["alt-mode"]),
          vue.createVNode(Icon, { name: "oi-chevron-down" }),
          vue.createVNode(Section, {
            "alt-mode": !vue.unref(checks).length
          }, {
            icon: vue.withCtx(() => [
              vue.createVNode(Icon, {
                name: numFailedChecks.value ? "oi-x-circle" : numPendingChecks.value ? "oi-clock" : "oi-check-circle",
                color: numFailedChecks.value ? "red" : numPendingChecks.value ? "orange" : mergeColorOr(numSuccessfulChecks.value ? "green" : "fgMuted"),
                "pill-text": checksPillNumber.value,
                "hide-pill": !checksPillNumber.value,
                title: "See checks",
                "click-effect": vue.unref(checks).length ? scrollToChecks : void 0
              }, null, 8, ["name", "color", "pill-text", "hide-pill", "click-effect"])
            ]),
            head: vue.withCtx(() => [
              vue.createTextVNode("Checks")
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("No checks found")
            ]),
            default: vue.withCtx(() => [
              failedChecks.value.length ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                vue.createElementVNode("strong", {
                  style: vue.normalizeStyle({ color: vue.unref(COLORS).red })
                }, "Error", 4),
                vue.createElementVNode("ul", null, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(failedChecks.value, ({ name }) => {
                    return vue.openBlock(), vue.createElementBlock("li", null, vue.toDisplayString(name), 1);
                  }), 256))
                ])
              ], 64)) : vue.createCommentVNode("", true),
              pendingChecks.value.length ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                vue.createElementVNode("strong", {
                  style: vue.normalizeStyle({ color: vue.unref(COLORS).orange })
                }, "Pending", 4),
                vue.createElementVNode("ul", null, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(pendingChecks.value, ({ name }) => {
                    return vue.openBlock(), vue.createElementBlock("li", null, vue.toDisplayString(name), 1);
                  }), 256))
                ])
              ], 64)) : vue.createCommentVNode("", true),
              successfulChecks.value.length ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 2 }, [
                vue.createElementVNode("strong", {
                  style: vue.normalizeStyle({ color: vue.unref(COLORS).green })
                }, "Success", 4),
                vue.createElementVNode("ul", null, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(successfulChecks.value, ({ name }) => {
                    return vue.openBlock(), vue.createElementBlock("li", null, vue.toDisplayString(name), 1);
                  }), 256))
                ])
              ], 64)) : vue.createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["alt-mode"]),
          vue.createVNode(Icon, { name: "oi-chevron-down" }),
          vue.createVNode(Section, {
            "alt-mode": !vue.unref(hasPreviewLabel)
          }, {
            icon: vue.withCtx(() => [
              vue.createVNode(Icon, {
                name: "oi-rocket",
                color: vue.unref(hasPreviewLabel) && vue.unref(previewDeploymentLinks).length ? mergeColorOr("green") : vue.unref(hasPreviewLabel) ? "orange" : vue.unref(status) === "closed" ? "fgMuted" : mergeColorOr("red", "fgMuted"),
                title: "Open preview",
                "click-effect": vue.unref(hasPreviewLabel) && vue.unref(previewDeploymentLinks).length ? () => openInNewTab(vue.unref(previewDeploymentLinks)[0].href) : void 0
              }, null, 8, ["color", "click-effect"])
            ]),
            head: vue.withCtx(() => [
              vue.createTextVNode("Preview Deployment Links")
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("Add the "),
              _hoisted_10,
              vue.createTextVNode(" label to trigger the preview deployment!")
            ]),
            default: vue.withCtx(() => [
              vue.unref(previewDeploymentLinks).length ? (vue.openBlock(), vue.createElementBlock("ul", _hoisted_7, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(previewDeploymentLinks), (link) => {
                  return vue.openBlock(), vue.createElementBlock("li", null, [
                    vue.createElementVNode("a", {
                      href: link.href ?? ""
                    }, vue.toDisplayString(link.text), 9, _hoisted_8)
                  ]);
                }), 256))
              ])) : (vue.openBlock(), vue.createElementBlock("span", {
                key: 1,
                style: vue.normalizeStyle({ backgroundColor: vue.unref(COLORS).fgMuted })
              }, [
                vue.createTextVNode("Waiting for "),
                _hoisted_9,
                vue.createTextVNode(" bot comment ⏳")
              ], 4))
            ]),
            _: 1
          }, 8, ["alt-mode"]),
          vue.createVNode(Icon, { name: "oi-chevron-down" }),
          vue.createVNode(Section, {
            "alt-mode": !vue.unref(actions).length
          }, {
            icon: vue.withCtx(() => [
              vue.createVNode(Icon, {
                name: nonSuccessActions.value.length ? "oi-stop" : "oi-verified",
                color: mergeColorOr(nonSuccessActions.value.length ? "red" : successActions.value.length ? "green" : "fgMuted"),
                title: "See actions",
                "click-effect": vue.unref(actions).length ? scrollToActions : void 0,
                "pill-text": nonSuccessActions.value.length,
                "hide-pill": !nonSuccessActions.value.length
              }, null, 8, ["name", "color", "click-effect", "pill-text", "hide-pill"])
            ]),
            head: vue.withCtx(() => [
              vue.createTextVNode("Final Actions")
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("No actions found")
            ]),
            default: vue.withCtx(() => [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(actions), ({ title, description, status: status2 }) => {
                return vue.openBlock(), vue.createElementBlock("div", null, [
                  vue.createElementVNode("strong", {
                    style: vue.normalizeStyle({ color: statusToColor(status2) })
                  }, vue.toDisplayString(title), 5),
                  vue.createElementVNode("p", {
                    style: vue.normalizeStyle({ color: vue.unref(COLORS).fgMuted, lineHeight: 1.25, marginBottom: "4px" })
                  }, vue.toDisplayString(description), 5)
                ]);
              }), 256))
            ]),
            _: 1
          }, 8, ["alt-mode"]),
          vue.createVNode(Icon, {
            name: "oi-horizontal-rule",
            style: { "margin": "-2.75px 0" }
          }),
          vue.createVNode(Section, { "alt-mode": "" }, {
            icon: vue.withCtx(() => [
              vue.createVNode(Icon, {
                name: "oi-share-android",
                title: "Copy PR title & URL",
                style: { "position": "relative", "z-index": "20" },
                "click-effect": () => vue.unref(copyShareable)(true)
              }, null, 8, ["click-effect"])
            ]),
            alt: vue.withCtx(() => [
              vue.createTextVNode("Copy PR title & URL to clipboard")
            ]),
            _: 1
          })
        ])) : vue.createCommentVNode("", true);
      };
    }
  });
  const ControllCenter = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-de682685"]]);
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(ControllCenter);
      };
    }
  });
  const l = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;", "&": "&amp;" };
  let h = 0;
  var f = (n) => n.replace(/[<>"&]/g, (n2) => l[n2] || n2), p = (n) => n + h++;
  const u = {}, m = (n) => {
    const { name: o, paths: e = [], d: t, polygons: v = [], points: r } = n;
    t && e.push({ d: t }), r && v.push({ points: r }), u[o] = Object.assign({}, n, { paths: e, polygons: v }), u[o].minX || (u[o].minX = 0), u[o].minY || (u[o].minY = 0);
  }, c = (...n) => {
    for (const o of n)
      m(o);
  }, g = vue.defineComponent({ name: "OhVueIcon", props: { name: { type: String, validator: (n) => !n || n in u || (console.warn(`Invalid prop: prop "name" is referring to an unregistered icon "${n}".
Please make sure you have imported this icon before using it.`), false) }, title: String, fill: String, scale: { type: [Number, String], default: 1 }, animation: { validator: (n) => ["spin", "spin-pulse", "wrench", "ring", "pulse", "flash", "float"].includes(n) }, hover: Boolean, flip: { validator: (n) => ["horizontal", "vertical", "both"].includes(n) }, speed: { validator: (n) => "fast" === n || "slow" === n }, label: String, inverse: Boolean }, setup(n) {
    const a = vue.ref([]), s = vue.reactive({ outerScale: 1.2, x: null, y: null }), l2 = vue.reactive({ width: 0, height: 0 }), h2 = vue.computed(() => {
      const o = Number(n.scale);
      return isNaN(o) || o <= 0 ? (console.warn('Invalid prop: prop "scale" should be a number over 0.'), s.outerScale) : o * s.outerScale;
    }), f2 = vue.computed(() => ({ "ov-icon": true, "ov-inverse": n.inverse, "ov-flip-horizontal": "horizontal" === n.flip, "ov-flip-vertical": "vertical" === n.flip, "ov-flip-both": "both" === n.flip, "ov-spin": "spin" === n.animation, "ov-spin-pulse": "spin-pulse" === n.animation, "ov-wrench": "wrench" === n.animation, "ov-ring": "ring" === n.animation, "ov-pulse": "pulse" === n.animation, "ov-flash": "flash" === n.animation, "ov-float": "float" === n.animation, "ov-hover": n.hover, "ov-fast": "fast" === n.speed, "ov-slow": "slow" === n.speed })), m2 = vue.computed(() => n.name ? u[n.name] : null), c2 = vue.computed(() => m2.value ? `${m2.value.minX} ${m2.value.minY} ${m2.value.width} ${m2.value.height}` : `0 0 ${g2.value} ${w2.value}`), d = vue.computed(() => {
      if (!m2.value)
        return 1;
      const { width: n2, height: o } = m2.value;
      return Math.max(n2, o) / 16;
    }), g2 = vue.computed(() => l2.width || m2.value && m2.value.width / d.value * h2.value || 0), w2 = vue.computed(() => l2.height || m2.value && m2.value.height / d.value * h2.value || 0), y = vue.computed(() => 1 !== h2.value && { fontSize: h2.value + "em" }), b = vue.computed(() => {
      if (!m2.value || !m2.value.raw)
        return null;
      const n2 = {};
      let o = m2.value.raw;
      return o = o.replace(/\s(?:xml:)?id=(["']?)([^"')\s]+)\1/g, (o2, e, t) => {
        const v = p("vat-");
        return n2[t] = v, ` id="${v}"`;
      }), o = o.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (o2, e, t, v) => {
        const r = e || v;
        return r && n2[r] ? `#${n2[r]}` : o2;
      }), o;
    }), $2 = vue.computed(() => m2.value && m2.value.attr ? m2.value.attr : {}), x = () => {
      if (!n.name && null !== n.name && 0 === a.value.length)
        return void console.warn('Invalid prop: prop "name" is required.');
      if (m2.value)
        return;
      let o = 0, e = 0;
      a.value.forEach((n2) => {
        n2.outerScale = h2.value, o = Math.max(o, n2.width), e = Math.max(e, n2.height);
      }), l2.width = o, l2.height = e, a.value.forEach((n2) => {
        n2.x = (o - n2.width) / 2, n2.y = (e - n2.height) / 2;
      });
    };
    return vue.onMounted(() => {
      x();
    }), vue.onUpdated(() => {
      x();
    }), { ...vue.toRefs(s), children: a, icon: m2, klass: f2, style: y, width: g2, height: w2, box: c2, attribs: $2, raw: b };
  }, created() {
    const n = this.$parent;
    n && n.children && n.children.push(this);
  }, render() {
    const n = Object.assign({ role: this.$attrs.role || (this.label || this.title ? "img" : null), "aria-label": this.label || null, "aria-hidden": !(this.label || this.title), width: this.width, height: this.height, viewBox: this.box }, this.attribs);
    this.attribs.stroke ? n.stroke = this.fill ? this.fill : "currentColor" : n.fill = this.fill ? this.fill : "currentColor", this.x && (n.x = this.x.toString()), this.y && (n.y = this.y.toString());
    let o = { class: this.klass, style: this.style };
    if (o = Object.assign(o, n), this.raw) {
      const n2 = this.title ? `<title>${f(this.title)}</title>${this.raw}` : this.raw;
      o.innerHTML = n2;
    }
    const e = this.title ? [vue.h("title", this.title)] : [], t = (n2, o2, e2) => vue.h(n2, { ...o2, key: `${n2}-${e2}` });
    return vue.h("svg", o, this.raw ? void 0 : e.concat([this.$slots.default ? this.$slots.default() : this.icon ? [...this.icon.paths.map((n2, o2) => t("path", n2, o2)), ...this.icon.polygons.map((n2, o2) => t("polygon", n2, o2))] : []]));
  } });
  function w(n, o) {
    void 0 === o && (o = {});
    var e = o.insertAt;
    if (n && "undefined" != typeof document) {
      var t = document.head || document.getElementsByTagName("head")[0], v = document.createElement("style");
      v.type = "text/css", "top" === e && t.firstChild ? t.insertBefore(v, t.firstChild) : t.appendChild(v), v.styleSheet ? v.styleSheet.cssText = n : v.appendChild(document.createTextNode(n));
    }
  }
  w(".ov-icon {\n  display: inline-block;\n  overflow: visible;\n  vertical-align: -0.2em;\n}\n");
  w("/* ---------------- spin ---------------- */\n.ov-spin:not(.ov-hover),\n.ov-spin.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-spin {\n  animation: ov-spin 1s linear infinite;\n}\n\n.ov-spin:not(.ov-hover).ov-fast,\n.ov-spin.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-spin.ov-fast {\n  animation: ov-spin 0.7s linear infinite;\n}\n\n.ov-spin:not(.ov-hover).ov-slow,\n.ov-spin.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-spin.ov-slow {\n  animation: ov-spin 2s linear infinite;\n}\n\n/* ---------------- spin-pulse ---------------- */\n\n.ov-spin-pulse:not(.ov-hover),\n.ov-spin-pulse.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-spin-pulse {\n  animation: ov-spin 1s infinite steps(8);\n}\n\n.ov-spin-pulse:not(.ov-hover).ov-fast,\n.ov-spin-pulse.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-spin-pulse.ov-fast {\n  animation: ov-spin 0.7s infinite steps(8);\n}\n\n.ov-spin-pulse:not(.ov-hover).ov-slow,\n.ov-spin-pulse.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-spin-pulse.ov-slow {\n  animation: ov-spin 2s infinite steps(8);\n}\n\n@keyframes ov-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n/* ---------------- wrench ---------------- */\n.ov-wrench:not(.ov-hover),\n.ov-wrench.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-wrench {\n  animation: ov-wrench 2.5s ease infinite;\n}\n\n.ov-wrench:not(.ov-hover).ov-fast,\n.ov-wrench.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-wrench.ov-fast {\n  animation: ov-wrench 1.2s ease infinite;\n}\n\n.ov-wrench:not(.ov-hover).ov-slow,\n.ov-wrench.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-wrench.ov-slow {\n  animation: ov-wrench 3.7s ease infinite;\n}\n\n@keyframes ov-wrench {\n  0% {\n    transform: rotate(-12deg);\n  }\n\n  8% {\n    transform: rotate(12deg);\n  }\n\n  10%, 28%, 30%, 48%, 50%, 68% {\n    transform: rotate(24deg);\n  }\n\n  18%, 20%, 38%, 40%, 58%, 60% {\n    transform: rotate(-24deg);\n  }\n\n  75%, 100% {\n    transform: rotate(0deg);\n  }\n}\n\n/* ---------------- ring ---------------- */\n.ov-ring:not(.ov-hover),\n.ov-ring.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-ring {\n  animation: ov-ring 2s ease infinite;\n}\n\n.ov-ring:not(.ov-hover).ov-fast,\n.ov-ring.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-ring.ov-fast {\n  animation: ov-ring 1s ease infinite;\n}\n\n.ov-ring:not(.ov-hover).ov-slow,\n.ov-ring.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-ring.ov-slow {\n  animation: ov-ring 3s ease infinite;\n}\n\n@keyframes ov-ring {\n  0% {\n    transform: rotate(-15deg);\n  }\n\n  2% {\n    transform: rotate(15deg);\n  }\n\n  4%, 12% {\n    transform: rotate(-18deg);\n  }\n\n  6% {\n    transform: rotate(18deg);\n  }\n\n  8% {\n    transform: rotate(-22deg);\n  }\n\n  10% {\n    transform: rotate(22deg);\n  }\n\n  12% {\n    transform: rotate(-18deg);\n  }\n\n  14% {\n    transform: rotate(18deg);\n  }\n\n  16% {\n    transform: rotate(-12deg);\n  }\n\n  18% {\n    transform: rotate(12deg);\n  }\n\n  20%, 100% {\n    transform: rotate(0deg);\n  }\n}\n\n/* ---------------- pulse ---------------- */\n.ov-pulse:not(.ov-hover),\n.ov-pulse.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-pulse {\n  animation: ov-pulse 2s linear infinite;\n}\n\n.ov-pulse:not(.ov-hover).ov-fast,\n.ov-pulse.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-pulse.ov-fast {\n  animation: ov-pulse 1s linear infinite;\n}\n\n.ov-pulse:not(.ov-hover).ov-slow,\n.ov-pulse.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-pulse.ov-slow {\n  animation: ov-pulse 3s linear infinite;\n}\n\n@keyframes ov-pulse {\n  0% {\n    transform: scale(1.1);\n  }\n\n  50% {\n    transform: scale(0.8);\n  }\n\n  100% {\n    transform: scale(1.1);\n  }\n}\n\n/* ---------------- flash ---------------- */\n.ov-flash:not(.ov-hover),\n.ov-flash.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-flash {\n  animation: ov-flash 2s ease infinite;\n}\n\n.ov-flash:not(.ov-hover).ov-fast,\n.ov-flash.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-flash.ov-fast {\n  animation: ov-flash 1s ease infinite;\n}\n\n.ov-flash:not(.ov-hover).ov-slow,\n.ov-flash.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-flash.ov-slow {\n  animation: ov-flash 3s ease infinite;\n}\n\n@keyframes ov-flash {\n  0%, 100%, 50%{\n    opacity: 1;\n  }\n  25%, 75%{\n    opacity: 0;\n  }\n}\n\n/* ---------------- float ---------------- */\n.ov-float:not(.ov-hover),\n.ov-float.ov-hover:hover,\n.ov-parent.ov-hover:hover > .ov-float {\n  animation: ov-float 2s linear infinite;\n}\n\n.ov-float:not(.ov-hover).ov-fast,\n.ov-float.ov-hover.ov-fast:hover,\n.ov-parent.ov-hover:hover > .ov-float.ov-fast {\n  animation: ov-float 1s linear infinite;\n}\n\n.ov-float:not(.ov-hover).ov-slow,\n.ov-float.ov-hover.ov-slow:hover,\n.ov-parent.ov-hover:hover > .ov-float.ov-slow {\n  animation: ov-float 3s linear infinite;\n}\n\n@keyframes ov-float {\n  0%, 100% {\n    transform: translateY(-3px);\n  }\n  50% {\n    transform: translateY(3px);\n  }\n}\n");
  w(".ov-flip-horizontal {\n  transform: scale(-1, 1);\n}\n\n.ov-flip-vertical {\n  transform: scale(1, -1);\n}\n\n.ov-flip-both {\n  transform: scale(-1, -1);\n}\n\n.ov-inverse {\n  color: #fff;\n}\n");
  const OiAlert = { "name": "oi-alert", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"/>' };
  const OiCheckCircle = { "name": "oi-check-circle", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-1.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"/>' };
  const OiChevronDown = { "name": "oi-chevron-down", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z"/>' };
  const OiClock = { "name": "oi-clock", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"/>' };
  const OiCodescan = { "name": "oi-codescan", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path d="M8.47 4.97a.75.75 0 000 1.06L9.94 7.5 8.47 8.97a.75.75 0 101.06 1.06l2-2a.75.75 0 000-1.06l-2-2a.75.75 0 00-1.06 0zM6.53 6.03a.75.75 0 00-1.06-1.06l-2 2a.75.75 0 000 1.06l2 2a.75.75 0 101.06-1.06L5.06 7.5l1.47-1.47z"/><path fill-rule="evenodd" d="M12.246 13.307a7.5 7.5 0 111.06-1.06l2.474 2.473a.75.75 0 11-1.06 1.06l-2.474-2.473zM1.5 7.5a6 6 0 1110.386 4.094.75.75 0 00-.292.293A6 6 0 011.5 7.5z"/>' };
  const OiFileBadge = { "name": "oi-file-badge", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path d="M2.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h3.5a.75.75 0 010 1.5h-3.5A1.75 1.75 0 011 13.25V1.75C1 .784 1.784 0 2.75 0h8a1.75 1.75 0 011.508.862.75.75 0 11-1.289.768.25.25 0 00-.219-.13h-8z"/><path fill-rule="evenodd" d="M8 7a4 4 0 116.49 3.13l.995 4.973a.75.75 0 01-.991.852l-2.409-.876a.25.25 0 00-.17 0l-2.409.876a.75.75 0 01-.991-.852l.994-4.973A3.993 3.993 0 018 7zm4-2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 6.5a4 4 0 001.104-.154l.649 3.243-1.155-.42c-.386-.14-.81-.14-1.196 0l-1.155.42.649-3.243A4 4 0 0012 11z"/>' };
  const OiHash = { "name": "oi-hash", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M6.368 1.01a.75.75 0 01.623.859L6.57 4.5h3.98l.46-2.868a.75.75 0 011.48.237L12.07 4.5h2.18a.75.75 0 010 1.5h-2.42l-.64 4h2.56a.75.75 0 010 1.5h-2.8l-.46 2.869a.75.75 0 01-1.48-.237l.42-2.632H5.45l-.46 2.869a.75.75 0 01-1.48-.237l.42-2.632H1.75a.75.75 0 010-1.5h2.42l.64-4H2.25a.75.75 0 010-1.5h2.8l.46-2.868a.75.75 0 01.858-.622zM9.67 10l.64-4H6.33l-.64 4h3.98z"/>' };
  const OiHorizontalRule = { "name": "oi-horizontal-rule", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M0 7.75A.75.75 0 01.75 7h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 7.75z"/>' };
  const OiQuestion = { "name": "oi-question", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.007.004a7.728 7.728 0 00-.313.195 2.416 2.416 0 00-.692.661.75.75 0 001.248.832.956.956 0 01.276-.245 6.3 6.3 0 01.26-.16l.006-.004c.093-.057.204-.123.313-.195.222-.149.487-.355.692-.662.214-.32.329-.702.329-1.15 0-.76-.36-1.348-.863-1.725A2.76 2.76 0 008 4c-.631 0-1.155.16-1.572.438-.413.276-.68.638-.849.977a.75.75 0 101.342.67z"/>' };
  const OiRocket = { "name": "oi-rocket", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M14.064 0a8.75 8.75 0 00-6.187 2.563l-.459.458c-.314.314-.616.641-.904.979H3.31a1.75 1.75 0 00-1.49.833L.11 7.607a.75.75 0 00.418 1.11l3.102.954c.037.051.079.1.124.145l2.429 2.428c.046.046.094.088.145.125l.954 3.102a.75.75 0 001.11.418l2.774-1.707a1.75 1.75 0 00.833-1.49V9.485c.338-.288.665-.59.979-.904l.458-.459A8.75 8.75 0 0016 1.936V1.75A1.75 1.75 0 0014.25 0h-.186zM10.5 10.625c-.088.06-.177.118-.266.175l-2.35 1.521.548 1.783 1.949-1.2a.25.25 0 00.119-.213v-2.066zM3.678 8.116L5.2 5.766c.058-.09.117-.178.176-.266H3.309a.25.25 0 00-.213.119l-1.2 1.95 1.782.547zm5.26-4.493A7.25 7.25 0 0114.063 1.5h.186a.25.25 0 01.25.25v.186a7.25 7.25 0 01-2.123 5.127l-.459.458a15.21 15.21 0 01-2.499 2.02l-2.317 1.5-2.143-2.143 1.5-2.317a15.25 15.25 0 012.02-2.5l.458-.458h.002zM12 5a1 1 0 11-2 0 1 1 0 012 0zm-8.44 9.56a1.5 1.5 0 10-2.12-2.12c-.734.73-1.047 2.332-1.15 3.003a.23.23 0 00.265.265c.671-.103 2.273-.416 3.005-1.148z"/>' };
  const OiShareAndroid = { "name": "oi-share-android", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M13.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 3a3 3 0 01-5.175 2.066l-3.92 2.179a3.005 3.005 0 010 1.51l3.92 2.179a3 3 0 11-.73 1.31l-3.92-2.178a3 3 0 110-4.133l3.92-2.178A3 3 0 1115 3zm-1.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9-5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>' };
  const OiStar = { "name": "oi-star", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>' };
  const OiStop = { "name": "oi-stop", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M4.47.22A.75.75 0 015 0h6a.75.75 0 01.53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 01-.22.53l-4.25 4.25A.75.75 0 0111 16H5a.75.75 0 01-.53-.22L.22 11.53A.75.75 0 010 11V5a.75.75 0 01.22-.53L4.47.22zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5H5.31zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z"/>' };
  const OiTasklist = { "name": "oi-tasklist", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M2.5 2.75a.25.25 0 01.25-.25h10.5a.25.25 0 01.25.25v10.5a.25.25 0 01-.25.25H2.75a.25.25 0 01-.25-.25V2.75zM2.75 1A1.75 1.75 0 001 2.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0015 13.25V2.75A1.75 1.75 0 0013.25 1H2.75zm9.03 5.28a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"/>' };
  const OiVerified = { "name": "oi-verified", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M9.585.52a2.678 2.678 0 00-3.17 0l-.928.68a1.178 1.178 0 01-.518.215L3.83 1.59a2.678 2.678 0 00-2.24 2.24l-.175 1.14a1.178 1.178 0 01-.215.518l-.68.928a2.678 2.678 0 000 3.17l.68.928c.113.153.186.33.215.518l.175 1.138a2.678 2.678 0 002.24 2.24l1.138.175c.187.029.365.102.518.215l.928.68a2.678 2.678 0 003.17 0l.928-.68a1.17 1.17 0 01.518-.215l1.138-.175a2.678 2.678 0 002.241-2.241l.175-1.138c.029-.187.102-.365.215-.518l.68-.928a2.678 2.678 0 000-3.17l-.68-.928a1.179 1.179 0 01-.215-.518L14.41 3.83a2.678 2.678 0 00-2.24-2.24l-1.138-.175a1.179 1.179 0 01-.518-.215L9.585.52zM7.303 1.728c.415-.305.98-.305 1.394 0l.928.68c.348.256.752.423 1.18.489l1.136.174c.51.078.909.478.987.987l.174 1.137c.066.427.233.831.489 1.18l.68.927c.305.415.305.98 0 1.394l-.68.928a2.678 2.678 0 00-.489 1.18l-.174 1.136a1.178 1.178 0 01-.987.987l-1.137.174a2.678 2.678 0 00-1.18.489l-.927.68c-.415.305-.98.305-1.394 0l-.928-.68a2.678 2.678 0 00-1.18-.489l-1.136-.174a1.178 1.178 0 01-.987-.987l-.174-1.137a2.678 2.678 0 00-.489-1.18l-.68-.927a1.178 1.178 0 010-1.394l.68-.928c.256-.348.423-.752.489-1.18l.174-1.136c.078-.51.478-.909.987-.987l1.137-.174a2.678 2.678 0 001.18-.489l.927-.68zM11.28 6.78a.75.75 0 00-1.06-1.06L7 8.94 5.78 7.72a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.75-3.75z"/>' };
  const OiXCircle = { "name": "oi-x-circle", "minX": -1.6, "minY": -1.6, "width": 19.2, "height": 19.2, "raw": '<path fill-rule="evenodd" d="M3.404 12.596a6.5 6.5 0 119.192-9.192 6.5 6.5 0 01-9.192 9.192zM2.344 2.343a8 8 0 1011.313 11.314A8 8 0 002.343 2.343zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"/>' };
  c(OiCheckCircle, OiAlert, OiXCircle, OiQuestion, OiHash, OiTasklist, OiRocket, OiChevronDown, OiHorizontalRule, OiShareAndroid, OiCodescan, OiFileBadge, OiStar, OiStop, OiVerified, OiClock);
  const app = vue.createApp(_sfc_main);
  app.component("v-icon", g);
  app.mount(
    (() => {
      const app2 = document.createElement("div");
      document.body.append(app2);
      return app2;
    })()
  );

})(Vue);