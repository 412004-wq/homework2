# 最簡單的 Google Sheets 後端整合（零過度工程）

## 第一步：建立 Google 試算表

1. 開啟 https://sheets.google.com，建立新試算表
2. 第一列輸入欄位名稱：`Word` `Translation` `PartOfSpeech` `Example` `Etymology` `CreatedAt`
3. 複製試算表網址中的 ID（`https://docs.google.com/spreadsheets/d/` 後面這段）

例如：`https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f/edit` → ID 是 `1a2b3c4d5e6f`

## 第二步：建立 Google Apps Script

1. 在試算表上，點選 `擴充功能` → `Apps Script`
2. 清空預設代碼，複製貼入以下代碼：

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

3. **保存** (Ctrl+S)

## 第三步：部署為 Web App

1. 點選左上角 `部署` → `新建部署`
2. 選擇類型：`Web 應用程式`
3. 設定：
   - **執行應用程式的身分**：選你的 Google 帳號
   - **誰有權存取**：選 `任何人`
4. 點 `部署`，複製 **Web App URL**（長得像 `https://script.google.com/macros/s/xxxxx/exec`）

## 第四步：前端設定

打開 `manage.js`，找到第 2 行：

```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
```

改成你複製的 Web App URL，例如：

```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/1a2b3c4d5e6f7g8h9i0j/exec'
```

**完成！** 現在按「儲存」按鈕時，資料會自動傳到 Google Sheets。

---

## 驗證方式（可選）

### 簡單做法：hardcode 帳號密碼
在 `manage.js` 第 3 行已定義：
```javascript
const AUTH_USERS = [{user:'admin', pass:'wordpass123'}]
```

進管理頁時會用 `prompt()` 要求輸入帳號密碼，驗證成功才能使用。

### 更安全做法：在 Google Sheets 存帳號密碼

1. 試算表新增第二張工作表，改名為 `Accounts`
2. 第一列輸入：`username` `password`
3. 新增一行：`admin` `wordpass123`
4. Code.gs 改成：

```javascript
function doPost(e) {
  const path = e.parameter.action;
  
  if (path === 'auth') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const accountSheet = ss.getSheetByName('Accounts');
    const data = accountSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === e.parameter.user && data[i][1] === e.parameter.pass) {
        return ContentService.createTextOutput(JSON.stringify({ok: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ok: false}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
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

5. manage.js 中 `requireLogin` 改成：

```javascript
async function requireLogin() {
  const logged = sessionStorage.getItem('vocabManagerAuth');
  if (logged === 'logged-in') return;
  
  const username = prompt('帳號：');
  const password = prompt('密碼：');
  if (!username || !password) {
    location.href = 'index.html';
    return;
  }
  
  const res = await fetch(`${BACKEND_URL}?action=auth&user=${username}&pass=${password}`);
  const result = await res.json();
  
  if (!result.ok) {
    alert('帳號或密碼錯誤');
    location.href = 'index.html';
    return;
  }
  
  sessionStorage.setItem('vocabManagerAuth', 'logged-in');
}
```

---

## 常見問題

**Q: 部署後改 Code.gs，需要再部署一次嗎？**  
A: 不用。只要 GAS 編輯器按保存，Web App 會自動更新。

**Q: 如果 Web App URL 忘記了？**  
A: 在 Apps Script 編輯器，左側找 `部署`，點一次既有部署就能看到 URL。

**Q: 資料會不會傳不到 Sheets？**  
A: manage.js 的 `sendToBackend` 有 try-catch，若失敗會顯示警告。本地 localStorage 還是會保存，不怕遺失。

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
