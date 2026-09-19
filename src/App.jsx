
import "./App.css";
import { useState } from "react";
import { saveKeyPair, unlockPrivateKey } from "./cryptoStorage";
import ProviderPortal from "./components/ProviderPortal";
import { readPdf, readTextFile } from "./utils/pdfReader";
import { detectPII, redactPII } from "./utils/piiDetector";
import { encryptText } from "./utils/encryption";

function App() {

    const [showAuth, setShowAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  async function createSecureVault() {
    try {
      if (!email || !password) {
        setAuthMessage("Please enter email and password.");
        return;
      }

      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        true,
        ["sign", "verify"]
      );

      await saveKeyPair(keyPair, password);

      console.log(
        "PUBLIC KEY TO SEND TO BACKEND:",
        await window.crypto.subtle.exportKey("jwk", keyPair.publicKey)
      );

      setAuthMessage("✅ Secure vault created!");
      setShowAuth(false);
    } catch (error) {
      console.error(error);
      setAuthMessage("❌ Could not create secure vault.");
    }
  }

  async function login() {
    try {
      await unlockPrivateKey(password);
      setAuthMessage("✅ Authentication successful!");
      setShowAuth(false);
    } catch (error) {
      console.error(error);
      setAuthMessage("❌ Wrong password or no saved account.");
    }
  }


  const [documents, setDocuments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  async function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      let extractedText = "";

      if (selectedFile.type === "application/pdf") {
        extractedText = await readPdf(selectedFile);
      } else if (selectedFile.type === "text/plain") {
        extractedText = await readTextFile(selectedFile);
      } else {
        alert("Please upload a PDF or TXT file.");
        setIsProcessing(false);
        return;
      }

      // Detect PII
      const piiResults = detectPII(extractedText);

      // Sanitize PII
      const sanitizedText = redactPII(extractedText);

      // Encrypt sanitized document
      const encrypted = await encryptText(sanitizedText);

      const newDocument = {
        id: Date.now(),
        name: selectedFile.name,
        type: selectedFile.type,
        sanitizedText: sanitizedText,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        key: encrypted.key,
        piiResults: piiResults,
        uploadedAt: new Date().toLocaleString(),
      };

      setDocuments((previousDocuments) => [
        ...previousDocuments,
        newDocument,
      ]);
    } catch (error) {
      console.error("Document processing error:", error);
      alert("There was a problem processing this document.");
    }

    setIsProcessing(false);

    // Allows the same file to be selected again
    event.target.value = "";
  }

    if (showAuth) {
    return (
      <div className="app">
        <main className="main" style={{ padding: "60px" }}>
          <h1>MediKey</h1>
          <h2>🔐 Secure Medical Vault</h2>
          <p>Create or unlock your cryptographic identity.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <br /><br />

          <button
            className="primary-button"
            onClick={createSecureVault}
          >
            Create Secure Vault
          </button>

          <button
            className="primary-button"
            onClick={login}
            style={{ marginLeft: "10px" }}
          >
            Login
          </button>

          <p>{authMessage}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">✚</div>

          <div>
            <h1>MediKey</h1>
            <p>Your Health. Your Privacy.</p>
          </div>
        </div>

        <nav className="nav">
          
          <button className="nav-button active">
            🏠 &nbsp; Dashboard
          </button>
<button
  className="nav-button"
  onClick={() => {
    document.getElementById("provider-portal")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  🩺 &nbsp; Provider Portal
</button>
         <button
  className="nav-button"
  onClick={() => {
    document.getElementById("vault")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  📁 &nbsp; My Vault
</button>

         <button
  className="nav-button"
  onClick={() => {
    document.getElementById("upload")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  ☁️ &nbsp; Upload Document
</button>

          <button className="nav-button">
            ⚙️ &nbsp; Settings
          </button>
        </nav>

        <div className="sidebar-security">
          <div className="sidebar-security-icon">
            🛡️
          </div>

          <h3>Secure Today.</h3>

          <p>
            Your medical data is protected
            with privacy-focused technology.
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">
          <div className="user">
            <span>🔔</span>

            <div className="user-avatar">
              👤
            </div>

            <span>
              Welcome, User
            </span>
          </div>
        </header>

        <div className="content">

          {/* HERO */}
          <section className="hero">

            <div>
              <h2>
                Hello, User 👋
              </h2>

              
                <h2>
  Your Health Records, All in One Secure Place
</h2>
              

              <p>
                Upload your medical documents and let
                MediKey protect sensitive information
                with intelligent privacy and encryption.
              </p>
            </div>

            <div className="hero-graphic">
              🛡️
            </div>

          </section>

          {/* UPLOAD + SECURITY */}
          <div className="top-grid">

            {/* UPLOAD CARD */}
            <section className="upload-card" id="upload">

              <div className="upload-zone">

                <div className="upload-icon">
                  ☁️
                </div>

                <h3>
                  Upload Medical Document
                </h3>

                <p>
                  Select your PDF or TXT medical record
                </p>

                <label className="primary-button">
                  📤 &nbsp; Choose File

                  <input
                    className="file-input"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                  />
                </label>

                {isProcessing && (
                  <p>
                    ⏳ Processing and protecting document...
                  </p>
                )}

                <p>
                  PDF &nbsp;•&nbsp; TXT
                </p>

              </div>

            </section>

            {/* SECURITY CARD */}
            <section className="security-card">

              <div className="security-header">

                <div className="security-icon">
                  🛡️
                </div>

                <div>
                  <h3>Your Data is Protected</h3>
                  <p>MediKey Privacy Engine</p>
                </div>

              </div>

              <div className="security-item">
                <div className="check">✓</div>

                <div>
                  <strong>PII Detection</strong>
                  <span>
                    Scans for sensitive information
                  </span>
                </div>
              </div>

              <div className="security-item">
                <div className="check">✓</div>

                <div>
                  <strong>Data Sanitization</strong>
                  <span>
                    Redacts detected personal details
                  </span>
                </div>
              </div>

              <div className="security-item">
                <div className="check">✓</div>

                <div>
                  <strong>Encryption</strong>
                  <span>
                    Sanitized data is encrypted
                  </span>
                </div>
              </div>

            </section>

          </div>

          {/* VAULT */}
          <section className="vault" id="vault">

            <div className="vault-header">

              <div className="vault-title">

                <div className="vault-icon">
                  📁
                </div>

                <div>
                  <h2>
                    Document Vault
                  </h2>

                  <p>
                    Your uploaded medical documents
                  </p>
                </div>

              </div>

              <strong>
                {documents.length} Document
                {documents.length !== 1 ? "s" : ""}
              </strong>

            </div>

            {/* EMPTY STATE */}
            {documents.length === 0 && (
              <div className="empty-state">

                <div className="empty-state-icon">
                  📂
                </div>

                <h3>
                  Your vault is empty
                </h3>

                <p>
                  Upload your first medical document
                  to get started.
                </p>

              </div>
            )}

            {/* DOCUMENTS */}
            {documents.length > 0 && (
              <div className="document-grid">

                {documents.map((document) => (

                  <div
                    className="document-card"
                    key={document.id}
                  >

                    <div className="document-icon">
                      {document.type === "application/pdf"
                        ? "📕"
                        : "📄"}
                    </div>

                    <h3>
                      {document.name}
                    </h3>

                    <p className="document-meta">
                      {document.type === "application/pdf"
                        ? "PDF"
                        : "TXT"}
                      {" • "}
                      {document.uploadedAt}
                    </p>

                    <div className="encrypted-badge">
                      🔒 Encrypted
                    </div>

                    <p className="document-meta">
                      {document.piiResults.length > 0
                        ? `🛡️ ${document.piiResults.length} sensitive item(s) sanitized`
                        : "✓ No matching PII detected"}
                    </p>

                    <button
  className="view-button"
  onClick={() => {
    setSelectedDocument(document);
  }}
>
  View Record
</button>

                  </div>

                ))}

              </div>)}
              {selectedDocument && (
  <div className="document-preview">
    <div className="preview-header">
      <div>
        <h2>{selectedDocument.name}</h2>
        <p>Extracted & sanitized document text</p>
      </div>

      <button
        className="close-preview"
        onClick={() => setSelectedDocument(null)}
      >
        ✕ Close
      </button>
    </div>

    <div className="preview-security">
      🔒 PII sanitized • Encrypted
    </div>

    <pre className="document-text">
      {selectedDocument.sanitizedText}
    </pre>
  </div>
)}
            

          </section>
          <section className="provider-portal-section" id="provider-portal">
  <div className="vault-header">
    <div className="vault-title">
      <div className="vault-icon">🩺</div>

      <div>
        <h2>Provider Portal</h2>
        <p>Secure access for healthcare providers</p>
      </div>
    </div>
  </div>
<div className="provider-portal-wrapper">
  <ProviderPortal />
</div>
</section>

        </div>

      </main>

    </div>
  );
}

export default App;