// Drop conditional-cache headers + force revalidation so RevenueCat returns 200 (not 304)
try {
  var h = Object.assign({}, $request.headers);
  ["If-None-Match","if-none-match","If-Modified-Since","if-modified-since","X-RC-Cache-Key","x-rc-cache-key"]
    .forEach(function (k) { delete h[k]; });
  h["Cache-Control"] = "no-cache";
  $done({ headers: h });
} catch (e) {
  $done({});
}
