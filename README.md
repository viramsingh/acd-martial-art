# 🥋 ACD Martial Art Portal & Management System

A web portal and management dashboard built for **ACD Martial Art Academy**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server at `http://localhost:3000` |
| `npm run build` | Builds production bundle |
| `npm run start` | Runs production server |
| `npm run lint` | Runs Linter |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **State & Storage**: `localStorage` (default) + Optional Google Apps Script API Sync
- **Forms & Feedback**: `react-hook-form`, `react-toastify`, `use-sound`

---

## 📁 Key Folder Structure

```text
acd-martial-art/
├── app/
│   ├── page.tsx            # Home Page
│   ├── about/              # About Us Page
│   ├── achievements/       # Achievements Gallery
│   ├── attendance/         # Attendance Tracking Page
│   ├── registration/       # Student Registration Form
│   ├── contact/            # Contact Page
│   ├── admin/              # Admin Dashboard
│   └── api/                # API Routes (students, attendance, contact, etc.)
├── components/             # Navbar, Footer, SocialIcons
├── context/                # ToastContext
├── lib/                    # sheets.ts (Storage & Sync), sound.ts, data.ts
├── public/                 # Static Assets
└── types/                  # TypeScript Interfaces
```

---

## 📊 Google Sheets Sync (Optional)

By default, data persists locally in `localStorage`. To sync data to Google Sheets:

### 1. Function to Connect Google Sheet (`lib/sheets.ts`)
```typescript
import { connectGoogleSheet } from '@/lib/sheets';

// Connect & save Google Sheet Web App URL
const result = await connectGoogleSheet('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
console.log(result.message); // Google Sheet connected successfully!
```

### 2. Google Apps Script Code (`Code.gs`)
Paste this code in Google Sheets (**Extensions > Apps Script**):

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.payload;
    var timestamp = data.timestamp || new Date().toISOString();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(action) || ss.insertSheet(action);

    // Append timestamp, action name, and payload details
    sheet.appendRow([timestamp, action, JSON.stringify(payload)]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ACD Martial Art Google Sheets Sync Service is Active.");
}
```

