export function detectPII(text) {
  const results = [];

  const patterns = [
    {
      type: "EMAIL",
      regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    },
    {
      type: "PHONE",
      regex: /(\+91[\s-]?)?[6-9]\d{9}/g,
    },
    {
      type: "AADHAAR",
      regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    },
  ];

  patterns.forEach((pattern) => {
    const matches = text.match(pattern.regex);

    if (matches) {
      matches.forEach((match) => {
        results.push({
          type: pattern.type,
          value: match,
        });
      });
    }
  });

  return results;
}
export function redactPII(text) {
  let sanitized = text;

  sanitized = sanitized.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[REDACTED_EMAIL]"
  );

  sanitized = sanitized.replace(
    /(\+91[\s-]?)?[6-9]\d{9}/g,
    "[REDACTED_PHONE]"
  );

  sanitized = sanitized.replace(
    /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    "[REDACTED_ID]"
  );

  return sanitized;
}