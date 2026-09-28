/* Get started: one step per slide. Arrows, the step rail, the keyboard and a swipe move between steps. */
(function () {
  var tour = document.getElementById("tour");
  if (!tour) return;
  var track = tour.querySelector(".tour-track"), slides = tour.querySelectorAll(".tslide");
  var tabs = tour.querySelectorAll(".tour-rail button"), count = tour.querySelector(".tour-count");
  var prev = tour.querySelector(".prev"), next = tour.querySelector(".next"), n = slides.length, cur = 0;
  var view = tour.querySelector(".tour-view");
  function pad(i) { return (i < 10 ? "0" : "") + i; }
  function go(i) {
    cur = Math.max(0, Math.min(n - 1, i));
    track.style.transform = "translateX(calc(" + (-100 * cur) + "% - " + (120 * cur) + "px))";
    tabs.forEach(function (t, k) {
      t.classList.toggle("on", k === cur); t.classList.toggle("done", k < cur);
      t.setAttribute("aria-selected", k === cur ? "true" : "false");
    });
    slides.forEach(function (s, k) { s.setAttribute("aria-hidden", k === cur ? "false" : "true"); s.classList.toggle("on", k === cur); });
    count.textContent = pad(cur + 1) + " / " + pad(n);
    view.style.height = slides[cur].offsetHeight + "px";
    prev.disabled = cur === 0; next.disabled = cur === n - 1;
    var active = tour.querySelector(".tour-rail button.on");
    if (active && active.scrollIntoView && tour.dataset.ready) {
      var rail = active.parentNode;
      rail.scrollTo({left: active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2, behavior: "smooth"});
    }
  }
  prev.addEventListener("click", function () { go(cur - 1); });
  next.addEventListener("click", function () { go(cur + 1); });
  tabs.forEach(function (t, k) { t.addEventListener("click", function () { go(k); }); });
  document.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return;
    var r = tour.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === "ArrowRight") go(cur + 1);
    if (e.key === "ArrowLeft") go(cur - 1);
  });
  var x0 = null, y0 = null;
  view.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive: true});
  view.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  window.addEventListener("resize", function () { view.style.height = slides[cur].offsetHeight + "px"; });
  go(0);
  tour.dataset.ready = "1";
})();
