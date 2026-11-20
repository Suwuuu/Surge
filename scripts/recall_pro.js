// Recall Pro Unlock — RevenueCat CustomerInfo rewrite
// Surge http-response script. Matches:
//   GET  /v1/subscribers/{app_user_id}
//   POST /v1/receipts
// Forces an active, non-expiring "Recall Pro" entitlement.

(function () {
  try {
    var raw = $response.body || "";
    var obj = raw.length ? JSON.parse(raw) : {};

    // /v1/receipts nests the payload in "customer_info"; /v1/subscribers is flat.
    var target = obj && obj.customer_info ? obj.customer_info : obj;

    var nowMs = Date.now();
    var nowIso = new Date(nowMs).toISOString();
    target.request_date = nowIso;
    target.request_date_ms = nowMs;

    var sub = target.subscriber || {};
    sub.entitlements      = sub.entitlements      || {};
    sub.subscriptions     = sub.subscriptions     || {};
    sub.other_purchases   = sub.other_purchases   || {};
    sub.non_subscriptions = sub.non_subscriptions || {};

    var FAR = "2099-12-31T23:59:59Z";
    var PID = "recall_pro_lifetime";

    // Exact entitlement id hard-coded in the app: "Recall Pro"
    sub.entitlements["Recall Pro"] = {
      expires_date: FAR,
      purchase_date: "2024-01-01T00:00:00Z",
      product_identifier: PID
    };

    sub.subscriptions[PID] = {
      billing_issues_detected_at: null,
      expires_date: FAR,
      is_sandbox: false,
      original_purchase_date: "2024-01-01T00:00:00Z",
      period_type: "normal",
      purchase_date: "2024-01-01T00:00:00Z",
      store: "app_store",
      unsubscribe_detected_at: null
    };

    if (!sub.first_seen) sub.first_seen = "2024-01-01T00:00:00Z";
    sub.last_seen = nowIso;
    if (!sub.original_app_user_id) sub.original_app_user_id = "$RCAnonymousID:recallpro";

    target.subscriber = sub;

    $done({ body: JSON.stringify(target) });
  } catch (e) {
    $done({});
  }
})();
