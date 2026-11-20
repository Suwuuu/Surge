// Recall Pro Unlock — RevenueCat CustomerInfo rewrite (v4: + notification & response header for proof)
(function () {
  var CAND = ["Recall Pro", "pro", "Pro", "recall_pro"];
  var FAR = "2099-12-31T23:59:59Z";
  var tag = "RecallPro";
  try {
    var url = (typeof $request !== "undefined" && $request && $request.url) ? $request.url : "";
    var raw = ($response && $response.body) ? $response.body : "";
    console.log("[" + tag + "] resp " + url + " status=" + ($response ? $response.status : "?") + " len=" + raw.length);

    var obj;
    if (raw.length) {
      try { obj = JSON.parse(raw); }
      catch (pe) {
        console.log("[" + tag + "] parse-fail head=" + String(raw).slice(0, 80));
        $done({});
        return;
      }
    } else {
      obj = {};
    }

    var target = (obj && obj.customer_info) ? obj.customer_info : obj;
    if (!target || typeof target !== "object") target = {};

    var nowMs = Date.now();
    target.request_date = new Date(nowMs).toISOString();
    target.request_date_ms = nowMs;

    var sub = target.subscriber || (target.subscriber = {});
    sub.entitlements  = sub.entitlements  || {};
    sub.subscriptions = sub.subscriptions || {};

    console.log("[" + tag + "] before ents=" + JSON.stringify(Object.keys(sub.entitlements)));

    Object.keys(sub.entitlements).forEach(function (k) {
      var e = sub.entitlements[k] || {};
      e.expires_date = FAR;
      if (!e.purchase_date) e.purchase_date = "2024-01-01T00:00:00Z";
      if (!e.product_identifier) e.product_identifier = "recall_pro_lifetime";
      sub.entitlements[k] = e;
    });
    CAND.forEach(function (id) {
      sub.entitlements[id] = { expires_date: FAR, purchase_date: "2024-01-01T00:00:00Z", product_identifier: "recall_pro_lifetime" };
    });

    var PID = "recall_pro_lifetime";
    sub.subscriptions[PID] = {
      billing_issues_detected_at: null, expires_date: FAR, is_sandbox: false,
      original_purchase_date: "2024-01-01T00:00:00Z", period_type: "normal",
      purchase_date: "2024-01-01T00:00:00Z", store: "app_store", unsubscribe_detected_at: null
    };
    if (!sub.first_seen) sub.first_seen = "2024-01-01T00:00:00Z";
    sub.last_seen = new Date(nowMs).toISOString();
    if (!sub.original_app_user_id) sub.original_app_user_id = "$RCAnonymousID:recallpro";

    target.subscriber = sub;

    var headers = ($response && $response.headers) ? $response.headers : {};
    ["X-RC-Signature","x-rc-signature","X-RC-Request-ID","x-rc-request-id"].forEach(function (h) { delete headers[h]; });
    headers["X-RecallPro-Rewritten"] = "1";

    var status = ($response && $response.status) ? $response.status : 200;
    if (status === 304 || raw.length === 0) status = 200;

    console.log("[" + tag + "] after ents=" + JSON.stringify(Object.keys(sub.entitlements)) + " -> rewritten");
    try { if (typeof $notification !== "undefined") $notification.post("RecallPro 命中", "已改写 CustomerInfo", url); } catch (e) {}

    $done({ status: status, headers: headers, body: JSON.stringify(target) });
  } catch (e) {
    console.log("[" + tag + "] error " + e);
    $done({});
  }
})();
