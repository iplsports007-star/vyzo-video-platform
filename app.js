/* =========================================================
   VYZO — APP.JS
   Master Frontend Controller
   ========================================================= */

"use strict";

const VYZO = {
  appName: "VYZO",
  version: "1.0.0",

  state: {
    category: "All",
    search: "",
    theme: "dark",
    currentPage: "home",
    loggedIn: false,
    user: null
  },

  init() {
    this.loadState();
    this.bindGlobalEvents();
    console.log("VYZO initialized:", this.version);
  },

  loadState() {
    try {
      const saved = localStorage.getItem("vyzo_state");

      if (saved) {
        const data = JSON.parse(saved);

        this.state = {
          ...this.state,
          ...data
        };
      }
    } catch (error) {
      console.warn("VYZO state could not be loaded.", error);
    }
  },

  saveState() {
    try {
      localStorage.setItem(
        "vyzo_state",
        JSON.stringify(this.state)
      );
    } catch (error) {
      console.warn("VYZO state could not be saved.", error);
    }
  },

  setPage(page) {
    this.state.currentPage = page;
    this.saveState();

    window.dispatchEvent(
      new CustomEvent("vyzo:pagechange", {
        detail: { page }
      })
    );
  },

  setCategory(category) {
    this.state.category = category;
    this.saveState();

    window.dispatchEvent(
      new CustomEvent("vyzo:categorychange", {
        detail: { category }
      })
    );
  },

  search(query) {
    this.state.search = String(query || "").trim();
    this.saveState();

    window.dispatchEvent(
      new CustomEvent("vyzo:search", {
        detail: {
          query: this.state.search
        }
      })
    );
  },

  login(user) {
    this.state.loggedIn = true;
    this.state.user = user || null;
    this.saveState();

    window.dispatchEvent(
      new CustomEvent("vyzo:login", {
        detail: { user: this.state.user }
      })
    );
  },

  logout() {
    this.state.loggedIn = false;
    this.state.user = null;
    this.saveState();

    window.dispatchEvent(
      new CustomEvent("vyzo:logout")
    );
  },

  setTheme(theme) {
    this.state.theme = theme === "light"
      ? "light"
      : "dark";

    document.documentElement.dataset.theme =
      this.state.theme;

    this.saveState();
  },

  clearLocalState() {
    localStorage.removeItem("vyzo_state");

    this.state = {
      category: "All",
      search: "",
      theme: "dark",
      currentPage: "home",
      loggedIn: false,
      user: null
    };
  },

  bindGlobalEvents() {

    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest("[data-vyzo-action]");

        if (!button) return;

        const action =
          button.dataset.vyzoAction;

        this.handleAction(action, button);
      }
    );

    window.addEventListener(
      "vyzo:search",
      event => {
        console.log(
          "VYZO search:",
          event.detail.query
        );
      }
    );

    window.addEventListener(
      "vyzo:pagechange",
      event => {
        console.log(
          "VYZO page:",
          event.detail.page
        );
      }
    );
  },

  handleAction(action, element) {

    switch (action) {

      case "home":
        this.setPage("home");
        break;

      case "shorts":
        this.setPage("shorts");
        break;

      case "subscriptions":
        this.setPage("subscriptions");
        break;

      case "history":
        this.setPage("history");
        break;

      case "watch-later":
        this.setPage("watch-later");
        break;

      case "liked":
        this.setPage("liked");
        break;

      case "playlists":
        this.setPage("playlists");
        break;

      case "create":
        this.openCreate();
        break;

      case "profile":
        this.openProfile();
        break;

      case "notifications":
        this.openNotifications();
        break;

      case "settings":
        this.openSettings();
        break;

      default:
        console.log(
          "Unknown VYZO action:",
          action,
          element
        );
    }
  },

  openCreate() {
    this.openModal("createModal");
  },

  openProfile() {
    this.openModal("profileModal");
  },

  openNotifications() {
    this.openModal("notificationModal");
  },

  openSettings() {
    this.openModal("settingsModal");
  },

  openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
      console.warn(
        "VYZO modal not found:",
        id
      );
      return;
    }

    modal.classList.add("show");
  },

  closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.remove("show");
    }
  },

  toast(message) {

    const toast =
      document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(
      this._toastTimer
    );

    this._toastTimer =
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2200);
  }
};


/* =========================================================
   VIDEO DATA LAYER
   ========================================================= */

const VYZO_DATA = {

  videos: [],

  shorts: [],

  addVideo(video) {

    if (!video || typeof video !== "object") {
      return false;
    }

    const item = {
      id:
        video.id ||
        Date.now(),

      title:
        video.title ||
        "Untitled Video",

      description:
        video.description ||
        "",

      category:
        video.category ||
        "Entertainment",

      channel:
        video.channel ||
        "VYZO Creator",

      views:
        Number(video.views || 0),

      likes:
        Number(video.likes || 0),

      comments:
        Number(video.comments || 0),

      createdAt:
        video.createdAt ||
        new Date().toISOString()
    };

    this.videos.push(item);

    return item;
  },

  addShort(short) {

    if (!short || typeof short !== "object") {
      return false;
    }

    const item = {
      id:
        short.id ||
        Date.now(),

      title:
        short.title ||
        "Untitled Short",

      channel:
        short.channel ||
        "VYZO Creator",

      views:
        Number(short.views || 0),

      likes:
        Number(short.likes || 0),

      createdAt:
        short.createdAt ||
        new Date().toISOString()
    };

    this.shorts.push(item);

    return item;
  },

  search(query) {

    const q =
      String(query || "")
        .trim()
        .toLowerCase();

    if (!q) {
      return this.videos;
    }

    return this.videos.filter(video => {

      const searchable = [
        video.title,
        video.description,
        video.category,
        video.channel
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  },

  byCategory(category) {

    if (!category || category === "All") {
      return this.videos;
    }

    return this.videos.filter(
      video =>
        video.category === category
    );
  }
};


/* =========================================================
   LOCAL USER ACTIONS
   ========================================================= */

const VYZO_USER = {

  likedVideos: new Set(),

  watchLater: new Set(),

  history: [],

  playlists: [],

  toggleLike(videoId) {

    if (this.likedVideos.has(videoId)) {

      this.likedVideos.delete(videoId);

      return false;
    }

    this.likedVideos.add(videoId);

    return true;
  },

  toggleWatchLater(videoId) {

    if (this.watchLater.has(videoId)) {

      this.watchLater.delete(videoId);

      return false;
    }

    this.watchLater.add(videoId);

    return true;
  },

  addHistory(videoId) {

    this.history =
      this.history.filter(
        id => id !== videoId
      );

    this.history.unshift(videoId);

    if (this.history.length > 100) {
      this.history =
        this.history.slice(0, 100);
    }
  }
};


/* =========================================================
   BACKEND ADAPTER
   ========================================================= */

const VYZO_API = {

  baseURL: "",

  async request(
    endpoint,
    options = {}
  ) {

    if (!this.baseURL) {

      console.warn(
        "VYZO backend is not connected yet:",
        endpoint
      );

      throw new Error(
        "VYZO backend not configured"
      );
    }

    const response =
      await fetch(
        this.baseURL + endpoint,
        {
          headers: {
            "Content-Type":
              "application/json",

            ...(options.headers || {})
          },

          ...options
        }
      );

    if (!response.ok) {
      throw new Error(
        `API error ${response.status}`
      );
    }

    return response.json();
  },

  async getVideos(params = {}) {

    const query =
      new URLSearchParams(params)
        .toString();

    return this.request(
      `/videos${query ? "?" + query : ""}`
    );
  },

  async getVideo(id) {

    return this.request(
      `/videos/${encodeURIComponent(id)}`
    );
  },

  async createVideo(data) {

    return this.request(
      "/videos",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    );
  },

  async likeVideo(id) {

    return this.request(
      `/videos/${encodeURIComponent(id)}/like`,
      {
        method: "POST"
      }
    );
  },

  async subscribe(channelId) {

    return this.request(
      `/channels/${encodeURIComponent(channelId)}/subscribe`,
      {
        method: "POST"
      }
    );
  }
};


/* =========================================================
   SAFE HELPERS
   ========================================================= */

function vyzoEscapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}


function vyzoCloseModal(id) {

  VYZO.closeModal(id);
}


function vyzoShowToast(message) {

  VYZO.toast(message);
}


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    VYZO.init();

    const savedTheme =
      VYZO.state.theme;

    VYZO.setTheme(
      savedTheme || "dark"
    );

    console.log(
      "🎬 VYZO — Watch. Create. Connect."
    );

  }
);
