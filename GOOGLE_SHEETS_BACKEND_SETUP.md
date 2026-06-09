# Google 試算表 + Google Apps Script 後端整合說明

此文件記錄如何將 `manage.html` 後端儲存功能串接到 Google 試算表，並補充三種管理頁身分認證方式。

## 1. 建立 Google 試算表

1. 開啟 Google 試算表，建立新試算表。
2. 在第一列填入欄位名稱：
   - `Word`
   - `Translation`
   - `PartOfSpeech`
   - `Example`
   - `Etymology`
   - `CreatedAt`
3. 記下此試算表網址，以備後續參考。

## 2. 建立 Google Apps Script

1. 點選 `擴充功能` > `Apps Script`，或直接進入 https://script.google.com/。
2. 建立新專案，將下列範例程式碼貼入 `Code.gs`：

```javascript
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const sheetId = 'YOUR_SHEET_ID'
    const ss = SpreadsheetApp.openById(sheetId)
    const sheet = ss.getSheets()[0]

    const row = [
      body.word || '',
      body.translation || '',
      body.part || '',
      body.example || '',
      body.etymology || '',
      new Date()
    ]

    sheet.appendRow(row)

    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.message}))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
```

3. 將 `YOUR_SHEET_ID` 換成實際的試算表 ID（網址中 `https://docs.google.com/spreadsheets/d/THIS_ID/edit`）。

## 3. 部署成 Web App

1. 在 Apps Script 編輯器中，點選 `部署` > `新建部署`。
2. 選擇類型 `Web 應用程式`。
3. 設定：
   - `描述`: `背單字管理後端`
   - `執行應用程式的使用者`: `我自己`
   - `誰有權存取`: `任何人` 或 `任何人（包括匿名使用者）`
4. 部署後，取得提供的 Web 應用程式 URL。

## 4. 前端設定

1. 打開 `manage.js`，找到 `BACKEND_URL` 常數。
2. 將 `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec` 修改成你的實際 Web App URL。
3. 儲存後，當管理者點擊「儲存」時，頁面將會：
   - 先把單字資料存到 localStorage
   - 再呼叫後端 API 將資料送到 Google 試算表

## 5. 身分認證方法

### 方法一：JS 驗證帳號密碼

目前 `manage.js` 透過 `prompt()` 方式做簡易驗證：
- `AUTH_USERS` 陣列內有硬 coded 帳號密碼
- 若驗證成功，會將狀態存入 `sessionStorage`
- 若驗證失敗，會導回 `index.html`

此方式適用於純前端快速驗證，但帳號密碼仍會被使用者端讀到，不適合保護高敏感資料。

### 方法二：Google 試算表存帳號密碼

流程：
1. 在 Google 試算表新增一張 `Accounts` 試算表，包含 `username`、`passwordHash` 等欄位。
2. 在 Google Apps Script 中建立驗證 API，例如 `doGet` 或 `doPost` 檢查帳號密碼。
3. 前端在進入管理頁時，先呼叫該驗證 API，後端比對資料後回傳是否允許。
4. 若驗證通過，前端再顯示管理資訊。

這種做法較安全，但仍需注意密碼儲存方式應該使用雜湊，而不是明碼。

### 方法三：OAuth 驗證電子郵件

此方式需要使用 Google OAuth 或 Google Identity Services：
1. 在 Google 雲端平台建立 OAuth 用戶端 ID。
2. 在前端整合 Google Identity API，要求使用者登入 Google 帳號。
3. 取得登入後的電子郵件資訊。
4. 你的後端或前端可以檢查電子郵件是否在允許名單中。

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
