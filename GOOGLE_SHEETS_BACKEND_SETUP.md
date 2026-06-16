# 🎯 最簡單的 Google Sheets 後端整合 - 完整操作指南

> **核心概念**：你設定一次 Google Sheets + Apps Script，學生和管理員就能自動儲存資料到雲端。

---

## 📋 完整操作步驟

### 🔴 **第1步：建立 Google 試算表（5分鐘）**

**用你的 Google 帳號登入做一次就好**

1. 打開 https://sheets.google.com
2. 點 `新建試算表` 按鈕（空白的那個）
3. 改名稱：隨便取，例如「背單字資料庫」
4. 按照下圖填入第一列：

| Word | Translation | PartOfSpeech | Example | Etymology | CreatedAt |
|------|-------------|--------------|---------|-----------|-----------|
|      |             |              |         |           |           |

**操作方式**：
- 點第一格（A1），輸入 `Word` 然後按 Tab
- 輸入 `Translation` 然後按 Tab
- 輸入 `PartOfSpeech` 然後按 Tab
- 輸入 `Example` 然後按 Tab
- 輸入 `Etymology` 然後按 Tab
- 輸入 `CreatedAt` 然後按 Enter

5. **複製試算表網址的 ID**
   - 網址長這樣：`https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f/edit`
   - ID 就是中間那段：`1a2b3c4d5e6f`
   - **暫時不用記，等等會用到**

---

### 🔴 **第2步：建立 Google Apps Script（5分鐘）**

**在同一個 Google Sheets 裡操作**

1. 在試算表上方，點 `擴充功能` 選單
2. 點 `Apps Script`（會開新分頁）
3. 看到一個編輯器，刪掉所有預設代碼
4. **複製貼入這段代碼**（完整複製）：

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.word || '',
    data.translation || '',
    data.part || '',
    data.example || '',
    data.etymology || '',
    new Date()
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

5. **按 Ctrl+S 保存**（最上方會顯示「已保存」）

---

### 🔴 **第3步：部署成 Web App（3分鐘）**

**還是在 Apps Script 頁面**

1. 左上角點 `部署` 按鈕
2. 點 `新建部署`（右邊有個加號）
3. 選擇類型 → 點下拉選單 → 選 `Web 應用程式`
4. **設定**（重要）：
   - 「執行應用程式的身分」→ **選你的 Google 帳號**
   - 「誰有權存取」→ **選「任何人」**
5. 點 `部署` 按鈕
6. **跳出同意視窗**：
   - 看到「Google 還沒驗證此應用程式」
   - 點左下角「進階」
   - 點「前往...（不安全）」
   - 選「允許」
7. 部署成功後，會出現一個 **Web 應用程式 URL**（長得像這樣）：
   ```
   https://script.google.com/macros/s/AKfycbxxxxx/exec
   ```
8. **複製這個 URL**（點右邊複製圖示，或手動反白複製）
9. 貼到記事本暫存（等下用）

---

### 🔴 **第4步：修改前端設定（2分鐘）**

**回到你的程式碼編輯器（VS Code）**

1. 打開 `manage.js` 檔案
2. **找到第 2 行**：
   ```javascript
   const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
   ```
3. **把它改成你複製的 URL**，例如：
   ```javascript
   const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxxxxx/exec'
   ```
4. **Ctrl+S 保存**

---

### ✅ **完成！現在可以用了**

當管理員進入 `manage.html` 並按「儲存」時：
- ✅ 資料會存到 **localStorage**（手機/電腦本地）
- ✅ 資料會存到 **Google Sheets**（雲端）

---

## 🔐 管理員帳號密碼（簡單設定）

**現在已經內建在 manage.js 第3行：**
```javascript
const AUTH_USERS = [{user:'admin', pass:'wordpass123'}]
```

進管理頁時，會跳出輸入框：
- **帳號**：輸入 `admin`
- **密碼**：輸入 `wordpass123`

**想改帳號密碼？** 改第3行即可：
```javascript
const AUTH_USERS = [{user:'你的帳號', pass:'你的密碼'}]
```

---

## 🎓 給學生用的說明

### 學生怎麼用？

1. **主頁面（index.html）**
   - 點進去直接看卡片
   - 不用登入任何東西
   - 資料保存在手機/電腦上

2. **管理頁面（manage.html）**
   - **只有老師能進**
   - 進去時要輸入帳號密碼驗證
   - 驗證通過才能新增/刪除單字

---

## ❓ 常見問題

**Q: 我改了 Apps Script 代碼，需要再部署一次嗎？**  
A: 不用。改完後按 Ctrl+S 保存，Web App 會自動更新。

**Q: 學生進去管理頁需要登入 Google 嗎？**  
A: 不需要。只要輸入帳號密碼（你在 manage.js 設定的）就可以。

**Q: 資料沒有同步到 Google Sheets 怎麼辦？**  
A: 沒關係，資料還是會存在學生的手機/電腦上。檢查一下 Web App URL 有沒有貼對。

**Q: 怎麼查看 Google Sheets 裡的資料？**  
A: 回到第1步建立的 Google Sheets，按 F5 重整，就能看到新增的單字。

**Q: 我忘記 Web App URL 了？**  
A: 回到 Apps Script 編輯器，點左邊 `部署`，找到「既有部署」，就能看到 URL。

---

## 📌 整個流程只要 15 分鐘

- 第1步：5分鐘（建立 Sheets）
- 第2步：5分鐘（建立 Apps Script）
- 第3步：3分鐘（部署）
- 第4步：2分鐘（修改 manage.js）

**完成！** 就這麼簡單 ✨

這是最安全的方式，適合需要真實管理者身份驗證的應用場景。

## 6. Tailwind CSS 風格重構

專案現在已經透過 CDN 引入 Tailwind，並新增 `tailwind.config.js`：
- `oil-sky`
- `oil-amber`
- `oil-rose`
- `oil-butter`
- `oil-slate`
- `oil-olive`

這個配色搭配油畫明艷風的印象派效果，將 HTML 中原先的靜態顏色改為 Tailwind 語意化類別。

## 7. 測試步驟

1. 開啟 `index.html`，確認首頁卡片風格與翻面效果正常。
2. 點選「管理單字」進入 `manage.html`。
3. 輸入預設帳號（目前 `admin` / `wordpass123`）並驗證。
4. 填寫單字資料後，點擊「儲存」。
5. 若設定好 `BACKEND_URL`，可在後端試算表中確認資料是否新增。

## 8. 注意事項

- 若使用 `prompt()` 作為驗證方法，請勿用於正式生產環境。
- 若要將 `BACKEND_URL` 改成正式 Google Apps Script API，請務必將 Web App 權限開啟成 `任何人`。
- 若要進一步加密與保護帳號，請改用方法二或方法三。
