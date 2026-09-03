(function () {
  const CFD = [
    { x: 0.6, cl: 0.42, cd: 0.018, ld: 23.3 },
    { x: 0.8, cl: 0.4, cd: 0.021, ld: 19.0 },
    { x: 0.95, cl: 0.37, cd: 0.034, ld: 10.9 },
    { x: 1.05, cl: 0.31, cd: 0.048, ld: 6.5 },
    { x: 1.2, cl: 0.28, cd: 0.041, ld: 6.8 },
    { x: 1.5, cl: 0.24, cd: 0.033, ld: 7.3 },
    { x: 2.0, cl: 0.19, cd: 0.028, ld: 6.8 },
    { x: 2.5, cl: 0.16, cd: 0.026, ld: 6.2 },
    { x: 3.0, cl: 0.14, cd: 0.025, ld: 5.6 },
  ];
  const HEAT = [
    { x: 0, nose: 2, le: 1 },
    { x: 10, nose: 8, le: 4 },
    { x: 20, nose: 21, le: 11 },
    { x: 30, nose: 46, le: 22 },
    { x: 40, nose: 71, le: 34 },
    { x: 50, nose: 88, le: 41 },
    { x: 60, nose: 79, le: 37 },
    { x: 80, nose: 54, le: 26 },
    { x: 100, nose: 33, le: 16 },
    { x: 120, nose: 21, le: 11 },
    { x: 150, nose: 14, le: 7 },
    { x: 180, nose: 9, le: 5 },
  ];
  const FEA = [
    { x: 0, vm: 186, allow: 240 },
    { x: 0.1, vm: 162, allow: 240 },
    { x: 0.2, vm: 141, allow: 240 },
    { x: 0.3, vm: 118, allow: 240 },
    { x: 0.4, vm: 97, allow: 240 },
    { x: 0.5, vm: 78, allow: 240 },
    { x: 0.6, vm: 61, allow: 240 },
    { x: 0.7, vm: 46, allow: 240 },
    { x: 0.8, vm: 33, allow: 240 },
    { x: 0.9, vm: 21, allow: 240 },
    { x: 1, vm: 12, allow: 240 },
  ];

  const COLORS = ["#f0eee8", "#9a9790", "#6e8aa0"];

  function draw(canvas, series, xKey, yKeys, xLabel) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight || 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const pad = { t: 16, r: 16, b: 36, l: 44 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    const xs = series.map((r) => r[xKey]);
    const ys = yKeys.flatMap((k) => series.map((r) => r[k]));
    const xmin = Math.min(...xs);
    const xmax = Math.max(...xs);
    const ymin = 0;
    const ymax = Math.max(...ys) * 1.12;
    const x = (v) => pad.l + ((v - xmin) / (xmax - xmin || 1)) * iw;
    const y = (v) => pad.t + ih - ((v - ymin) / (ymax - ymin || 1)) * ih;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(240,238,232,0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yy = pad.t + (ih * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(pad.l + iw, yy);
      ctx.stroke();
    }
    yKeys.forEach((key, i) => {
      ctx.beginPath();
      ctx.strokeStyle = COLORS[i];
      ctx.lineWidth = 1.6;
      series.forEach((row, n) => {
        const px = x(row[xKey]);
        const py = y(row[key]);
        if (n === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
    ctx.fillStyle = "#6e6b66";
    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.fillText(xLabel, pad.l, h - 12);
    ctx.fillText(String(ymax.toFixed(0)), 6, pad.t + 8);
    ctx.fillText("0", 18, pad.t + ih);
  }

  function mount(id, series, xKey, yKeys, xLabel) {
    const el = document.getElementById(id);
    if (!el) return;
    const paint = () => draw(el, series, xKey, yKeys, xLabel);
    paint();
    window.addEventListener("resize", paint);
  }

  mount("chart-cfd", CFD, "x", ["cl", "cd", "ld"], "Mach");
  mount("chart-heat", HEAT, "x", ["nose", "le"], "Time (s)");
  mount("chart-fea", FEA, "x", ["vm", "allow"], "Span");
})();
