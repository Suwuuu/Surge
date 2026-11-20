# Recall Pro Unlock — Surge Module

通过 MITM `api.revenuecat.com` 并改写 CustomerInfo 响应，让 Recall 判定为 Pro。
（Recall 的 Pro 门控是纯客户端判定，真值来自 RevenueCat 的 `entitlements["Recall Pro"].isActiveInAnyEnvironment`。）

## 一键导入（模块 URL）
```
https://raw.githubusercontent.com/Suwuuu/Surge/main/recall-pro.sgmodule
```
Surge → 首页 → 模块 → 安装新模块 → 粘贴上面的 URL → 安装。

## 前置条件
1. Surge 设置 → MitM → **安装证书**；系统「设置 → 通用 → 关于本机 → 证书信任设置」里对 Surge CA 开启完全信任。
2. 打开 **HTTPS 解密（MitM）**，主机名包含 `api.revenuecat.com`（模块已用 `%APPEND%` 自动追加）。
3. 冷启动 Recall；若之前缓存过免费态，卸载重装换新 `app_user_id`。

## 文件
- `recall-pro.sgmodule` — 模块定义（脚本用 raw URL 引用）
- `scripts/recall_pro.js` — http-response 改写脚本
- `scripts/recall_pro_req.js` — http-request 去缓存头脚本
- `publish.ps1` — 一键发布到 GitHub

## 说明
- `expires_date` 设为 2099 → `isActiveInAnyEnvironment` 恒 true。
- 若命中脚本仍不生效，多为 RevenueCat 开启了 Trusted Entitlements（响应签名校验），此时网络层改写无效，需改用本地 App Group 文件/Frida Hook 方案。
