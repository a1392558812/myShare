/**
 * 白色描边绘制
 * @param {CanvasRenderingContext2D} ctx - 目标画布上下文
 * @param {HTMLCanvasElement} contentCanvas - 内容画布（含已绘制内容）
 * @param {number} strokeW - 描边宽度（物理像素）
 */
const _applyWhiteStroke = (ctx, contentCanvas, strokeW) => {
  if (strokeW <= 0) return;

  const w = contentCanvas.width;
  const h = contentCanvas.height;

  const mark = document.createElement("canvas");
  mark.width = w;
  mark.height = h;
  const mctx = mark.getContext("2d");
  mctx.drawImage(contentCanvas, 0, 0);
  mctx.globalCompositeOperation = "source-in";
  mctx.fillStyle = "#fff";
  mctx.fillRect(0, 0, w, h);

  const steps = Math.max(8, Math.round(strokeW * 1.2));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.drawImage(mark, Math.cos(a) * strokeW, Math.sin(a) * strokeW);
  }
};

/**
 * 将文字渲染为带白色描边的 PNG dataURL，返回 dataURL 及 CSS 像素尺寸
 * @param {string} text - 文本内容
 * @param {object} [options]
 * @param {number} [options.fontSize=120] - 字体大小(px)
 * @param {string} [options.color='#333'] - 字体颜色
 * @param {number} [options.padding=20] - 内边距
 * @param {number} [options.strokeWidth=4] - 描边宽度(px)
 * @returns {{ dataURL: string, width: number, height: number }}
 */
export const textToImage = (
  text,
  { fontSize = 120, color = "#333", padding = 20, strokeWidth = 4 } = {},
) => {
  const dpr = Math.max(2, window.devicePixelRatio || 1);
  const font = `${fontSize * dpr}px "PingFang SC","Microsoft YaHei",system-ui,sans-serif`;
  const strokeW = strokeWidth * dpr;
  const pad = padding * dpr + strokeW;

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  mctx.font = font;
  const metrics = mctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize * dpr * 1.2;

  const canvasWidth = textWidth + pad * 2;
  const canvasHeight = textHeight + pad * 2;

  const contentTmp = document.createElement("canvas");
  contentTmp.width = canvasWidth;
  contentTmp.height = canvasHeight;
  const tmpCtx = contentTmp.getContext("2d");
  tmpCtx.font = font;
  tmpCtx.textAlign = "center";
  tmpCtx.textBaseline = "middle";
  tmpCtx.fillStyle = color;
  tmpCtx.fillText(text, canvasWidth / 2, canvasHeight / 2);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  _applyWhiteStroke(ctx, contentTmp, strokeW);
  ctx.drawImage(contentTmp, 0, 0);

  return {
    dataURL: canvas.toDataURL("image/png"),
    width: canvasWidth / dpr,
    height: canvasHeight / dpr,
  };
};

/**
 * 将网络图片转为带白色描边的 PNG dataURL，支持缩放模式
 * @param {string} imgUrl - 图片 URL
 * @param {object} [options]
 * @param {number} [options.width=300] - 目标宽度(px)
 * @param {number} [options.height=200] - 目标高度(px)
 * @param {string} [options.fitMode='aspectFit'] - 缩放模式: scaleToFill | aspectFit | aspectFill | widthFix | heightFix
 * @param {number} [options.strokeWidth=4] - 描边宽度(px)
 * @returns {Promise<{ dataURL: string, width: number, height: number }>}
 */
export const imageUrlToImage = (
  imgUrl,
  { width = 300, height = 200, fitMode = "aspectFit", strokeWidth = 4 } = {},
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const dpr = Math.max(2, window.devicePixelRatio || 1);
      const strokeW = strokeWidth * dpr;

      let renderW, renderH;
      const pxW = () => renderW * dpr + strokeW * 2;
      const pxH = () => renderH * dpr + strokeW * 2;

      const contentTmp = document.createElement("canvas");
      const tmpCtx = contentTmp.getContext("2d");

      if (fitMode === "scaleToFill") {
        renderW = width;
        renderH = height;
        contentTmp.width = pxW();
        contentTmp.height = pxH();
        tmpCtx.drawImage(img, strokeW, strokeW, renderW * dpr, renderH * dpr);
      } else if (fitMode === "aspectFill") {
        renderW = width;
        renderH = height;
        const scale = Math.max(width / nw, height / nh);
        const srcW = width / scale;
        const srcH = height / scale;
        const sx = (nw - srcW) / 2;
        const sy = (nh - srcH) / 2;
        contentTmp.width = pxW();
        contentTmp.height = pxH();
        tmpCtx.drawImage(
          img,
          sx,
          sy,
          srcW,
          srcH,
          strokeW,
          strokeW,
          width * dpr,
          height * dpr,
        );
      } else if (fitMode === "widthFix") {
        renderW = width;
        renderH = Math.round(nh * (width / nw));
        contentTmp.width = pxW();
        contentTmp.height = pxH();
        tmpCtx.drawImage(img, strokeW, strokeW, renderW * dpr, renderH * dpr);
      } else if (fitMode === "heightFix") {
        renderH = height;
        renderW = Math.round(nw * (height / nh));
        contentTmp.width = pxW();
        contentTmp.height = pxH();
        tmpCtx.drawImage(img, strokeW, strokeW, renderW * dpr, renderH * dpr);
      } else {
        const scale = Math.min(width / nw, height / nh);
        renderW = Math.round(nw * scale);
        renderH = Math.round(nh * scale);
        contentTmp.width = pxW();
        contentTmp.height = pxH();
        tmpCtx.drawImage(img, strokeW, strokeW, renderW * dpr, renderH * dpr);
      }

      const canvas = document.createElement("canvas");
      canvas.width = contentTmp.width;
      canvas.height = contentTmp.height;
      const ctx = canvas.getContext("2d");
      _applyWhiteStroke(ctx, contentTmp, strokeW);
      ctx.drawImage(contentTmp, 0, 0);

      resolve({
        dataURL: canvas.toDataURL("image/png"),
        width: renderW + strokeWidth * 2,
        height: renderH + strokeWidth * 2,
      });
    };
    img.onerror = () => reject(new Error("图片加载失败：" + imgUrl));
    img.src = imgUrl;
  });
};
