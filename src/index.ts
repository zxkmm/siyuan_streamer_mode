import { Plugin, showMessage, getFrontend } from "siyuan";
import "@/index.scss";

import { SettingUtils } from "./libs/setting-utils";

const STORAGE_NAME = "menu-config";

var packageNameClass = document.getElementsByClassName("ft__on-surface");
var isStreamerModeReveal = false;

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

    if (!isStreamerModeReveal) {
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

      // // 清除上个高亮
      // CSS.highlights.clear();

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
  }

  init_event_bus_handler() {
    isStreamerModeReveal = false;

    if (this.settingUtils.get("totalSwitch")) {
      const _blacklist_words_ = this.convertStringToArray(
        this.settingUtils.get("keywordsBlacklist")
      );

      if (this.settingUtils.get("doubleBlock")) {
        if (this.settingUtils.get("eventBusSwitchProtyleSwitch")) {
          this.eventBus.on("switch-protyle", () => {
            setTimeout(() => {
              this.blackOutKeyWords(_blacklist_words_);
              setTimeout(() => {
                this.blackOutKeyWords(_blacklist_words_);
              }, 100); // before 2nd time
              //TODO: this shouldnt hard coded...... it's a ok value here on my computer but should not hard coded
            }, 0); // b4 1st tm
          });
        }
      } else {
        if (this.settingUtils.get("eventBusSwitchProtyleSwitch")) {
          this.eventBus.on("switch-protyle", () => {
            this.blackOutKeyWords(_blacklist_words_);
          });
        }
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

      if (this.settingUtils.get("eventBusLoadedProtyleStatic")) {
        this.eventBus.on("loaded-protyle-static", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusLoadedProtyleDynamic")) {
        this.eventBus.on("loaded-protyle-dynamic", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }
    }
  }

  offEventBusHandler() {
    isStreamerModeReveal = true;

    if (this.settingUtils.get("totalSwitch")) {
      const _blacklist_words_ = this.convertStringToArray(
        this.settingUtils.get("keywordsBlacklist")
      );

      if (this.settingUtils.get("doubleBlock")) {
        if (this.settingUtils.get("eventBusSwitchProtyleSwitch")) {
          this.eventBus.off("switch-protyle", () => {
            setTimeout(() => {
              this.blackOutKeyWords(_blacklist_words_);
              setTimeout(() => {
                this.blackOutKeyWords(_blacklist_words_);
              }, 100); // before 2nd time
              //TODO: this shouldnt hard coded...... it's a ok value here on my computer but should not hard coded
            }, 0); // b4 1st tm
          });
        }
      } else {
        if (this.settingUtils.get("eventBusSwitchProtyleSwitch")) {
          this.eventBus.off("switch-protyle", () => {
            this.blackOutKeyWords(_blacklist_words_);
          });
        }
      }

      if (this.settingUtils.get("eventBusClickEditorcontentSwitch")) {
        this.eventBus.off("click-editorcontent", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusWsMainSwitch")) {
        this.eventBus.off("ws-main", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusLoadedProtyleStatic")) {
        this.eventBus.off("loaded-protyle-static", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }

      if (this.settingUtils.get("eventBusLoadedProtyleDynamic")) {
        this.eventBus.off("loaded-protyle-dynamic", () =>
          this.blackOutKeyWords(_blacklist_words_)
        );
      }
    }

    CSS.highlights.clear();
  }

  reloadInterface() {
    // window.location.reload();
    showMessage(this.i18n.reload_hint);
  }

  swapStreamerMode() {
    if (isStreamerModeReveal) {
      this.init_event_bus_handler();
      const _blacklist_words_ = this.convertStringToArray(
        this.settingUtils.get("keywordsBlacklist")
      );

      this.blackOutKeyWords(_blacklist_words_); //do it once in anyway.
      isStreamerModeReveal = false;
    } else {
      const userConfirmed = window.confirm(this.i18n.revealDoubleCheck);
      if (userConfirmed) {
        this.offEventBusHandler();
        isStreamerModeReveal = true;
      }
    }
  }

  async protectBreadCrumb() {
    if (this.settingUtils.get("totalSwitch") && !isStreamerModeReveal) {
      const targetNode = document.querySelector(".protyle-breadcrumb__bar");
      // console.log(targetNode);

      const config = { attributes: true, childList: true, subtree: true };

      const callback = async (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            const _blacklist_words_ = this.convertStringToArray(
              await this.settingUtils.get("keywordsBlacklist")
            );

            // console.log(this);
            this.blackOutKeyWords(_blacklist_words_); //do it once in anyway.
            // } else if (mutation.type === "attributes") {
            //   console.log(mutation.attributeName);
            // console.log("did");
          }
        }
      };

      const observer = new MutationObserver(callback);

      observer.observe(targetNode, config);
    }
  }

  async onload() {
    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    this.settingUtils = new SettingUtils(this, STORAGE_NAME);
    this.settingUtils.load();
    this.settingUtils.addItem({
      key: "warn",
      value: "",
      type: "hint",
      title: this.i18n.warnTitle,
      description: this.i18n.warnDesc,
    });
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
      key: "eventBusLoadedProtyleStatic",
      value: true,
      type: "checkbox",
      title: this.i18n.eventBusLoadedProtyleStatic,
      description: this.i18n.eventBusLoadedProtyleStaticDesc,
    });
    this.settingUtils.addItem({
      key: "eventBusLoadedProtyleDynamic",
      value: false,
      type: "checkbox",
      title: this.i18n.eventBusLoadedProtyleDynamic,
      description: this.i18n.eventBusLoadedProtyleDynamicDesc,
    });
    this.settingUtils.addItem({
      key: "doubleBlock",
      value: true,
      type: "checkbox",
      title: this.i18n.doubleBlock,
      description: this.i18n.doubleBlockDesc,
    });
    this.settingUtils.addItem({
      key: "listeningBreadcrumb",
      value: true,
      type: "checkbox",
      title: this.i18n.listeningBreadcrumb,
      description: this.i18n.listeningBreadcrumbDesc,
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

    this.addIcons(`
    <symbol id="iconStreamer" viewBox="0 0 16 16">
        <path d="M3 5a2 2 0 0 0-2 2v.5H.5a.5.5 0 0 0 0 1H1V9a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3 1 1 0 1 1 2 0 3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-.5h.5a.5.5 0 0 0 0-1H15V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-1.888 1.338A1.99 1.99 0 0 0 8 6a1.99 1.99 0 0 0-1.112.338A2 2 0 0 0 5 5H3zm0 1h.941c.264 0 .348.356.112.474l-.457.228a2 2 0 0 0-.894.894l-.228.457C2.356 8.289 2 8.205 2 7.94V7a1 1 0 0 1 1-1z"></path>
        </symbol>
        `);

    const topBarElement = this.addTopBar({
      icon: "iconStreamer",
      title: isStreamerModeReveal
        ? this.i18n.streamerModeUnreveal
        : this.i18n.streamerModeReveal,
      position: "right",
      callback: () => {
        if (this.isMobile) {
          // this.addMenu();
          // console.log("mobile");
        } else {
          let rect = topBarElement.getBoundingClientRect();
          // 如果被隐藏，则使用更多按钮
          if (rect.width === 0) {
            rect = document.querySelector("#barMore").getBoundingClientRect();
          }
          if (rect.width === 0) {
            rect = document
              .querySelector("#barPlugins")
              .getBoundingClientRect();
          }
          this.swapStreamerMode();
        }
      },
    });
  }

  onLayoutReady() {
    // Check if the browser is Firefox
    if (navigator.userAgent.includes("Firefox")) {
      alert(this.i18n.forbidFirefoxAlert);
      return;
    }

    this.loadData(STORAGE_NAME);
    this.settingUtils.load();

    if (this.settingUtils.get("totalSwitch")) {
      const _blacklist_words_ = this.convertStringToArray(
        this.settingUtils.get("keywordsBlacklist")
      );

      this.blackOutKeyWords(_blacklist_words_); //do it once in anyway.

      this.init_event_bus_handler();
    }

    if (this.settingUtils.get("listeningBreadcrumb")) {
      this.protectBreadCrumb();
    }
  }

  async onunload() {
    CSS.highlights.clear();
    await this.settingUtils.save();
    // this.reloadInterface();
  }

  uninstall() {
    CSS.highlights.clear();
    this.removeData(STORAGE_NAME);
    showMessage(this.i18n.uninstall_hint);
  }
}
