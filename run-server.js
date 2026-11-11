#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

/* ---------------- 参数解析 ---------------- */
const HELP = `
用法1: node preview.js [目录] [选项]
用法2根目录下: node ./run-server.js

选项:
  -p, --port <port>   端口，默认 5501（被占用时自动 +1）
  -r, --root <dir>    静态目录，默认当前目录
      --no-open       不自动打开浏览器
      --no-spa        关闭 history 路由回退
  -q, --quiet         不打印请求日志
  -h, --help          显示帮助

示例:
  node scripts/preview.js dist
  node scripts/preview.js dist -p 3000 --no-open
`;

const opts = {
  port: 5501,
  root: process.cwd(),
  open: true,
  spa: true,
  quiet: false,
};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "-p" || a === "--port") opts.port = Number(argv[++i]) || 8080;
  else if (a === "-r" || a === "--root") opts.root = argv[++i];
  else if (a === "--no-open") opts.open = false;
  else if (a === "--no-spa") opts.spa = false;
  else if (a === "-q" || a === "--quiet") opts.quiet = true;
  else if (a === "-h" || a === "--help") {
    console.log(HELP);
    process.exit(0);
  } else if (!a.startsWith("-")) opts.root = a;
  else console.warn("未知参数:", a);
}

const ROOT = path.resolve(opts.root);
const HOST = "0.0.0.0";

if (!fs.existsSync(ROOT) || !fs.statSync(ROOT).isDirectory()) {
  console.error(`❌ 目录不存在: ${ROOT}`);
  process.exit(1);
}

/* ---------------- MIME ---------------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".wasm": "application/wasm",
};

const NO_CACHE = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
};

/* ---------------- 工具函数 ---------------- */
const sendText = (res, code, text) => {
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
};

const escapeHtml = (s) => {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
};

const sendFile = (filePath, req, res) => {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const headers = { ...NO_CACHE, "Content-Type": type };

  const stream = fs.createReadStream(filePath);
  stream.once("error", (err) => {
    if (!res.headersSent) sendText(res, 500, "500 Internal Server Error");
    else res.destroy();
    if (!opts.quiet) console.error("读取失败:", filePath, err.message);
  });
  stream.once("open", () => {
    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      stream.destroy();
      res.end();
      return;
    }
    stream.pipe(res);
  });
};

const listDir = (dir, pathname, res) => {
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return sendText(res, 500, "500 Internal Server Error");

    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const items = entries
      .map((e) => {
        const isDir = e.isDirectory();
        const display = e.name + (isDir ? "/" : "");
        const href = encodeURIComponent(e.name) + (isDir ? "/" : "");
        return `<li><a class="${isDir ? "dir" : "file"}" href="${href}">${escapeHtml(display)}</a></li>`;
      })
      .join("\n");

    const parent =
      pathname !== "/" ? `<li><a class="dir" href="../">../</a></li>` : "";

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Index of ${escapeHtml(pathname)}</title>
<style>
  body{font:14px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
       margin:0;padding:24px 32px;color:#222;background:#fff}
  h1{font-size:16px;font-weight:600;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid #eee;
     font-family:ui-monospace,SFMono-Regular,Consolas,monospace;word-break:break-all}
  ul{list-style:none;padding:0;margin:0}
  li{padding:2px 0}
  a{text-decoration:none;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
  a.dir{color:#0969da;font-weight:600}
  a.file{color:#333}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
<h1>Index of ${escapeHtml(pathname)}</h1>
<ul>
${parent}
${items}
</ul>
</body>
</html>`;

    res.writeHead(200, {
      ...NO_CACHE,
      "Content-Type": "text/html; charset=utf-8",
    });
    res.end(html);
  });
};

const looksLikePage = (req, pathname) => {
  if (path.extname(pathname)) return false; // 带扩展名视作静态资源
  const accept = req.headers.accept || "";
  return accept.includes("text/html") || accept.includes("*/*");
};

/* ---------------- 请求处理 ---------------- */
const server = http.createServer((req, res) => {
  if (!opts.quiet) {
    const startAt = Date.now();
    res.on("finish", () => {
      console.log(
        `  ${res.statusCode}  ${req.method.padEnd(4)} ${decodeURIComponentSafe(req.url)}  ${Date.now() - startAt}ms`,
      );
    });
  }

  // 宽松 CORS，方便本地调试接口
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "GET,HEAD,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    return res.end();
  }

  let parsed;
  try {
    parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch {
    return sendText(res, 400, "400 Bad Request");
  }

  let pathname;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return sendText(res, 400, "400 Bad Request");
  }

  // 防止目录穿越
  const target = path.resolve(ROOT, "." + pathname);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return sendText(res, 403, "403 Forbidden");
  }

  fs.stat(target, (err, stat) => {
    /* --- 1. 不存在 --- */
    if (err) {
      if (opts.spa && looksLikePage(req, pathname)) {
        const indexFile = path.join(ROOT, "index.html");
        if (fs.existsSync(indexFile)) return sendFile(indexFile, req, res);
      }
      return sendText(res, 404, `404 Not Found: ${pathname}`);
    }

    /* --- 2. 目录 --- */
    if (stat.isDirectory()) {
      if (!parsed.pathname.endsWith("/")) {
        res.writeHead(301, { Location: parsed.pathname + "/" + parsed.search });
        return res.end();
      }
      const indexFile = path.join(target, "index.html");
      return fs.stat(indexFile, (e, s) => {
        if (!e && s.isFile()) return sendFile(indexFile, req, res);
        return listDir(target, pathname, res);
      });
    }

    /* --- 3. 文件 --- */
    return sendFile(target, req, res);
  });
});

const decodeURIComponentSafe = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/* ---------------- 启动 ---------------- */
const openBrowser = (url) => {
  const p = process.platform;
  const cmd =
    p === "win32"
      ? `start "" "${url}"`
      : p === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}" >/dev/null 2>&1`;

  exec(cmd, { windowsHide: true }, (err) => {
    if (err && !opts.quiet)
      console.warn("⚠️  无法自动打开浏览器，请手动访问:", url);
  });
};

const listen = (port) => {
  const onError = (err) => {
    server.removeListener("error", onError);
    if (err.code === "EADDRINUSE" && port < 65535) {
      if (!opts.quiet)
        console.log(`⚠️  端口 ${port} 被占用，尝试 ${port + 1} ...`);
      return listen(port + 1);
    }
    console.error("❌ 启动失败:", err.message);
    process.exit(1);
  };

  server.once("error", onError);
  server.listen(port, HOST, () => {
    server.removeListener("error", onError);
    server.on("error", (e) => console.error("服务器错误:", e.message));

    const url = `http://localhost:${port}/`;
    console.log("");
    console.log("  🚀 静态服务器已启动");
    console.log(`     本地:   ${url}`);
    console.log(`     根目录: ${ROOT}`);
    console.log("     Ctrl+C 停止");
    console.log("");

    if (opts.open) openBrowser(url);
  });
};

process.on("SIGINT", () => {
  console.log("\n👋 已停止");
  process.exit(0);
});

listen(opts.port);
