import type { RoastResult, RoastSettings } from "@/lib/types";
import { HEAT_LEVELS, MODE_MAP } from "@/lib/modes";

const W = 1080;
const H = 1350;
const SERIF = '"Instrument Serif", Georgia, serif';
const SANS = '"Inter Variable", system-ui, sans-serif';

const C = {
  coal: "#0e0c0b",
  card: "#171412",
  line: "#2a2420",
  ember: "#ff5a1f",
  cream: "#f5ede3",
  muted: "#a39b91",
  faint: "#6f675f",
  mint: "#7bd389",
};

function scoreColor(score: number) {
  if (score < 25) return "#f5c542";
  if (score < 50) return "#ff8a2a";
  if (score < 75) return "#ff4d2e";
  return "#e11d48";
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Find the largest font size where text fits within maxLines/maxHeight. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  maxWidth: number,
  maxHeight: number,
  start: number,
  min: number,
  lh = 1.12,
) {
  for (let size = start; size >= min; size -= 2) {
    ctx.font = font(size);
    const lines = wrap(ctx, text, maxWidth);
    if (lines.length * size * lh <= maxHeight) return { size, lines, lh };
  }
  ctx.font = font(min);
  const lines = wrap(ctx, text, maxWidth);
  const maxLines = Math.max(1, Math.floor(maxHeight / (min * lh)));
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return { size: min, lines, lh };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 40, 0, 0);
  g.addColorStop(0, "#c2410c");
  g.addColorStop(0.55, "#ff5a1f");
  g.addColorStop(1, "#ff8a2a");
  ctx.fillStyle = g;
  ctx.fill(new Path2D("M17 1c1.6 7.4 11 11.2 11 23.2C28 32.4 22.6 39 16 39S4 32.4 4 24.6c0-5.6 2.7-9.4 5.6-12.1 0 4.6 1.8 7.4 4.5 8.4C12.4 13.4 15.3 6.4 17 1z"));
  ctx.fillStyle = "#f5c542";
  ctx.fill(new Path2D("M16 20.5c1 4.6 5.6 6.2 5.6 11.4A5.6 5.6 0 0 1 16 37.5a5.6 5.6 0 0 1-5.6-5.6c0-3.8 2.8-6.6 5.6-11.4z"));
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.coal;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, -120, 40, W / 2, -120, 900);
  glow.addColorStop(0, "rgba(255,90,31,0.38)");
  glow.addColorStop(0.45, "rgba(255,90,31,0.10)");
  glow.addColorStop(1, "rgba(14,12,11,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // grain
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function drawHeader(ctx: CanvasRenderingContext2D, settings: RoastSettings, battle: boolean) {
  drawFlame(ctx, 80, 76, 1.5);
  ctx.fillStyle = C.cream;
  ctx.font = `italic 58px ${SERIF}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Roasted", 138, 128);

  const m = MODE_MAP[settings.mode];
  const heat = HEAT_LEVELS[settings.heat - 1];
  const chip = `${m.emoji}  ${battle ? "ROAST BATTLE" : `${m.name.toUpperCase()} ROAST`}`;
  ctx.font = `600 26px ${SANS}`;
  const cw = ctx.measureText(chip).width + 48;
  roundRect(ctx, W - 80 - cw, 78, cw, 60, 30);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = C.cream;
  ctx.fillText(chip, W - 80 - cw + 24, 117);

  ctx.font = `600 24px ${SANS}`;
  ctx.fillStyle = heat.color;
  const ht = `${heat.chili} ${heat.name.toUpperCase()}`;
  ctx.fillText(ht, W - 80 - ctx.measureText(ht).width, 182);
}

function drawGauge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, score: number, lw: number) {
  ctx.lineCap = "round";
  ctx.lineWidth = lw;
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.stroke();
  const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  g.addColorStop(0, "#f5c542");
  g.addColorStop(0.4, "#ff8a2a");
  g.addColorStop(0.7, "#ff4d2e");
  g.addColorStop(1, "#e11d48");
  ctx.strokeStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + (Math.max(score, 1) / 100) * Math.PI);
  ctx.stroke();
  const a = Math.PI + (score / 100) * Math.PI;
  ctx.strokeStyle = C.cream;
  ctx.lineWidth = lw / 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
  ctx.stroke();
  ctx.fillStyle = C.cream;
  ctx.beginPath();
  ctx.arc(cx, cy, lw / 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFooter(ctx: CanvasRenderingContext2D, verdict: string, site: string) {
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 1130);
  ctx.lineTo(W - 80, 1130);
  ctx.stroke();

  const fit = fitText(ctx, `“${verdict}”`, (s) => `500 ${s}px ${SANS}`, W - 160, 110, 40, 26, 1.3);
  ctx.fillStyle = C.cream;
  fit.lines.forEach((l, i) => ctx.fillText(l, 80, 1192 + i * fit.size * fit.lh));

  ctx.font = `500 24px ${SANS}`;
  ctx.fillStyle = C.faint;
  const s = `Get roasted at ${site}`;
  ctx.fillText(s, W - 80 - ctx.measureText(s).width, H - 50);
}

export async function renderShareCard(result: RoastResult, settings: RoastSettings): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all([
      document.fonts.load(`italic 80px ${SERIF}`),
      document.fonts.load(`80px ${SERIF}`),
      document.fonts.load(`600 30px ${SANS}`),
    ]).catch(() => {});
  }
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const site = window.location.host || "roasted.app";

  drawBackground(ctx);
  drawHeader(ctx, settings, result.kind === "battle");

  if (result.kind === "solo") {
    // Opener
    const fit = fitText(ctx, result.opener, (s) => `italic ${s}px ${SERIF}`, W - 160, 500, 104, 52, 1.08);
    ctx.fillStyle = C.cream;
    const top = 290;
    fit.lines.forEach((l, i) => ctx.fillText(l, 80, top + fit.size + i * fit.size * fit.lh));

    // Gauge
    const cy = 1010;
    drawGauge(ctx, 240, cy, 150, result.score, 30);
    ctx.fillStyle = C.cream;
    ctx.font = `110px ${SERIF}`;
    ctx.fillText(String(result.score), 470, cy - 20);
    const numW = ctx.measureText(String(result.score)).width;
    ctx.font = `48px ${SERIF}`;
    ctx.fillStyle = C.faint;
    ctx.fillText("/100", 470 + numW + 6, cy - 20);
    ctx.font = `700 30px ${SANS}`;
    ctx.fillStyle = scoreColor(result.score);
    ctx.fillText(result.scoreLabel.toUpperCase(), 474, cy + 30);
    ctx.font = `500 22px ${SANS}`;
    ctx.fillStyle = C.faint;
    ctx.fillText("COOKED METER", 474, cy - 140);
  } else {
    const fit = fitText(ctx, result.opener, (s) => `italic ${s}px ${SERIF}`, W - 160, 230, 72, 42, 1.08);
    ctx.fillStyle = C.cream;
    fit.lines.forEach((l, i) => ctx.fillText(l, 80, 270 + fit.size + i * fit.size * fit.lh));

    const colW = (W - 160 - 40) / 2;
    result.contenders.forEach((c, i) => {
      const x = 80 + i * (colW + 40);
      const y = 560;
      const loser = i === result.loserIndex;
      roundRect(ctx, x, y, colW, 520, 36);
      ctx.fillStyle = loser ? "rgba(255,90,31,0.10)" : C.card;
      ctx.fill();
      ctx.strokeStyle = loser ? C.ember : C.line;
      ctx.lineWidth = loser ? 4 : 2;
      ctx.stroke();

      ctx.fillStyle = C.cream;
      const nf = fitText(ctx, c.name, (s) => `${s}px ${SERIF}`, colW - 60, 70, 60, 34, 1);
      ctx.fillText(nf.lines[0], x + 30, y + 90);

      drawGauge(ctx, x + colW / 2, y + 330, 120, c.score, 24);
      ctx.textAlign = "center";
      ctx.font = `84px ${SERIF}`;
      ctx.fillStyle = C.cream;
      ctx.fillText(String(c.score), x + colW / 2, y + 430);
      ctx.font = `700 24px ${SANS}`;
      ctx.fillStyle = scoreColor(c.score);
      ctx.fillText(c.scoreLabel.toUpperCase(), x + colW / 2, y + 476);
      ctx.textAlign = "left";

      if (loser) {
        ctx.save();
        ctx.translate(x + colW - 40, y + 30);
        ctx.rotate(0.12);
        ctx.font = `800 26px ${SANS}`;
        const t = "MORE COOKED 💀";
        const tw = ctx.measureText(t).width + 36;
        roundRect(ctx, -tw, -10, tw, 52, 12);
        ctx.fillStyle = C.ember;
        ctx.fill();
        ctx.fillStyle = C.coal;
        ctx.fillText(t, -tw + 18, 25);
        ctx.restore();
      }
    });

    ctx.beginPath();
    ctx.arc(W / 2, 820, 46, 0, Math.PI * 2);
    ctx.fillStyle = C.coal;
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `italic 52px ${SERIF}`;
    ctx.fillStyle = C.ember;
    ctx.textAlign = "center";
    ctx.fillText("vs", W / 2, 834);
    ctx.textAlign = "left";
  }

  drawFooter(ctx, result.verdict, site);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't create image"))), "image/png"),
  );
}
