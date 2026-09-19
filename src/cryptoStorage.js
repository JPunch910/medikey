const DB_NAME = "MediKeyDB"
const STORE_NAME = "keys"

export async function saveKeyPair(keyPair, password) {
  const privateKeyData = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  )

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  const encryptionKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  )

  const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    encryptionKey,
    privateKeyData
  )

  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  )

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)

      store.put(
        {
          publicKeyJwk,
          encryptedPrivateKey,
          salt,
          iv
        },
        "authenticationKeyPair"
      )

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

export function getStoredData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)

      const getRequest = store.get("authenticationKeyPair")

      getRequest.onsuccess = () => {
        db.close()
        resolve(getRequest.result)
      }

      getRequest.onerror = () => {
        db.close()
        reject(getRequest.error)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

export async function unlockPrivateKey(password) {
  const stored = await getStoredData()

  if (!stored) {
    throw new Error("No saved key found.")
  }

  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  const encryptionKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: stored.salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["decrypt"]
  )

  const privateKeyData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: stored.iv
    },
    encryptionKey,
    stored.encryptedPrivateKey
  )

  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyData,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["sign"]
  )

  return {
    privateKey,
    publicKeyJwk: stored.publicKeyJwk
  }
}