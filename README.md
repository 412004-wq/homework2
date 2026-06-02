# 背單字小工具（純前端）

本專案使用純 HTML/CSS/JS 實作一個簡易背單字卡，資料存在 localStorage，不需後端。

主要檔案：

- [index.html](index.html) 主畫面，卡片點擊會翻面。
- [manage.html](manage.html) 管理頁，可新增單字與使用「自動填入」。
- [styles.css](styles.css) 樣式表。
- [app.js](app.js) 主畫面邏輯。
- [manage.js](manage.js) 管理頁邏輯與 API 呼叫（使用 Dictionary API 與 LibreTranslate）。

使用方法：

1. 在瀏覽器開啟 [index.html](index.html)。
2. 點選「管理單字」新增或匯入單字。
3. 在管理頁輸入單字後可按「自動填入」嘗試從公開 API 抓取詞性、例句、出處與翻譯（視 API 可用性）。

備註：

- 第三方 API（如 libretranslate.de）可能有使用限制或 CORS 限制，若自動填入失敗請改手動輸入。
# homework2