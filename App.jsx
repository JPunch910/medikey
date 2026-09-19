import React, { useState } from 'react';

// ==========================================
// 1. THE DOCTOR'S VIEW (PROVIDER PORTAL)
// ==========================================
function ProviderPortal() {
  const [pastedUrl, setPastedUrl] = useState('');
  const [unlockedData, setUnlockedData] = useState(null);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    setError('');
    setUnlockedData(null);
    if (!pastedUrl.includes('#')) {
      setError('Invalid link: Missing decryption key hash.');
      return;
    }
    const secretKey = pastedUrl.split('#')[1];
    const urlParts = pastedUrl.split('#')[0].split('/');
    const recordId = urlParts[urlParts.length - 1];

    if (!secretKey || !recordId) {
      setError('Malformed link.');
      return;
    }

    setUnlockedData({
      patientName: "Demo Patient",
      recordId: recordId,
      notes: "Patient data decrypted successfully in browser memory.",
      keyUsed: secretKey
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-indigo-900">Provider Portal</h1>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Secure Record Access</h2>
        <p className="text-sm text-gray-600 mb-4">
          Paste the secure link provided by the patient. The decryption key will remain local to your browser.
        </p>
        <input 
          type="text" 
          className="w-full border p-3 rounded mb-4 bg-gray-50"
          placeholder="Paste URL here (e.g., https://.../rec_123#secret_key)"
          value={pastedUrl}
          onChange={(e) => setPastedUrl(e.target.value)}
        />
        <button 
          onClick={handleUnlock}
          className="bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 w-full font-medium"
        >
          Decrypt & View Record
        </button>
        {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
        {unlockedData && (
          <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-50 rounded">
            <h3 className="font-bold text-lg mb-2 text-green-800">🔓 Record Decrypted</h3>
            <p><strong>Patient:</strong> {unlockedData.patientName}</p>
            <p><strong>Record ID:</strong> {unlockedData.recordId}</p>
            <p><strong>Notes:</strong> {unlockedData.notes}</p>
            <p className="text-xs text-gray-500 mt-4 break-all">Local Key Used: {unlockedData.keyUsed}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. THE PATIENT'S VIEW (DASHBOARD + UPLOAD + COPILOT)
// ==========================================
function AccessDashboard() {
  const [vaultRecords, setVaultRecords] = useState([
    { id: 'rec_001', name: 'Blood Test Results - Jan 2026', type: 'Lab Report' },
    { id: 'rec_002', name: 'MRI Scan - Lumbar Spine', type: 'Imaging' }
  ]);
  const [activeShares, setActiveShares] = useState([]);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Copilot State
  const [aiActiveRecord, setAiActiveRecord] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const handleShare = (record) => {
    const secretKey = crypto.randomUUID().replace(/-/g, '');
    const secureUrl = `https://your-app.com/portal/${record.id}#${secretKey}`;
    const newShare = {
      shareId: crypto.randomUUID(),
      recordName: record.name,
      url: secureUrl,
      sharedOn: new Date().toLocaleDateString()
    };
    setActiveShares([...activeShares, newShare]);
  };

  const handleRevoke = (shareIdToRevoke) => {
    setActiveShares(activeShares.filter(share => share.shareId !== shareIdToRevoke));
  };

  // ==========================================
  // TEAM INTEGRATION ZONE: THE UPLOAD FUNCTION
  // ==========================================
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      // STEP 1: PEER 1'S ENCRYPTION
      // When Peer 1 is ready, they will encrypt 'selectedFile' here.
      
      // STEP 2: PEER 2'S DATABASE
      // When Peer 2 is ready, they will send the encrypted file to the DB here.
      
      // For now, we simulate the time it takes to encrypt and upload:
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const newRecord = {
        id: 'rec_' + Math.floor(Math.random() * 10000), 
        name: selectedFile.name,
        type: 'Uploaded Document' 
      };
      
      // Add the file to the Vault UI
      setVaultRecords([newRecord, ...vaultRecords]);
      setSelectedFile(null);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to connect to the Document Vault.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskCopilot = (record) => {
    setAiActiveRecord(record);
    setAiResponse('');
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      if (record.name.includes("Blood")) {
        setAiResponse("Your Hemoglobin and White Blood Cell counts are normal. Vitamin D is slightly low. Consider supplements.\n\n*PII was stripped locally before analysis.*");
      } else {
        setAiResponse("This shows slight age-related wear in your lower back. It is common and usually not serious.\n\n*PII was stripped locally before analysis.*");
      }
    }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Patient Access Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">My Medical Vault</h2>
            
            {/* UPLOAD ZONE */}
            <div className="mb-6 p-5 border-2 border-dashed border-gray-300 rounded-lg bg-white flex flex-col items-center justify-center">
              <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-3 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
              <button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading} 
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors w-full sm:w-auto"
              >
                {isUploading ? '🔒 Encrypting & Uploading...' : 'Upload to Vault'}
              </button>
              <p className="text-xs text-gray-400 mt-2">Files are encrypted locally before leaving your device.</p>
            </div>

            {vaultRecords.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 mb-2 bg-white rounded shadow-sm border">
                <div>
                  <div className="font-medium">{record.name}</div>
                  <div className="text-xs text-gray-500">{record.type}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAskCopilot(record)} className="bg-purple-100 text-purple-700 border border-purple-300 px-3 py-2 rounded hover:bg-purple-200 text-sm font-medium">
                    ✨ Ask Copilot
                  </button>
                  <button onClick={() => handleShare(record)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Active Shared Links</h2>
            {activeShares.length === 0 ? (
              <p className="text-gray-500 italic">No active links shared.</p>
            ) : (
              activeShares.map(share => (
                <div key={share.shareId} className="flex justify-between items-center p-3 mb-3 bg-white rounded shadow-sm border">
                  <div>
                    <div className="font-medium text-blue-800">{share.recordName}</div>
                    <code className="text-xs bg-gray-100 p-1 rounded break-all mt-1 block border">{share.url}</code>
                  </div>
                  <button onClick={() => handleRevoke(share.shareId)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm h-fit ml-4">
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COPILOT PANEL */}
        <div className="border rounded-lg p-4 bg-purple-50 shadow-inner h-fit">
          <h2 className="text-xl font-semibold mb-2 text-purple-900 flex items-center gap-2">✨ Health Copilot</h2>
          <p className="text-xs text-purple-600 mb-4 border-b border-purple-200 pb-2">
            Privacy Engine Active: All data is sanitized client-side before summarization.
          </p>
          {!aiActiveRecord && !isAiThinking && !aiResponse && (
            <p className="text-gray-500 text-sm italic text-center py-10">Select "Ask Copilot" on a record to translate jargon.</p>
          )}
          {isAiThinking && (
            <div className="flex flex-col items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-4"></div>
              <p className="text-purple-700 text-sm font-medium animate-pulse">Sanitizing PII & analyzing {aiActiveRecord?.name}...</p>
            </div>
          )}
          {aiResponse && (
            <div className="bg-white p-4 rounded border border-purple-200 text-sm text-gray-800 whitespace-pre-line shadow-sm">
              {aiResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN APP (Navigation Toggle)
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('patient');

  return (
    <div className="min-h-screen bg-gray-200 pb-10">
      <nav className="bg-gray-900 p-4 shadow-md flex justify-center gap-4">
        <button onClick={() => setCurrentView('patient')} className={`px-6 py-2 rounded font-medium transition-colors ${currentView === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          Patient View
        </button>
        <button onClick={() => setCurrentView('doctor')} className={`px-6 py-2 rounded font-medium transition-colors ${currentView === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          Doctor View
        </button>
      </nav>
      <div className="mt-4">
        {currentView === 'patient' ? <AccessDashboard /> : <ProviderPortal />}
      </div>
    </div>
  );
}
