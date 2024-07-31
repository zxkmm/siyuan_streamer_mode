import { Plugin, showMessage, getFrontend } from "siyuan";
import "@/index.scss";

import { SettingUtils } from "./libs/setting-utils";

const STORAGE_NAME = "menu-config";

var packageNameClass = document.getElementsByClassName("ft__on-surface");

export default class siyuan_streamer_mode extends Plugin {
  private settingUtils: SettingUtils;
  private isMobile: boolean;

  convertStringToArray(userInput) {
    if (userInput) {
      var inputArray = userInput.split(/[,，]/);
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i] = inputArray[i].trim();
      }
      return inputArray;
    } else {
      // 处理 undefined
      return [];
    }
  }

  blackOutKeyWords(_keywords_array_) {
    //this func were ported from these repos:
    //此函数从如下仓库移植
    //https://github.com/mdzz2048/siyuan-plugin-hsr by mdzz2048
    //idea from https://github.com/TCOTC/siyuan-plugin-hsr-mdzz2048-fork by TCOTC AKA JerffreyChen
    //谢谢!!!💓💓💓

    // 创建 createTreeWalker 迭代器，用于遍历文本节点，保存到一个数组
    const treeWalker = document.createTreeWalker(
      document,
      NodeFilter.SHOW_TEXT
    );
    const allTextNodes = [];
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      allTextNodes.push(currentNode);
      currentNode = treeWalker.nextNode();
    }

    // 清除上个高亮
    CSS.highlights.clear();

    // 存储所有找到的ranges
    let allRanges = [];

    // 遍历关键词数组
    _keywords_array_.forEach((keyword) => {
      // 为空判断
      const str = keyword.trim().toLowerCase();
      if (!str) return;

      // 查找所有文本节点是否包含搜索词
      const ranges = allTextNodes
        .map((el) => {
          return { el, text: el.textContent.toLowerCase() };
        })
        .map(({ el, text }) => {
          const indices = [];
          let startPos = 0;
          while (startPos < text.length) {
            const index = text.indexOf(str, startPos);
            if (index === -1) break;
            indices.push(index);
            startPos = index + str.length;
          }

          // 根据搜索词的位置创建选区
          return indices.map((index) => {
            const range = new Range();
            range.setStart(el, index);
            range.setEnd(el, index + str.length);
            return range;
          });
        });

      // 合并ranges
      allRanges = allRanges.concat(ranges.flat());
    });

    // 创建高亮对象
    const keywordsHighlight = new Highlight(...allRanges);
    const keywordsCount = allRanges.length;
    const keywordsRange = allRanges;

    // 注册高亮
    CSS.highlights.set("blocked_text", keywordsHighlight);

    return { kwdCount: keywordsCount, kwdRange: keywordsRange };
  }

  init_event_bus_handler() {
    if (this.settingUtils.get("totalSwitch")) {
      const _blacklist_words_ = this.convertStringToArray(
        this.settingUtils.get("keywordsBlacklist")
      );

      if (this.settingUtils.get("eventBusSwitchProtyleSwitch")) {
        this.eventBus.on("switch-protyle", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusClickEditorcontentSwitch")) {
        this.eventBus.on("click-editorcontent", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusWsMainSwitch")) {
        this.eventBus.on("ws-main", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }
    }
  }

  reloadInterface() {
    // window.location.reload();
    showMessage(this.i18n.reload_hint);
  }

  async onload() {
    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    this.settingUtils = new SettingUtils(this, STORAGE_NAME);
    this.settingUtils.load();
    this.settingUtils.addItem({
      key: "totalSwitch",
      value: true,
      type: "checkbox",
      title: this.i18n.totalSwitch,
      description: this.i18n.totalSwitchDesc,
    });
    this.settingUtils.addItem({
      key: "eventBusSwitchProtyleSwitch",
      value: true,
      type: "checkbox",
      title: this.i18n.eventBusSwitchProtyleSwitch,
      description: this.i18n.eventBusSwitchProtyleSwitchDesc,
    });
    this.settingUtils.addItem({
      key: "eventBusClickEditorcontentSwitch",
      value: false,
      type: "checkbox",
      title: this.i18n.eventBusClickEditorcontentSwitch,
      description: this.i18n.eventBusClickEditorcontentSwitchDesc,
    });
    this.settingUtils.addItem({
      key: "eventBusWsMainSwitch",
      value: false,
      type: "checkbox",
      title: this.i18n.eventBusWsMainSwitch,
      description: this.i18n.eventBusWsMainSwitchDesc,
    });
    this.settingUtils.addItem({
      key: "keywordsBlacklist",
      value: "",
      type: "textarea",
      title: this.i18n.keywordsBlacklistTitle,
      description: this.i18n.keywordsBlacklistDesc,
    });
    this.settingUtils.addItem({
      key: "keywordsBlacklistNotes",
      value: "",
      type: "textarea",
      title: this.i18n.keywordsBlacklistNoteTitle,
      description: this.i18n.keywordsBlacklistNoteDesc,
    });
    this.settingUtils.addItem({
      key: "hint",
      value: "",
      type: "hint",
      title: this.i18n.hintTitle,
      description: this.i18n.hintDesc,
    });

    //     this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
    //     <path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
    //     </symbol>
    //     <symbol id="iconSaving" viewBox="0 0 32 32">
    //     <path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
    //     </symbol>`);

    //             const topBarElement = this.addTopBar({
    //                 icon: "iconFace",
    //                 title: this.i18n.addTopBarIcon,
    //                 position: "right",
    //                 callback: () => {
    //                     if (this.isMobile) {
    //                         this.addMenu();
    //                     } else {
    //                         let rect = topBarElement.getBoundingClientRect();
    //                         // 如果被隐藏，则使用更多按钮
    //                         if (rect.width === 0) {
    //                             rect = document.querySelector("#barMore").getBoundingClientRect();
    //                         }
    //                         if (rect.width === 0) {
    //                             rect = document.querySelector("#barPlugins").getBoundingClientRect();
    //                         }
    //                         this.addMenu(rect);
    //                     }
    //                 }
    //             });
    //   }

    //   private addMenu(rect?: DOMRect) {
    //     const menu = new Menu("topBarSample", () => {
    //         console.log(this.i18n.byeMenu);
    //     });
    //     if (!this.isMobile) {
    //         menu.addItem({
    //             icon: "iconFace",
    //             label: "Open Custom Tab",
    //             click: () => {
    //                 const tab = openTab({
    //                     app: this.app,
    //                     custom: {
    //                         icon: "iconFace",
    //                         title: "Custom Tab",
    //                         data: {
    //                             text: "This is my custom tab",
    //                         },
    //                         id: this.name + TAB_TYPE
    //                     },
    //                 });
    //                 console.log(tab);
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconImage",
    //             label: "Open Asset Tab(open help first)",
    //             click: () => {
    //                 const tab = openTab({
    //                     app: this.app,
    //                     asset: {
    //                         path: "assets/paragraph-20210512165953-ag1nib4.svg"
    //                     }
    //                 });
    //                 console.log(tab);
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconFile",
    //             label: "Open Doc Tab(open help first)",
    //             click: async () => {
    //                 const tab = await openTab({
    //                     app: this.app,
    //                     doc: {
    //                         id: "20200812220555-lj3enxa",
    //                     }
    //                 });
    //                 console.log(tab);
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconSearch",
    //             label: "Open Search Tab",
    //             click: () => {
    //                 const tab = openTab({
    //                     app: this.app,
    //                     search: {
    //                         k: "SiYuan"
    //                     }
    //                 });
    //                 console.log(tab);
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconRiffCard",
    //             label: "Open Card Tab",
    //             click: () => {
    //                 const tab = openTab({
    //                     app: this.app,
    //                     card: {
    //                         type: "all"
    //                     }
    //                 });
    //                 console.log(tab);
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconLayout",
    //             label: "Open Float Layer(open help first)",
    //             click: () => {
    //                 this.addFloatLayer({
    //                     ids: ["20210428212840-8rqwn5o", "20201225220955-l154bn4"],
    //                     defIds: ["20230415111858-vgohvf3", "20200813131152-0wk5akh"],
    //                     x: window.innerWidth - 768 - 120,
    //                     y: 32
    //                 });
    //             }
    //         });
    //         menu.addItem({
    //             icon: "iconOpenWindow",
    //             label: "Open Doc Window(open help first)",
    //             click: () => {
    //                 openWindow({
    //                     doc: {id: "20200812220555-lj3enxa"}
    //                 });
    //             }
    //         });
    //     } else {
    //         menu.addItem({
    //             icon: "iconFile",
    //             label: "Open Doc(open help first)",
    //             click: () => {
    //                 openMobileFileById(this.app, "20200812220555-lj3enxa");
    //             }
    //         });
    //     }
    //     menu.addItem({
    //         icon: "iconScrollHoriz",
    //         label: "Event Bus",
    //         type: "submenu",
    //         submenu: [{
    //             icon: "iconSelect",
    //             label: "On ws-main",
    //             click: () => {
    //                 this.eventBus.on("ws-main", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off ws-main",
    //             click: () => {
    //                 this.eventBus.off("ws-main", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On click-pdf",
    //             click: () => {
    //                 this.eventBus.on("click-pdf", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off click-pdf",
    //             click: () => {
    //                 this.eventBus.off("click-pdf", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On click-editorcontent",
    //             click: () => {
    //                 this.eventBus.on("click-editorcontent", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off click-editorcontent",
    //             click: () => {
    //                 this.eventBus.off("click-editorcontent", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On click-editortitleicon",
    //             click: () => {
    //                 this.eventBus.on("click-editortitleicon", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off click-editortitleicon",
    //             click: () => {
    //                 this.eventBus.off("click-editortitleicon", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-noneditableblock",
    //             click: () => {
    //                 this.eventBus.on("open-noneditableblock", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-noneditableblock",
    //             click: () => {
    //                 this.eventBus.off("open-noneditableblock", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On loaded-protyle-static",
    //             click: () => {
    //                 this.eventBus.on("loaded-protyle-static", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off loaded-protyle-static",
    //             click: () => {
    //                 this.eventBus.off("loaded-protyle-static", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On loaded-protyle-dynamic",
    //             click: () => {
    //                 this.eventBus.on("loaded-protyle-dynamic", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off loaded-protyle-dynamic",
    //             click: () => {
    //                 this.eventBus.off("loaded-protyle-dynamic", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On switch-protyle",
    //             click: () => {
    //                 this.eventBus.on("switch-protyle", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off switch-protyle",
    //             click: () => {
    //                 this.eventBus.off("switch-protyle", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On destroy-protyle",
    //             click: () => {
    //                 this.eventBus.on("destroy-protyle", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off destroy-protyle",
    //             click: () => {
    //                 this.eventBus.off("destroy-protyle", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-doctree",
    //             click: () => {
    //                 this.eventBus.on("open-menu-doctree", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-doctree",
    //             click: () => {
    //                 this.eventBus.off("open-menu-doctree", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-blockref",
    //             click: () => {
    //                 this.eventBus.on("open-menu-blockref", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-blockref",
    //             click: () => {
    //                 this.eventBus.off("open-menu-blockref", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-fileannotationref",
    //             click: () => {
    //                 this.eventBus.on("open-menu-fileannotationref", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-fileannotationref",
    //             click: () => {
    //                 this.eventBus.off("open-menu-fileannotationref", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-tag",
    //             click: () => {
    //                 this.eventBus.on("open-menu-tag", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-tag",
    //             click: () => {
    //                 this.eventBus.off("open-menu-tag", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-link",
    //             click: () => {
    //                 this.eventBus.on("open-menu-link", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-link",
    //             click: () => {
    //                 this.eventBus.off("open-menu-link", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-image",
    //             click: () => {
    //                 this.eventBus.on("open-menu-image", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-image",
    //             click: () => {
    //                 this.eventBus.off("open-menu-image", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-av",
    //             click: () => {
    //                 this.eventBus.on("open-menu-av", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-av",
    //             click: () => {
    //                 this.eventBus.off("open-menu-av", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-content",
    //             click: () => {
    //                 this.eventBus.on("open-menu-content", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-content",
    //             click: () => {
    //                 this.eventBus.off("open-menu-content", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-menu-breadcrumbmore",
    //             click: () => {
    //                 this.eventBus.on("open-menu-breadcrumbmore", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-menu-breadcrumbmore",
    //             click: () => {
    //                 this.eventBus.off("open-menu-breadcrumbmore", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On input-search",
    //             click: () => {
    //                 this.eventBus.on("input-search", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off input-search",
    //             click: () => {
    //                 this.eventBus.off("input-search", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-siyuan-url-plugin",
    //             click: () => {
    //                 this.eventBus.on("open-siyuan-url-plugin", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-siyuan-url-plugin",
    //             click: () => {
    //                 this.eventBus.off("open-siyuan-url-plugin", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconSelect",
    //             label: "On open-siyuan-url-block",
    //             click: () => {
    //                 this.eventBus.on("open-siyuan-url-block", this.eventBusLog);
    //             }
    //         }, {
    //             icon: "iconClose",
    //             label: "Off open-siyuan-url-block",
    //             click: () => {
    //                 this.eventBus.off("open-siyuan-url-block", this.eventBusLog);
    //             }
    //         }]
    //     });
    //     menu.addSeparator();
    //     menu.addItem({
    //         icon: "iconSettings",
    //         label: "Official Setting Dialog",
    //         click: () => {
    //             this.openSetting();
    //         }
    //     });
    //     menu.addItem({
    //         icon: "iconSparkles",
    //         label: this.data[STORAGE_NAME].readonlyText || "Readonly",
    //         type: "readonly",
    //     });
    //     if (this.isMobile) {
    //         menu.fullscreen();
    //     } else {
    //         menu.open({
    //             x: rect.right,
    //             y: rect.bottom,
    //             isLeft: true,
    //         });
    //     }
    // }

    //   private eventBusLog({ detail }: any) {
    //     console.log(detail);
  }

  onLayoutReady() {
    this.loadData(STORAGE_NAME);
    this.settingUtils.load();

    if (this.settingUtils.get("totalSwitch")) {
      this.init_event_bus_handler();
    }
    // showMessage("主播模式插件：很抱歉，目前由于发现一个小技术缺陷导致该插件暂时禁用。");
  }

  async onunload() {
    await this.settingUtils.save();
    // this.reloadInterface();
  }

  uninstall() {
    this.removeData(STORAGE_NAME);
    showMessage(this.i18n.uninstall_hint);
  }
}
