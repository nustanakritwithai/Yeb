/* เพื่อนหัดเย็บ V0.1 — สลับหน้า + stub ความคืบหน้า */

(function () {
  "use strict";

  var STORAGE_KEY = "yeb-progress-v0";

  var DEFAULT_PROGRESS = {
    version: 1,
    skills: [],
    updatedAt: null
  };

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PROGRESS;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return DEFAULT_PROGRESS;
      if (!Array.isArray(data.skills)) data.skills = [];
      return data;
    } catch (e) {
      return DEFAULT_PROGRESS;
    }
  }

  function saveProgress(data) {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* localStorage อาจปิดอยู่ — ข้ามได้ */
    }
  }

  /* stub ว่างไว้ให้เวอร์ชันถัดไปใช้ */
  var progress = loadProgress();
  if (!progress.skills) progress.skills = [];
  saveProgress(progress);

  function showScreen(name) {
    var screens = document.querySelectorAll(".screen");
    var i;
    for (i = 0; i < screens.length; i++) {
      var s = screens[i];
      var match = s.getAttribute("data-screen") === name;
      if (match) {
        s.classList.add("is-active");
        s.removeAttribute("hidden");
      } else {
        s.classList.remove("is-active");
        s.setAttribute("hidden", "");
      }
    }
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-go]");
    if (!btn) return;
    var target = btn.getAttribute("data-go");
    if (!target) return;
    ev.preventDefault();
    showScreen(target);
  });

  /* เปิดหน้าแรกตอนโหลด */
  showScreen("home");
})();
