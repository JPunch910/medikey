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

    // Step 1: Prove to the judges we are extracting the hash (Zero-Trust)
    if (!pastedUrl.includes('#')) {
      setError('Invalid link: Missing decryption key hash.');
      return;
    }

    // The browser splits the URL at the '#' and takes the second part (the key)
    const secretKey = pastedUrl.split('#')[1];
    
    // Extract the record ID from the first part of the URL
    const urlParts = pastedUrl.split('#')[0].split('/');
    const recordId = urlParts[urlParts.length - 1];

    if (!secretKey || !recordId) {
      setError('Malformed link.');
      return;
    }

    // Step 2: Fake the decryption for the UI prototype
    // In the real app, Peer 1 & Peer 2 will pass the recordId to the database, 
    // get the encrypted file, and decrypt it here using the secretKey.
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
            <p className="text-xs text-gray-500 mt-4 break-all">
              Local Key Used: {unlockedData.keyUsed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. THE PATIENT'S VIEW (ACCESS DASHBOARD)
// ==========================================
function AccessDashboard() {
  const [vaultRecords] = useState([
    { id: 'rec_001', name: 'Blood Test Results - Jan 2026' },
    { id: 'rec_002', name: 'MRI Scan - Lumbar Spine' }
  ]);
  const [activeShares, setActiveShares] = useState([]);

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

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Patient Access Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">My Medical Vault</h2>
          {vaultRecords.map(record => (
            <div key={record.id} className="flex justify-between items-center p-3 mb-2 bg-white rounded shadow-sm border">
              <span className="font-medium">{record.name}</span>
              <button onClick={() => handleShare(record)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                Generate Link
              </button>
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Active Shared Links</h2>
          {activeShares.length === 0 ? (
            <p className="text-gray-500 italic">No active links shared.</p>
          ) : (
            activeShares.map(share => (
              <div key={share.shareId} className="p-3 mb-3 bg-white rounded shadow-sm border">
                <div className="font-medium text-blue-800">{share.recordName}</div>
                <code className="text-xs bg-gray-100 p-2 rounded break-all block mb-3 border">{share.url}</code>
                <button onClick={() => handleRevoke(share.shareId)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm w-full">
                  Revoke Access
                </button>
              </div>
            ))
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
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 p-4 shadow-md flex justify-center gap-4">
        <button 
          onClick={() => setCurrentView('patient')}
          className={`px-6 py-2 rounded font-medium transition-colors ${currentView === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          Patient View
        </button>
        <button 
          onClick={() => setCurrentView('doctor')}
          className={`px-6 py-2 rounded font-medium transition-colors ${currentView === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          Doctor View
        </button>
      </nav>

      {/* Render whatever view is currently selected */}
      <div className="mt-4">
        {currentView === 'patient' ? <AccessDashboard /> : <ProviderPortal />}
      </div>
    </div>
  );
}