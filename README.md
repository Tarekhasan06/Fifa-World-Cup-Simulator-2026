# 🎓 StudyHub — Academic Resource Portal

A **Firebase-powered** departmental study-materials website with admin CMS, access-controlled student login, and semester-wise resource management.

---

## 🚀 Setup Guide (Step by Step)

### Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"** → enter a project name → Continue
3. Disable Google Analytics if not needed → **Create project**

### Step 2: Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Under **Sign-in method**, enable:
   - ✅ **Email/Password**
   - ✅ **Google** (click, enable, add your support email, save)

### Step 3: Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Production mode"** → Select a region close to you → Enable
3. Go to **Rules** tab → paste the contents of `firestore.rules` → **Publish**

### Step 4: Register Web App & Get Config

1. Firebase Console → ⚙️ Project Settings → **Your apps** → Click `</>` (Web)
2. Enter app nickname → **Register app**
3. Copy the `firebaseConfig` object that appears

### Step 5: Update `js/firebase-config.js`

Open `js/firebase-config.js` and replace the placeholders:

```javascript
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
};

const ADMIN_EMAIL = "YOUR_REAL_EMAIL@gmail.com";  // ← Your email!
```

### Step 6: Deploy to Firebase Hosting

Install Firebase CLI (once):
```powershell
npm install -g firebase-tools
```

Log in:
```powershell
firebase login
```

Initialize (from project folder):
```powershell
cd "e:\My codes\academic-portal"
firebase init hosting
```
- Select your Firebase project
- Public directory: `.` (just a dot — current folder)
- Single-page app: **Yes**
- Overwrite index.html: **No**

Deploy:
```powershell
firebase deploy
```

Your site is now live at `https://YOUR_PROJECT_ID.web.app` 🎉

---

## 📋 First-Time Admin Setup (After Deploy)

1. Open your live site
2. Click **Register** → sign up with the email you set as `ADMIN_EMAIL`
3. You'll be automatically approved as admin
4. Click **Admin** in the nav
5. Go to **Overview** → click **Initialize Semesters** (creates Sem 1–8)
6. Go to **Site Settings** → fill in your department/university name
7. Go to **Subjects & Resources** → add subjects to each semester
8. Add Google Drive links for each resource

---

## 🔒 Keeping Files Private

### Website Layer (built-in)
- Only approved users can see any Drive links
- Firestore security rules block unapproved users at the database level

### Google Drive Layer (you must do this manually)
For each Drive file/folder you add:
1. Open the file in Google Drive
2. Click **Share**
3. Change from "Anyone with the link" to either:
   - **"Restricted"** (only specific emails) — most secure
   - **"Anyone in [Your Org]"** — if you have a Google Workspace domain

---

## 📁 Project Structure

```
academic-portal/
├── index.html                  ← SPA shell
├── firebase.json               ← Hosting config
├── firestore.rules             ← Security rules
├── css/
│   └── style.css               ← Complete design system
└── js/
    ├── firebase-config.js      ← ⚠️ Edit this with YOUR config
    ├── db.js                   ← All Firestore operations
    ├── app.js                  ← Router + auth + helpers
    └── pages/
        ├── home.js
        ├── auth.js             ← Login / Register / Pending
        ├── semester.js         ← Semester + Content pages
        ├── books.js
        ├── software.js
        ├── tutorials.js
        ├── notices.js
        ├── contact.js
        └── admin.js            ← Full admin dashboard
```

---

## 🌐 Pages & Routes

| Route | Page | Access |
|---|---|---|
| `#/home` | Homepage | Approved users |
| `#/content` | All semesters | Approved users |
| `#/semester/sem1` | Semester 1 page | Approved users |
| `#/books` | Books | Approved users |
| `#/software` | Software | Approved users |
| `#/tutorials` | Tutorials | Approved users |
| `#/notices` | Notices | Approved users |
| `#/contact` | Contact | Approved users |
| `#/admin` | Admin dashboard | Admin only |
| `#/login` | Login | Public |
| `#/register` | Register | Public |
| `#/pending` | Awaiting approval | Logged-in pending |

---

## 📞 Customization

- **Colors**: Edit CSS variables in `css/style.css` under `:root`
- **Department info**: Admin panel → Site Settings
- **Add semesters**: Admin panel → Semesters → Add
- **Add subjects**: Admin panel → Subjects & Resources
- **Add Drive links**: Admin panel → Subjects & Resources → Add Resource
- **Post notices**: Admin panel → Notices → Post Notice
- **Approve students**: Admin panel → Users → Approve

---

## ⚠️ Important Notes

- Never share your `firebase-config.js` API keys publicly (GitHub)
- The Firestore rules in `firestore.rules` MUST be deployed for security
- Google Drive links are only hidden behind the login — set Drive sharing to "Restricted" for maximum file security
- The site works best when deployed to Firebase Hosting (not opened as a local file, due to Firebase Auth restrictions)

---

*Built for departmental academic use — for internal access only.*
