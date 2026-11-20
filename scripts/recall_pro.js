// Recall Pro Unlock — RevenueCat CustomerInfo rewrite (v2, with diagnostics)
(function () {
  var CAND = ["Recall Pro", "pro", "Pro", "recall_pro"];
  var FAR = "2099-12-31T23:59:59Z";
  try {
    var url = (typeof $request !== "undefined" && $request && $request.url) ? $request.url : "";
    var raw = $response && $response.body ? $response.body : "";
    console.log("[RecallPro] resp " + url + " status=" + ($response ? $response.status : "?") + " len=" + raw.length);

    var obj = raw.length ? JSON.parse(raw) : {};
    var target = (obj && obj.customer_info) ? obj.customer_info : obj;
    if (!target || typeof target !== "object") target = {};

    var nowMs = Date.now();
    target.request_date = new Date(nowMs).toISOString();
    target.request_date_ms = nowMs;

    var sub = target.subscriber || (target.subscriber = {});
    sub.entitlements  = sub.entitlements  || {};
    sub.subscriptions = sub.subscriptions || {};

    console.log("[RecallPro] before ents=" + JSON.stringify(Object.keys(sub.entitlements)));

    // keep any existing entitlement active
    Object.keys(sub.entitlements).forEach(function (k) {
      var e = sub.entitlements[k] || {};
      e.expires_date = FAR;
      if (!e.purchase_date) e.purchase_date = "2024-01-01T00:00:00Z";
      if (!e.product_identifier) e.product_identifier = "recall_pro_lifetime";
      sub.entitlements[k] = e;
    });
    // add candidate entitlement ids so whatever the app checks is active
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
    console.log("[RecallPro] after ents=" + JSON.stringify(Object.keys(sub.entitlements)));

    var headers = ($response && $response.headers) ? $response.headers : {};
    ["X-RC-Signature","x-rc-signature","X-RC-Request-ID","x-rc-request-id"].forEach(function (h) { delete headers[h]; });

    var status = ($response && $response.status) ? $response.status : 200;
    if (status === 304 || raw.length === 0) status = 200;   // 304 has no body; turn into a real 200

    $done({ status: status, headers: headers, body: JSON.stringify(target) });
  } catch (e) {
    console.log("[RecallPro] error " + e);
    $done({});
  }
})();
