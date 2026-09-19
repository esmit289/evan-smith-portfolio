// Hero chart: wins vs. strikeouts looking for 25 Pineville Porcupines pitchers.
// Values come from my internship analysis. No names are attached to any point.
(function () {
  var wins = [1, 3, 0, 0, 3, 0, 1, 0, 2, 3, 0, 0, 0, 0, 1, 0, 0, 3, 1, 0, 0, 2, 0, 0, 1];
  var kl   = [2, 5, 0, 8, 7, 2, 4, 0, 7, 9, 3, 3, 0, 3, 11, 4, 1, 11, 1, 1, 1, 13, 0, 0, 5];
  var R = 0.69, P = "0.0001", SLOPE = 2.3648, INTERCEPT = 2.0536;

  var svg = document.getElementById("hero-chart");
  var tip = document.getElementById("chart-tip");
  if (!svg) return;

  var NS = "http://www.w3.org/2000/svg";
  var W = 640, H = 440, M = { l: 58, r: 20, t: 16, b: 58 };
  var X0 = -0.25, X1 = 3.25, Y0 = -1, Y1 = 14.5;
  var sx = function (v) { return M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r); };
  var sy = function (v) { return H - M.b - ((v - Y0) / (Y1 - Y0)) * (H - M.t - M.b); };

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  }

  // Grid and axes
  var grid = el("g", { "class": "chart-grid" });
  [0, 5, 10].forEach(function (t) {
    el("line", { x1: M.l, x2: W - M.r, y1: sy(t), y2: sy(t) }, grid);
    var lab = el("text", { x: M.l - 12, y: sy(t) + 5, "text-anchor": "end", "class": "chart-tick" });
    lab.textContent = t;
  });
  [0, 1, 2, 3].forEach(function (t) {
    var lab = el("text", { x: sx(t), y: H - M.b + 26, "text-anchor": "middle", "class": "chart-tick" });
    lab.textContent = t;
  });
  var axes = el("g", { "class": "chart-axis" });
  el("line", { x1: M.l, x2: W - M.r, y1: H - M.b, y2: H - M.b }, axes);
  el("line", { x1: M.l, x2: M.l, y1: M.t, y2: H - M.b }, axes);

  var xl = el("text", { x: (M.l + W - M.r) / 2, y: H - 10, "text-anchor": "middle", "class": "chart-label" });
  xl.textContent = "Wins";
  var yl = el("text", { transform: "translate(16 " + (M.t + (H - M.t - M.b) / 2) + ") rotate(-90)", "text-anchor": "middle", "class": "chart-label" });
  yl.textContent = "Strikeouts looking";

  // Best-fit line, drawn before the dots so the dots sit on top
  var x1 = sx(0), y1 = sy(INTERCEPT), x2 = sx(3), y2 = sy(INTERCEPT + SLOPE * 3);
  var len = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  var fit = el("line", { x1: x1, y1: y1, x2: x2, y2: y2, "class": "chart-fit" });
  fit.style.setProperty("--len", len);
  // Legend for the line, top right where the plot is empty
  var lx = sx(2.35), ly = sy(13.6);
  el("line", { x1: lx, x2: lx + 34, y1: ly - 6, y2: ly - 6, "class": "chart-legend-line" });
  var fl = el("text", { x: lx + 44, y: ly, "class": "chart-fit-label" });
  fl.textContent = "Best fit";

  // Group identical points so overlaps stay honest: bigger dot = more pitchers
  var groups = {};
  wins.forEach(function (w, i) {
    var key = w + "," + kl[i];
    groups[key] = groups[key] || { w: w, k: kl[i], n: 0 };
    groups[key].n += 1;
  });
  var list = Object.keys(groups).map(function (k) { return groups[k]; })
    .sort(function (a, b) { return a.w - b.w || a.k - b.k; });

  var holder = svg.parentNode;
  list.forEach(function (g, i) {
    var c = el("circle", { cx: sx(g.w), cy: sy(g.k), r: 6.5 + (g.n - 1) * 2.4, "class": "chart-dot", "aria-hidden": "true" });
    c.style.setProperty("--i", i);
    var text = g.w + (g.w === 1 ? " win, " : " wins, ") + g.k + " strikeouts looking" +
      (g.n > 1 ? " (" + g.n + " pitchers)" : "");
    function show() {
      var b = c.getBoundingClientRect(), h = holder.getBoundingClientRect();
      tip.textContent = text;
      tip.style.left = (b.left - h.left + b.width / 2) + "px";
      tip.style.top = (b.top - h.top) + "px";
      tip.hidden = false;
    }
    c.addEventListener("pointerenter", show);
    c.addEventListener("pointerdown", show);
    c.addEventListener("pointerleave", function () { tip.hidden = true; });
  });
  document.addEventListener("pointerdown", function (e) {
    if (!e.target.classList || !e.target.classList.contains("chart-dot")) tip.hidden = true;
  });

  // Result, top left where the plot is empty
  var r = el("text", { x: sx(-0.1), y: sy(13.2), "class": "chart-r" });
  r.textContent = "r = " + R.toFixed(2);
  var s = el("text", { x: sx(-0.1), y: sy(13.2) + 30, "class": "chart-stats" });
  s.textContent = "p = " + P + ", n = 25 pitchers";
})();
