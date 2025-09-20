// Utility functions for skill matching and scoring

function normalizeToArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  // support comma-separated string
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);
}

function includesToken(hay, needle) {
  // token-based contains in either direction
  const h = tokenize(hay);
  const n = tokenize(needle);
  if (!h.length || !n.length) return false;
  // If any token from needle exists in hay tokens
  return n.some((tok) => h.includes(tok));
}

export function calculateMatchScore(userSkillsInput, requiredInput) {
  const userSkills = normalizeToArray(userSkillsInput);
  const required = Array.from(new Set(normalizeToArray(requiredInput)));

  if (!required.length || !userSkills.length) {
    return { score: 0, matched: [], missing: required };
  }

  const matched = required.filter((req) => userSkills.some((u) => includesToken(u, req) || includesToken(req, u)));
  const missing = required.filter((req) => !matched.includes(req));
  const score = Math.round((matched.length / required.length) * 100);
  return { score, matched, missing };
}

export default { calculateMatchScore };
