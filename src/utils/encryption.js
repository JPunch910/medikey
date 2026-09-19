export async function encryptText(text) {
  const encoder = new TextEncoder();

  // Convert the text into data that can be encrypted
  const data = encoder.encode(text);

  // Create an AES-GCM encryption key
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Create a random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return {
    encryptedData,
    iv,
    key,
  };
}