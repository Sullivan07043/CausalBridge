var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var SVGNS = "http://www.w3.org/2000/svg", HOLD = 45000;
function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
function sv(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
/* One example: part of the given graph (codes on the nodes) and a table that names every drawn node.
   Nodes light up from causes to effects; each unnamed node types the name CausalBridge wrote. */
function Scene(root, spec) {
  var timers = [], N = {}, E = [], R = {}, loop = null;
  root.innerHTML = "";
  root.classList.add("scene", "sc-" + spec.layout, "sc-" + (spec.place || "side"));
  if (spec.cls) root.classList.add(spec.cls);
  var head = el("div", "demo-head"); head.appendChild(el("b", "", spec.title)); head.appendChild(el("span", "", spec.meta)); root.appendChild(head);
  if (spec.note) root.appendChild(el("p", "ex-note", spec.note));
  var key = el("div", "demo-key");
  key.innerHTML = '<span><i class="k-given"></i>named by human</span><span><i class="k-out"></i>named by CausalBridge</span>' +
    (spec.latents ? '<span><i class="k-lat"></i>hidden cause</span>' : "");
  root.appendChild(key);
  var body = el("div", "sbody"), wrap = el("div", "stagewrap"), stage = el("div", "stage"), tbox = el("div", "tbox");
  wrap.appendChild(stage); body.appendChild(wrap); body.appendChild(tbox); root.appendChild(body);
  if (spec.h) stage.style.minHeight = spec.h + "px";
  if (spec.h && spec.place !== "side") stage.style.height = spec.h + "px";
  var svg = sv("svg", {"class": "edges"}); stage.appendChild(svg);
  var mid = "m" + Math.random().toString(36).slice(2);
  var mk = sv("marker", {id: mid, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", markerUnits: "userSpaceOnUse", orient: "auto"});
  mk.appendChild(sv("path", {d: "M0,0 L10,5 L0,10 z", "class": "ahead"})); var defs = sv("defs", {}); defs.appendChild(mk); svg.appendChild(defs);
  var byK = {}; spec.nodes.forEach(function (n) { byK[n.k] = n; });
  /* For each unnamed node in causal order: parents, siblings through a common cause, the node itself
     (its name typed), its children, and the other parents of those children. */
  var steps = [], seen = {}, first = [];
  function lightStep(k) { if (!seen[k]) { seen[k] = 1; first.push(k); steps.push({k: k, act: "light"}); } }
  spec.targets.forEach(function (t) {
    var par = spec.edges.filter(function (e) { return e[1] === t; }).map(function (e) { return e[0]; });
    par.forEach(lightStep);
    par.forEach(function (p) { spec.edges.forEach(function (e) { if (e[0] === p && e[1] !== t) lightStep(e[1]); }); });
    lightStep(t); steps.push({k: t, act: "type"});
    var ch = spec.edges.filter(function (e) { return e[0] === t; }).map(function (e) { return e[1]; });
    ch.forEach(lightStep);
    ch.forEach(function (c) { spec.edges.forEach(function (e) { if (e[1] === c && e[0] !== t) lightStep(e[0]); }); });
  });
  function node(n, parent) {
    var d = el("div", "gn" + (n.lat ? " lat" : "") + (n.out ? " unk" : ""), n.k);
    parent.appendChild(d); N[n.k] = d; return d;
  }
  if (spec.layout === "layers") {
    spec.nodes.forEach(function (n) { node(n, stage); });
  } else {
    var cols = el("div", "tcolumns"); stage.appendChild(cols);
    spec.groups.forEach(function (g) {
      var c = el("div", "tcolumn"); node(byK[g[0]], c);
      var list = el("div", "titems"); g.slice(1).forEach(function (k) { node(byK[k], list); }); c.appendChild(list); cols.appendChild(c);
    });
  }
  spec.edges.forEach(function (e) { var p = sv("path", {"class": "edge", "marker-end": "url(#" + mid + ")"}); svg.appendChild(p); E.push({a: e[0], b: e[1], p: p}); });
  if (!spec.tgrid) { var cols2 = el("div", "demo-cols"); cols2.appendChild(el("span", "", spec.cols[0])); cols2.appendChild(el("span", "", spec.cols[1])); tbox.appendChild(cols2); }
  var rows = el("div", "demo-rows"), gcol = {};
  if (spec.tgrid) {
    rows.classList.add("rgrid"); rows.style.gridTemplateColumns = "repeat(" + spec.groups.length + ", minmax(0, 1fr))";
    spec.groups.forEach(function (g, i) {
      var c = el("div", "rcol"); rows.appendChild(c); g.forEach(function (k) { gcol[k] = c; });
      if (spec.gtitles) c.appendChild(el("div", "row sec", spec.gtitles[i]));
    });
  }
  tbox.appendChild(rows);
  var listed = first.concat(spec.tableAll ? spec.nodes.map(function (n) { return n.k; }).filter(function (k) { return !seen[k]; }) : []);
  listed.forEach(function (k) {
    var n = byK[k], host = gcol[k] || rows;
    if (n.head) host.appendChild(el("div", "row sec", n.head));
    var row = el("div", "row" + (n.out ? " todo" : "") + (n.lat ? " latrow" : "")), nm = el("span", "nm");
    row.appendChild(el("span", "id", k)); row.appendChild(nm); host.appendChild(row); R[k] = {row: row, nm: nm};
    row.addEventListener("mouseenter", function () { N[k].classList.add("hot"); });
    row.addEventListener("mouseleave", function () { N[k].classList.remove("hot"); });
  });
  var foot = el("div", "demo-foot"), sum = el("span"), replay = el("button", "replay", "↻ Replay");
  foot.appendChild(sum); foot.appendChild(replay); root.appendChild(foot);
  if (spec.cmd) root.appendChild(el("div", "cmd", spec.cmd));
  function box(k) {
    var r = N[k].getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top, cx: (r.left + r.right) / 2 - s.left, cy: (r.top + r.bottom) / 2 - s.top};
  }
  function place() {
    if (spec.layout !== "layers") return;
    var W = stage.clientWidth, H = stage.clientHeight;
    spec.nodes.forEach(function (n) {
      var d = N[n.k];
      d.style.left = Math.round(14 + (W - 28) * n.x - d.offsetWidth / 2) + "px";
      d.style.top = Math.round(14 + (H - 28 - d.offsetHeight) * n.y) + "px";
    });
  }
  function draw() {
    place();
    var s = stage.getBoundingClientRect(); svg.setAttribute("width", s.width); svg.setAttribute("height", s.height);
    E.forEach(function (e) {
      var a = box(e.a), b = box(e.b), d;
      if (spec.layout === "layers") {
        if (b.t < a.b - 4) {
          var dip = Math.max(a.b, b.b) + 30;
          d = "M" + a.cx + "," + a.b + " C" + a.cx + "," + dip + " " + b.cx + "," + dip + " " + b.cx + "," + (b.b + 1);
        } else {
          var y1 = a.b, y2 = b.t - 1, m = (y1 + y2) / 2;
          d = "M" + a.cx + "," + y1 + " C" + a.cx + "," + m + " " + b.cx + "," + m + " " + b.cx + "," + y2;
        }
      } else {
        d = "M" + (a.l + 16) + "," + a.b + " V" + b.cy + " H" + (b.l - 1);
      }
      e.p.setAttribute("d", d);
    });
  }
  function light(k) {
    N[k].classList.add("lit"); if (R[k]) R[k].row.classList.add("lit");
    E.forEach(function (e) { if ((e.a === k || e.b === k) && N[e.a].classList.contains("lit") && N[e.b].classList.contains("lit")) e.p.classList.add("lit"); });
  }
  function blanket(t) {
    var par = spec.edges.filter(function (e) { return e[1] === t; }).map(function (e) { return e[0]; });
    var ch = spec.edges.filter(function (e) { return e[0] === t; }).map(function (e) { return e[1]; });
    var nodes = {}, edges = [];
    E.forEach(function (e) {
      if (e.b === t || e.a === t || par.indexOf(e.a) >= 0 || ch.indexOf(e.b) >= 0) { edges.push(e); nodes[e.a] = 1; nodes[e.b] = 1; }
    });
    delete nodes[t];
    return {nodes: Object.keys(nodes), edges: edges};
  }
  function focus(k, on) {
    var mb = blanket(k);
    N[k].classList.toggle("hot", on);
    mb.nodes.forEach(function (m) { N[m].classList.toggle("mb", on); });
    mb.edges.forEach(function (e) { e.p.classList.toggle("focus", on); });
  }
  function fill(k) {
    var n = byK[k], nm = R[k].nm;
    nm.textContent = n.out || n.label;
    if (n.out && n.ok) nm.appendChild(el("span", "ok", "✓ true name"));
    else if (n.out && n.truth) nm.appendChild(el("span", "truth", "true: " + n.truth));
  }
  function reset() {
    timers.forEach(clearTimeout); timers = []; clearTimeout(loop); sum.textContent = "";
    listed.forEach(function (k) {
      var n = byK[k]; N[k].classList.remove("lit", "hot", "mb"); R[k].row.classList.remove("lit", "active");
      R[k].nm.innerHTML = ""; if (n.out) R[k].nm.appendChild(el("span", "pill", "unnamed")); else R[k].nm.textContent = n.label;
    });
    E.forEach(function (e) { e.p.classList.remove("lit", "focus"); });
    draw();
  }
  var api = {done: null};
  function play() {
    if (needFix) { needFix = false; fixHeight(); }
    reset();
    if (still) { first.forEach(function (k) { light(k); fill(k); }); sum.textContent = spec.sum; return; }
    var t = 600;
    steps.forEach(function (st) {
      var k = st.k, n = byK[k], r = R[k];
      if (st.act === "light") { timers.push(setTimeout(function () { light(k); }, t)); t += 330; return; }
      timers.push(setTimeout(function () { focus(k, true); r.row.classList.add("active"); r.nm.textContent = ""; r.nm.classList.add("caret"); }, t + 150));
      t += 420;
      var step = Math.max(12, Math.min(30, 900 / n.out.length));
      for (var i = 1; i <= n.out.length; i++) {
        (function (c) { timers.push(setTimeout(function () { r.nm.textContent = n.out.slice(0, c); }, t)); })(i);
        t += step;
      }
      timers.push(setTimeout(function () { r.nm.classList.remove("caret"); fill(k); r.row.classList.remove("active"); focus(k, false); }, t + 200));
      t += 600;
    });
    timers.push(setTimeout(function () { sum.textContent = spec.sum; }, t));
    loop = setTimeout(function () { (api.done || play)(); }, t + HOLD);
  }
  replay.addEventListener("click", play);
  window.addEventListener("resize", draw);
  var needFix = false;
  function fixHeight() {
    listed.forEach(function (k) { R[k].row.style.minHeight = ""; if (byK[k].out) fill(k); });
    listed.forEach(function (k) { R[k].row.style.minHeight = R[k].row.offsetHeight + "px"; });
    if (spec.place === "side") { stage.style.height = ""; stage.style.height = Math.max(spec.h || 0, tbox.offsetHeight - 30) + "px"; }
  }
  api.play = play; api.reset = reset; api.draw = draw;
  fixHeight(); reset();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    if (timers.length) { needFix = true; return; }
    fixHeight(); reset();
  });
  window.addEventListener("resize", function () { needFix = true; });
  return api;
}
function whenVisible(elm, fn) {
  if (!("IntersectionObserver" in window)) { fn(); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, {threshold: 0.25});
  io.observe(elm);
}
/* Hero carousel: each example plays, holds 45 seconds, then the next one starts. */
var DATA = {"vehicle": {"layout": "layers", "place": "side", "h": 300, "title": "One drive of a car", "meta": "comma2k19 · 2400 time steps · 12 channels", "note": "You give the vehicle dynamics as the graph. The two unnamed channels light up with their parents, children and siblings through a common cause.", "cols": ["Channel", "Name"], "nodes": [{"k": "steer", "x": 0.13, "y": 0, "label": "steering wheel angle"}, {"k": "gyro_x", "x": 0.42, "y": 0, "label": "roll rate"}, {"k": "acc_x", "x": 0.76, "y": 0, "out": "longitudinal acceleration", "ok": true}, {"k": "gyro_z", "x": 0.13, "y": 0.5, "label": "yaw rate"}, {"k": "acc_y", "x": 0.42, "y": 0.5, "label": "lateral acceleration"}, {"k": "can_speed", "x": 0.76, "y": 0.5, "label": "vehicle speed"}, {"k": "wheel_fl", "x": 0.4, "y": 1, "out": "front left wheel speed", "ok": true}, {"k": "wheel_fr", "x": 0.57, "y": 1, "label": "front right wheel speed"}, {"k": "wheel_rl", "x": 0.74, "y": 1, "label": "rear left wheel speed"}, {"k": "wheel_rr", "x": 0.91, "y": 1, "label": "rear right wheel speed"}, {"k": "acc_z", "x": 0.07, "y": 1, "label": "vertical acceleration"}, {"k": "gyro_y", "x": 0.22, "y": 1, "label": "pitch rate"}], "edges": [["steer", "gyro_z"], ["steer", "acc_y"], ["acc_x", "can_speed"], ["can_speed", "wheel_fl"], ["can_speed", "wheel_fr"], ["can_speed", "wheel_rl"], ["can_speed", "wheel_rr"], ["can_speed", "gyro_z"], ["gyro_x", "acc_y"]], "sum": "2 of 2 names match the true channel names", "cmd": "causalbridge name data.csv --names names.csv --graph graph.csv --data timeseries --out result", "targets": ["acc_x", "wheel_fl"], "tableAll": true}, "big5": {"layout": "layers", "place": "stack", "tgrid": true, "latents": true, "title": "Big Five personality test", "meta": "IPIP · 50 items · 10 item names hidden", "note": "You give the scoring key as the graph: which items belong to which factor, without the factor names. Drawn here: three of the five factors, each with four of its ten items.", "cols": ["Variable", "Name"], "groups": [["E", "E3", "E5", "E7", "E1"], ["A", "A2", "A4", "A9", "A8"], ["C", "C1", "C5", "C9", "C4"]], "nodes": [{"k": "E", "lat": true, "out": "Social talk", "truth": "extraversion", "head": "Factor E", "x": 0.16666666666666666, "y": 0}, {"k": "E3", "label": "I feel comfortable around people.", "x": 0.041666666666666664, "y": 1}, {"k": "E5", "label": "I start conversations.", "x": 0.125, "y": 1}, {"k": "E7", "label": "I talk to a lot of different people at parties.", "x": 0.20833333333333334, "y": 1}, {"k": "E1", "out": "I enjoy being the center of attention.", "truth": "I am the life of the party.", "x": 0.2916666666666667, "y": 1}, {"k": "A", "lat": true, "out": "Empathetic concern", "truth": "agreeableness", "head": "Factor A", "x": 0.5, "y": 0}, {"k": "A2", "label": "I am interested in people.", "x": 0.375, "y": 1}, {"k": "A4", "label": "I sympathize with others' feelings.", "x": 0.4583333333333333, "y": 1}, {"k": "A9", "label": "I feel others' emotions.", "x": 0.5416666666666666, "y": 1}, {"k": "A8", "out": "I care about the well-being of others.", "truth": "I take time out for others.", "x": 0.625, "y": 1}, {"k": "C", "lat": true, "out": "Attention to detail", "truth": "conscientiousness", "head": "Factor C", "x": 0.8333333333333333, "y": 0}, {"k": "C1", "label": "I am always prepared.", "x": 0.7083333333333333, "y": 1}, {"k": "C5", "label": "I get chores done right away.", "x": 0.7916666666666666, "y": 1}, {"k": "C9", "label": "I follow a schedule.", "x": 0.875, "y": 1}, {"k": "C4", "out": "I tend to lose things easily.", "truth": "I make a mess of things.", "x": 0.9583333333333333, "y": 1}], "edges": [["E", "E3"], ["E", "E5"], ["E", "E7"], ["E", "E1"], ["A", "A2"], ["A", "A4"], ["A", "A9"], ["A", "A8"], ["C", "C1"], ["C", "C5"], ["C", "C9"], ["C", "C4"]], "sum": "In this run a judge model matched all 5 factor names and 8 of the 10 hidden item names.", "targets": ["E", "E1", "A", "A8", "C", "C4"], "h": 128}};
["vehicle", "big5"].forEach(function (k) { var r = document.getElementById({vehicle: "ex-vehicle", big5: "ex-survey"}[k]); var sc = Scene(r, DATA[k]); whenVisible(r, function () { sc.play(); }); });
