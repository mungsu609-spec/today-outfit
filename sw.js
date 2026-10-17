// 인터넷이 없어도 열리도록 앱 파일을 저장해 둠. 앱을 고치면 VERSION 숫자를 올릴 것.
// (AI 파일은 AI 라이브러리가 따로 저장해요. 여기선 이 앱 주소의 파일만 다뤄요.)
const VERSION = "v28";
const FILES = ["./", "index.html", "catalog.js", "model.js", "photo.js", "ai.js", "labels.json", "config.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "basics.js", "rules.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "no-cache" }))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION && k.startsWith("v")).map((k) => caches.delete(k))))); self.clients.claim(); });
// AI가 폰 CPU 여러 개를 같이 쓰게 해 주는 설정(배경 지우기가 약 2배 빨라짐).
// GitHub Pages는 이 설정을 못 붙여서 여기서 붙여요. 앱을 두 번째 열 때부터 적용돼요.
function isolate(r) {
  if (!r || r.status === 0 || r.type === "opaque") return r;
  const h = new Headers(r.headers);
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  h.set("Cross-Origin-Embedder-Policy", "require-corp");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // 새 버전 먼저 받아 보고, 인터넷이 없으면 저장해 둔 것을 씀.
  //  cache: "no-cache" = 폰에 잠깐 보관된 파일(최대 10분)을 그냥 쓰지 말고 바뀌었는지 꼭 물어보기
  //  (예전엔 index.html은 새것, catalog.js는 예전 것이 섞여서 앱이 멈춘 적이 있어요 — 2026-10-17)
  e.respondWith(fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })).then(isolate));
});
