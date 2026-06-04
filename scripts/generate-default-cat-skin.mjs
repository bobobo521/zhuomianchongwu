import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const root = path.resolve(import.meta.dirname, '..');
const assetsDir = path.join(root, 'src', 'assets');
const scale = 2;

const colors = {
  line: [59, 45, 40, 255],
  fur: [239, 158, 78, 255],
  furLight: [255, 213, 143, 255],
  cream: [255, 235, 190, 255],
  cheek: [240, 140, 120, 120],
  red: [240, 98, 85, 255],
  teal: [122, 195, 201, 255],
  yellow: [255, 211, 92, 255],
  brown: [181, 121, 66, 255],
  green: [139, 209, 121, 255],
  shadow: [39, 31, 28, 42],
  white: [255, 248, 228, 255]
};

const normalAssets = [
  ['pet-idle.png', 'idle'],
  ['pet-talk.png', 'talk'],
  ['pet-happy.png', 'happy'],
  ['pet-thinking.png', 'thinking'],
  ['pet-sleep.png', 'sleep'],
  ['pet-wake.png', 'wake'],
  ['pet-hover.png', 'hover'],
  ['pet-click.png', 'click'],
  ['pet-drag.png', 'drag'],
  ['pet-surprised.png', 'surprised'],
  ['pet-confirm.png', 'confirm'],
  ['pet-error.png', 'error']
];

const gameAssets = [
  ['game-enter.png', 'gameEnter'],
  ['game-balloon-idle.png', 'balloonIdle'],
  ['game-balloon-aim.png', 'balloonAim'],
  ['game-balloon-shoot.png', 'balloonShoot'],
  ['game-balloon-hit.png', 'balloonHit'],
  ['game-balloon-miss.png', 'balloonMiss'],
  ['game-balloon-celebrate.png', 'balloonCelebrate'],
  ['game-exit.png', 'gameExit'],
  ['game-arrow.png', 'arrow'],
  ['game-target.png', 'target'],
  ['game-target-hit.png', 'targetHit'],
  ['game-hit-effect.png', 'hitEffect']
];

fs.mkdirSync(assetsDir, { recursive: true });

normalAssets.forEach(([filename, action]) => {
  writePng(filename, 512, (canvas) => drawNormalCat(canvas, action));
});

gameAssets.forEach(([filename, action]) => {
  writePng(filename, 768, (canvas) => drawGameAsset(canvas, action));
});

function writePng(filename, size, draw) {
  const canvas = createCanvas(size * scale, size * scale);
  canvas.scale = scale;
  draw(canvas);

  const png = encodePng(downsample(canvas, size, scale));
  const target = path.join(assetsDir, filename);

  fs.writeFileSync(target, png);
  console.log(`generated ${path.relative(root, target)}`);
}

function drawNormalCat(canvas, action) {
  const pose = getPose(action);
  const cx = 256 + pose.x;
  const cy = 258 + pose.y;

  ellipse(canvas, 256, 438, pose.shadow, 22, colors.shadow);
  line(canvas, 160, 300, 94, 366, 34, colors.line);
  line(canvas, 158, 300, 98, 362, 20, colors.fur);
  ellipse(canvas, cx, 324 + pose.y, 112, 128, colors.fur, colors.line, 14);
  ellipse(canvas, cx - 42, 394 + pose.y, 36, 22, colors.cream, colors.line, 8);
  ellipse(canvas, cx + 42, 394 + pose.y, 36, 22, colors.cream, colors.line, 8);
  triangle(canvas, cx - 96, cy - 70, cx - 142, cy - 154, cx - 38, cy - 112, colors.fur, colors.line, 14);
  triangle(canvas, cx + 96, cy - 70, cx + 142, cy - 154, cx + 38, cy - 112, colors.fur, colors.line, 14);
  triangle(canvas, cx - 96, cy - 94, cx - 116, cy - 132, cx - 66, cy - 112, colors.furLight);
  triangle(canvas, cx + 96, cy - 94, cx + 116, cy - 132, cx + 66, cy - 112, colors.furLight);
  roundedRect(canvas, cx - 112, cy - 80, 224, 208, 78, colors.cream, colors.line, 14);
  ellipse(canvas, cx + 36, cy - 44, 72, 42, [244, 176, 85, 190]);
  ellipse(canvas, cx - 48, cy - 50, 52, 26, [255, 246, 220, 170]);
  face(canvas, cx, cy, action);
}

function drawGameAsset(canvas, action) {
  if (action === 'arrow') {
    line(canvas, 90, 384, 594, 384, 30, colors.line);
    line(canvas, 90, 384, 594, 384, 16, colors.cream);
    triangle(canvas, 584, 326, 704, 384, 584, 442, colors.red, colors.line, 16);
    triangle(canvas, 52, 326, 160, 384, 52, 442, colors.teal, colors.line, 12);
    return;
  }

  if (action === 'target' || action === 'targetHit') {
    const hit = action === 'targetHit';
    ellipse(canvas, 384, 654, 130, 28, colors.shadow);
    roundedRect(canvas, 212, 120, 344, 464, 80, hit ? colors.yellow : colors.green, colors.line, 22);
    ellipse(canvas, 384, 340, 142, 142, colors.white, colors.line, 16);
    ellipse(canvas, 384, 340, 78, 78, colors.red, colors.line, 12);
    ellipse(canvas, 384, 340, 28, 28, colors.white);
    line(canvas, 384, 584, 384, 674, 20, colors.line);

    if (hit) {
      line(canvas, 358, 210, 410, 294, 14, colors.line);
      line(canvas, 410, 294, 370, 358, 14, colors.line);
      line(canvas, 370, 358, 428, 454, 14, colors.line);
      line(canvas, 428, 454, 414, 536, 14, colors.line);
    }
    return;
  }

  if (action === 'hitEffect') {
    star(canvas, 384, 384, 314, 86, 12, colors.yellow, colors.line, 22);
    ellipse(canvas, 384, 384, 84, 84, colors.white, colors.line, 14);
    return;
  }

  ellipse(canvas, 384, 698, 170, 30, colors.shadow);
  ellipse(canvas, 384, 178, 164, 142, colors.yellow, colors.line, 22);
  ellipse(canvas, 320, 168, 54, 124, colors.red);
  ellipse(canvas, 448, 168, 54, 124, colors.teal);
  polygon(canvas, [[300, 294], [468, 294], [432, 356], [336, 356]], colors.yellow, colors.line, 16);
  line(canvas, 284, 356, 226, 534, 16, colors.line);
  line(canvas, 484, 356, 542, 534, 16, colors.line);
  roundedRect(canvas, 226, 520, 316, 116, 28, colors.brown, colors.line, 22);
  drawMiniCat(canvas, action);
  gameAccessory(canvas, action);
}

function drawMiniCat(canvas, action) {
  const cx = 384;
  const cy = 505;

  ellipse(canvas, cx, cy + 112, 66, 78, colors.fur, colors.line, 10);
  triangle(canvas, cx - 60, cy - 34, cx - 90, cy - 86, cx - 24, cy - 60, colors.fur, colors.line, 10);
  triangle(canvas, cx + 60, cy - 34, cx + 90, cy - 86, cx + 24, cy - 60, colors.fur, colors.line, 10);
  roundedRect(canvas, cx - 70, cy - 42, 140, 130, 48, colors.cream, colors.line, 10);
  ellipse(canvas, cx + 24, cy - 18, 42, 24, [244, 176, 85, 190]);
  face(canvas, cx, cy + 12, action, 0.62);
}

function face(canvas, cx, cy, action, faceScale = 1) {
  const s = faceScale;
  const leftX = cx - 42 * s;
  const rightX = cx + 42 * s;
  const eyeY = cy - 18 * s;

  if (['happy', 'confirm', 'balloonCelebrate', 'balloonHit'].includes(action)) {
    line(canvas, leftX - 14 * s, eyeY, leftX + 14 * s, eyeY + 10 * s, 8 * s, colors.line);
    line(canvas, rightX - 14 * s, eyeY + 10 * s, rightX + 14 * s, eyeY, 8 * s, colors.line);
    arcSmile(canvas, cx, cy + 32 * s, 38 * s, 22 * s, colors.line, 9 * s);
  } else if (action === 'sleep') {
    line(canvas, leftX - 15 * s, eyeY, leftX + 15 * s, eyeY, 8 * s, colors.line);
    line(canvas, rightX - 15 * s, eyeY, rightX + 15 * s, eyeY, 8 * s, colors.line);
    arcSmile(canvas, cx, cy + 30 * s, 22 * s, 10 * s, colors.line, 8 * s);
  } else if (['surprised', 'error', 'balloonMiss'].includes(action)) {
    ellipse(canvas, leftX, eyeY, 15 * s, 15 * s, colors.line);
    ellipse(canvas, rightX, eyeY, 15 * s, 15 * s, colors.line);
    ellipse(canvas, cx, cy + 36 * s, 16 * s, 20 * s, colors.line);
  } else {
    ellipse(canvas, leftX, eyeY, 12 * s, 12 * s, colors.line);
    ellipse(canvas, rightX, eyeY, 12 * s, 12 * s, colors.line);
    arcSmile(canvas, cx, cy + 30 * s, 42 * s, 26 * s, colors.line, 9 * s);
  }

  triangle(canvas, cx - 10 * s, cy + 10 * s, cx + 10 * s, cy + 10 * s, cx, cy + 24 * s, [215, 107, 92, 255]);

  if (['talk', 'happy', 'confirm'].includes(action)) {
    ellipse(canvas, cx - 68 * s, cy + 18 * s, 14 * s, 10 * s, colors.cheek);
    ellipse(canvas, cx + 68 * s, cy + 18 * s, 14 * s, 10 * s, colors.cheek);
  }

  if (action === 'thinking' || action === 'balloonAim') {
    ellipse(canvas, cx + 92 * s, cy - 98 * s, 10 * s, 10 * s, colors.teal);
    ellipse(canvas, cx + 122 * s, cy - 128 * s, 14 * s, 14 * s, colors.teal);
  }
}

function gameAccessory(canvas, action) {
  if (action === 'balloonShoot') {
    line(canvas, 260, 470, 120, 470, 18, colors.line);
    triangle(canvas, 110, 432, 38, 470, 110, 508, colors.red, colors.line, 12);
  }

  if (action === 'balloonAim') {
    line(canvas, 262, 470, 142, 470, 14, colors.line);
    ellipse(canvas, 104, 470, 36, 36, [0, 0, 0, 0], colors.red, 10);
  }

  if (action === 'gameEnter') {
    line(canvas, 604, 198, 646, 164, 18, colors.yellow);
    line(canvas, 618, 248, 676, 248, 18, colors.yellow);
  }

  if (action === 'gameExit') {
    arcSmile(canvas, 654, 232, 88, 42, colors.teal, 16);
  }

  if (action === 'balloonCelebrate') {
    ellipse(canvas, 622, 420, 18, 18, colors.yellow);
    ellipse(canvas, 666, 456, 14, 14, colors.red);
    ellipse(canvas, 610, 500, 12, 12, colors.teal);
  }
}

function getPose(action) {
  return {
    x: action === 'drag' ? 18 : 0,
    y: action === 'click' ? 10 : action === 'wake' ? -8 : 0,
    shadow: action === 'wake' || action === 'hover' ? 78 : 92
  };
}

function createCanvas(width, height) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
    scale: 1
  };
}

function downsample(source, size, factor) {
  const target = createCanvas(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sum = [0, 0, 0, 0];

      for (let yy = 0; yy < factor; yy += 1) {
        for (let xx = 0; xx < factor; xx += 1) {
          const index = ((y * factor + yy) * source.width + (x * factor + xx)) * 4;
          sum[0] += source.data[index];
          sum[1] += source.data[index + 1];
          sum[2] += source.data[index + 2];
          sum[3] += source.data[index + 3];
        }
      }

      const targetIndex = (y * size + x) * 4;
      const count = factor * factor;
      target.data[targetIndex] = Math.round(sum[0] / count);
      target.data[targetIndex + 1] = Math.round(sum[1] / count);
      target.data[targetIndex + 2] = Math.round(sum[2] / count);
      target.data[targetIndex + 3] = Math.round(sum[3] / count);
    }
  }

  return target;
}

function px(canvas, value) {
  return Math.round(value * canvas.scale);
}

function blend(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
    return;
  }

  const index = (y * canvas.width + x) * 4;
  const alpha = color[3] / 255;
  const inverse = 1 - alpha;
  const existingAlpha = canvas.data[index + 3] / 255;
  const outputAlpha = alpha + existingAlpha * inverse;

  if (outputAlpha <= 0) {
    return;
  }

  canvas.data[index] = Math.round((color[0] * alpha + canvas.data[index] * existingAlpha * inverse) / outputAlpha);
  canvas.data[index + 1] = Math.round((color[1] * alpha + canvas.data[index + 1] * existingAlpha * inverse) / outputAlpha);
  canvas.data[index + 2] = Math.round((color[2] * alpha + canvas.data[index + 2] * existingAlpha * inverse) / outputAlpha);
  canvas.data[index + 3] = Math.round(outputAlpha * 255);
}

function ellipse(canvas, cx, cy, rx, ry, fill, stroke = null, strokeWidth = 0) {
  const x0 = px(canvas, cx - rx - strokeWidth);
  const x1 = px(canvas, cx + rx + strokeWidth);
  const y0 = px(canvas, cy - ry - strokeWidth);
  const y1 = px(canvas, cy + ry + strokeWidth);
  const scx = px(canvas, cx);
  const scy = px(canvas, cy);
  const srx = rx * canvas.scale;
  const sry = ry * canvas.scale;
  const innerRx = Math.max(0, (rx - strokeWidth) * canvas.scale);
  const innerRy = Math.max(0, (ry - strokeWidth) * canvas.scale);

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const outer = ((x - scx) / srx) ** 2 + ((y - scy) / sry) ** 2;

      if (outer > 1) {
        continue;
      }

      if (stroke && strokeWidth > 0) {
        const inner = innerRx > 0 && innerRy > 0 ? ((x - scx) / innerRx) ** 2 + ((y - scy) / innerRy) ** 2 : 2;

        blend(canvas, x, y, inner <= 1 ? fill : stroke);
      } else {
        blend(canvas, x, y, fill);
      }
    }
  }
}

function roundedRect(canvas, x, y, width, height, radius, fill, stroke = null, strokeWidth = 0) {
  const x0 = px(canvas, x - strokeWidth);
  const x1 = px(canvas, x + width + strokeWidth);
  const y0 = px(canvas, y - strokeWidth);
  const y1 = px(canvas, y + height + strokeWidth);
  const sx = px(canvas, x);
  const sy = px(canvas, y);
  const sw = width * canvas.scale;
  const sh = height * canvas.scale;
  const sr = radius * canvas.scale;
  const ss = strokeWidth * canvas.scale;

  for (let py = y0; py <= y1; py += 1) {
    for (let pxl = x0; pxl <= x1; pxl += 1) {
      const dx = Math.max(sx - pxl, 0, pxl - (sx + sw));
      const dy = Math.max(sy - py, 0, py - (sy + sh));
      const corner = Math.hypot(Math.max(Math.abs(pxl - (sx + sw / 2)) - (sw / 2 - sr), 0), Math.max(Math.abs(py - (sy + sh / 2)) - (sh / 2 - sr), 0));
      const inside = dx === 0 && dy === 0 && corner <= sr;

      if (!inside) {
        continue;
      }

      const innerCorner = Math.hypot(Math.max(Math.abs(pxl - (sx + sw / 2)) - (sw / 2 - sr + ss), 0), Math.max(Math.abs(py - (sy + sh / 2)) - (sh / 2 - sr + ss), 0));
      const inner = pxl >= sx + ss && pxl <= sx + sw - ss && py >= sy + ss && py <= sy + sh - ss && innerCorner <= Math.max(0, sr - ss);

      blend(canvas, pxl, py, stroke && !inner ? stroke : fill);
    }
  }
}

function triangle(canvas, ax, ay, bx, by, cx, cy, fill, stroke = null, strokeWidth = 0) {
  polygon(canvas, [[ax, ay], [bx, by], [cx, cy]], fill, stroke, strokeWidth);
}

function polygon(canvas, points, fill, stroke = null, strokeWidth = 0) {
  const scaled = points.map(([x, y]) => [px(canvas, x), px(canvas, y)]);
  const xs = scaled.map(([x]) => x);
  const ys = scaled.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (pointInPolygon(x, y, scaled)) {
        blend(canvas, x, y, fill);
      }
    }
  }

  if (stroke && strokeWidth > 0) {
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      line(canvas, current[0], current[1], next[0], next[1], strokeWidth, stroke);
    }
  }
}

function pointInPolygon(x, y, points) {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function line(canvas, x1, y1, x2, y2, width, color) {
  const sx1 = px(canvas, x1);
  const sy1 = px(canvas, y1);
  const sx2 = px(canvas, x2);
  const sy2 = px(canvas, y2);
  const radius = (width * canvas.scale) / 2;
  const minX = Math.floor(Math.min(sx1, sx2) - radius);
  const maxX = Math.ceil(Math.max(sx1, sx2) + radius);
  const minY = Math.floor(Math.min(sy1, sy2) - radius);
  const maxY = Math.ceil(Math.max(sy1, sy2) + radius);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (distanceToSegment(x, y, sx1, sy1, sx2, sy2) <= radius) {
        blend(canvas, x, y, color);
      }
    }
  }
}

function arcSmile(canvas, cx, cy, rx, ry, color, width) {
  const steps = 40;
  let previous = null;

  for (let index = 0; index <= steps; index += 1) {
    const t = Math.PI * (index / steps);
    const x = cx - Math.cos(t) * rx;
    const y = cy + Math.sin(t) * ry;

    if (previous) {
      line(canvas, previous[0], previous[1], x, y, width, color);
    }

    previous = [x, y];
  }
}

function star(canvas, cx, cy, outerRadius, innerRadius, points, fill, stroke, strokeWidth) {
  const vertices = [];

  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (Math.PI * index) / points;

    vertices.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }

  polygon(canvas, vertices, fill, stroke, strokeWidth);
}

function distanceToSegment(pxValue, pyValue, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(pxValue - x1, pyValue - y1);
  }

  const t = Math.max(0, Math.min(1, ((pxValue - x1) * dx + (pyValue - y1) * dy) / (dx * dx + dy * dy)));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;

  return Math.hypot(pxValue - projectionX, pyValue - projectionY);
}

function encodePng(canvas) {
  const rows = [];

  for (let y = 0; y < canvas.height; y += 1) {
    const row = Buffer.alloc(1 + canvas.width * 4);

    row[0] = 0;

    for (let x = 0; x < canvas.width; x += 1) {
      const source = (y * canvas.width + x) * 4;
      const target = 1 + x * 4;

      row[target] = canvas.data[source];
      row[target + 1] = canvas.data[source + 1];
      row[target + 2] = canvas.data[source + 2];
      row[target + 3] = canvas.data[source + 3];
    }

    rows.push(row);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr(canvas.width, canvas.height)),
    pngChunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function ihdr(width, height) {
  const buffer = Buffer.alloc(13);

  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;

  return buffer;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}
