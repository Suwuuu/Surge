// Drop conditional-cache headers so RevenueCat answers 200 with a fresh body
// instead of 304 (a 304 has no body for the response script to rewrite).

let h = Object.assign({}, $request.headers);
delete h["If-None-Match"];
delete h["if-none-match"];
delete h["X-RC-Cache-Key"];
delete h["x-rc-cache-key"];
$done({ headers: h });
