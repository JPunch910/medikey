<<<<<<< HEAD
# MediKey 🔐🏥

### Zero-Trust Medical Record Aggregator

MediKey is a privacy-focused medical document management application designed to help users securely process and organize medical records.

The application focuses on detecting sensitive information, sanitizing documents, and encrypting processed medical records before they are added to the Document Vault.

---

## ✨ Features

### 📁 Document Vault
- Upload medical documents
- Supports PDF and TXT files
- Extracts text locally from uploaded documents
- Aggregates multiple documents in one vault

### 🛡️ Privacy Engine
- Detects common types of Personally Identifiable Information (PII)
- Detects:
  - Email addresses
  - Indian phone numbers
  - Aadhaar-style identifiers
- Redacts detected sensitive information before encryption

### 🔐 Encryption
- Uses the browser Web Crypto API
- Encrypts sanitized document text using AES-GCM
- Generates a unique initialization vector (IV) for each encrypted document

### 🎨 User Interface
- Healthcare-focused dashboard
- Responsive layout
- Document cards
- Security status indicators
- Upload interface
- Easy navigation between Upload and Document Vault

---

## 🧰 Tech Stack

- React
- Vite
- JavaScript
- PDF.js
- Web Crypto API
- CSS

---

## 📂 Project Structure

```text
medikey/
│
├── public/
│
├── src/
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── pdfReader.js
│   │   └── piiDetector.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
└── README.md
=======
# medikey
>>>>>>> 2eb5da9503b25e4c161c38710a46fe7d950c7348
