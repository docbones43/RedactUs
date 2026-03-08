/**
 * RedactUs Core Engine v1.2
 * MIT Licence — https://github.com/nicholasgriffintn/redactus
 *
 * Client-side PII redaction. Zero dependencies. Works offline.
 * Runs entirely in the browser BEFORE any data is sent to server or LLMs.
 *
 * Usage:
 *   import { redactText, createRedactor } from './redactus-engine.js';
 *
 *   // Simple (uses UK patterns by default):
 *   const result = redactText("Patient: John Smith, NHS 943 476 5919");
 *   console.log(result.redactedText);  // "Patient: [NAME-REDACTED], [NHS-REDACTED]"
 *   console.log(result.totalRedacted); // 2
 *
 *   // With region:
 *   const redactor = createRedactor({ region: 'US' });
 *   const result = redactor.redact("SSN: 123-45-6789");
 */

// ── Pre-processor ──────────────────────────────────────────────────

function _stripFormatting(text) {
  return text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/(?<!\S)\*(?!\s)/g, '').replace(/(?<!\s)\*(?!\S)/g, '')
    .replace(/~~/g, '')
    .replace(/\u200B/g, '');
}

// ── Pattern Libraries ──────────────────────────────────────────────

const UK_PATTERNS = {
  nhs_number: { regex: /\b\d{3}\s?\d{3}\s?\d{4}\b/g, token: '[NHS-REDACTED]', label: 'NHS Number' },
  ni_number: { regex: /\b[A-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi, token: '[NI-REDACTED]', label: 'NI Number' },
  uk_postcode: { regex: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, token: '[POSTCODE-REDACTED]', label: 'Postcode' },
  uk_address: { regex: /\b\d{1,4}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Street|St|Lane|Ln|Road|Rd|Avenue|Ave|Drive|Dr|Close|Way|Place|Pl|Crescent|Terrace|Court|Ct|Gardens|Grove|Park|Mews|Row|Rise|Hill|Walk|Square|Passage|Yard|Boulevard|Blvd)\b/gi, token: '[ADDRESS-REDACTED]', label: 'Address' },
  flat_address: { regex: /\b(?:Flat|Apartment|Apt\.?|Unit|Suite)\s+\w+,?\s*(?:\d{1,4}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Street|St|Lane|Ln|Road|Rd|Avenue|Ave|Drive|Dr|Close|Way|Place|Pl|Crescent|Terrace|Court|Ct|Gardens|Grove|Park|Mews|Row|Rise|Hill|Walk|Square|Boulevard|Blvd))?/gi, token: '[ADDRESS-REDACTED]', label: 'Address' },
};

const US_PATTERNS = {
  us_address_full: { regex: /\b\d{1,5}\s+(?:[NSEW]{1,2}\.?\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s+(?:Street|St|Lane|Ln|Road|Rd|Avenue|Ave|Drive|Dr|Close|Way|Place|Pl|Court|Ct|Boulevard|Blvd|Circle|Cir|Parkway|Pkwy|Highway|Hwy)\.?(?:,?\s+(?:(?:Suite|Ste|Apt|Unit|#)\s*\w+,?\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)?/gi, token: '[ADDRESS-REDACTED]', label: 'Address' },
  us_city_state_zip: { regex: /(?:,\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?/g, token: '[ADDRESS-REDACTED]', label: 'Address' },
  us_phone: { regex: /(?<!\d)\(?\d{3}\)?[\s.\-\u2011\u2013]\d{3}[\s.\-\u2011\u2013]\d{4}(?!\d)/g, token: '[PHONE-REDACTED]', label: 'Phone' },
  us_zip: { regex: /\b\d{5}(?:-\d{4})?\b/g, token: '[ZIP-REDACTED]', label: 'ZIP Code', contextRequired: true, contextKeywords: ['zip','address','addr','state','city','street','ave','blvd','rd','dr','apt'] },
};

const EU_PATTERNS = {
  eu_iban: { regex: /\b[A-Z]{2}\d{2}\s?(?:\d{4}\s?){3,7}\d{1,4}\b/gi, token: '[IBAN-REDACTED]', label: 'IBAN' },
  eu_healthcard: { regex: /\b\d{10,20}\b/g, token: '[HEALTHCARD-REDACTED]', label: 'Health Card', contextRequired: true, contextKeywords: ['ehic','health card','insurance','versicherung','carte vitale','tessera sanitaria'] },
};

// Base patterns — always active regardless of region
// ORDER MATTERS: SSN before phone, MRN before phone (both match digit sequences)
const BASE_PATTERNS = {
  ssn: { regex: /\b\d{3}[\-\u2011\u2013]\d{2}[\-\u2011\u2013]\d{4}\b/g, token: '[SSN-REDACTED]', label: 'SSN' },
  mrn: { regex: /\b\d{5,10}\b/g, token: '[MRN-REDACTED]', label: 'MRN', contextRequired: true, contextKeywords: ['mrn','medical record','med rec','patient id','patient no','hospital number'] },
  phone: { regex: /(?<!\d)(?:(?:\+44|\+1)\s?(?:\(\d{3}\)\s?|\d)[\d \-\u2011\u2013\(\)]{7,14}|(?<!\d)0\d{2,4}[\s]?\d{3,4}[\s]?\d{3,4}|\(\d{3}\)\s?\d{3}[\s.\-\u2011\u2013]\d{4})/g, token: '[PHONE-REDACTED]', label: 'Phone' },
  email: { regex: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}/g, token: '[EMAIL-REDACTED]', label: 'Email' },
  dob: { regex: /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/g, token: '[DOB-REDACTED]', label: 'Date of Birth', contextRequired: true },
  hospital_ref: { regex: /\b[A-Z]{1,4}[\-\u2011\u2013]\d{4}[\-\u2011\u2013]\d{2,6}(?:[\-\u2011\u2013]\d{2,4})?\b/g, token: '[REF-REDACTED]', label: 'Hospital Reference', contextRequired: true, contextKeywords: ['hospital number','hospital no','patient id','mrn','reference','hosp'] },
  insurance_id: { regex: /\b[A-Z]{1,6}[\-\u2011\u2013]\d{2,10}(?:[\-\u2011\u2013]\d{2,10})*(?:[\-\u2011\u2013][A-Z]{2,4})?\b/g, token: '[INSURANCE-REDACTED]', label: 'Insurance/Policy ID', contextRequired: true, contextKeywords: ['insurance','policy','membership','plan','member','provider','group','grp'] },
  auth_claim: { regex: /\b[A-Z\d]{2,5}[\-\u2011\u2013](?:[A-Z]{2,5}[\-\u2011\u2013])?[\d\-\u2011\u2013]{4,25}\b/g, token: '[CLAIM-REDACTED]', label: 'Auth/Claim Code', contextRequired: true, contextKeywords: ['auth','authorization','authorisation','claim','pre-auth','prior auth','approval','claim id'] },
  transaction_id: { regex: /\b(?:TXN|REF|INV)[\-\u2011\u2013][\d\-\u2011\u2013]{8,25}\b/gi, token: '[TRANSACTION-REDACTED]', label: 'Transaction ID' },
  card_last4: { regex: /\b\d{4}\b/g, token: '[CARD-REDACTED]', label: 'Card Digits', contextRequired: true, contextKeywords: ['last 4','last four','card','digits'] },
};

const DOB_CONTEXT_KEYWORDS = ['dob','date of birth','born','birthday','patient','d.o.b','d.o.b.'];

// Clinician prefix patterns — multi-word name capture (up to 5 words)
const CLINICIAN_PREFIXES = [
  /\bseen by dr\.?\s+[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bconsultant:?\s*dr\.?\s+[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\breferring (?:clinician|physician):?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bgp:?\s*dr\.?\s+[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bgp\s+name:?\s*dr\.?\s+[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\battending(?:\s+physician)?:?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bdoctor:?\s*[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\breported by:?\s*dr\.?\s+[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bordering\s+(?:physician|provider):?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bphysician:?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bprovider:?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bpractitioner:?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bclinician:?\s*(?:dr\.?\s+)?[A-Z][\w.]+(?:\s+[A-Z][\w.]+){0,4}/gi,
  /\bDr\.?\s+[A-Z][a-z]+\s+[A-Z]\.?\s*[A-Z][a-z]+/g,
];

const HOSPITAL_PREFIXES = [
  /\bat\s+(?:the\s+)?(?:[A-Z][a-zA-Z'.]+\s+){0,4}(?:hospital|clinic|surgery|medical cent(?:re|er)|health cent(?:re|er)|infirmary)\b/gi,
  /\bhospital:\s*(?:[A-Z][a-zA-Z'.]+\s*)+/gi,
  /\bclinic:\s*(?:[A-Z][a-zA-Z'.]+\s*)+/gi,
  /\bgp\s+practice:?\s*(?:[A-Z][a-zA-Z'.]+\s*)+/gi,
  /\b(?:[A-Z][a-zA-Z'.]+\s+){1,4}(?:medical cent(?:re|er)|hospital|clinic|infirmary)(?:\s*[\u2013\u2014\-]\s*[A-Z][a-zA-Z\s]+)?/gi,
];

const INSURER_PREFIXES = [
  /\binsurance +provider:? *[A-Z][a-zA-Z'.]+(?:[ ]+[A-Z][a-zA-Z'.]+)*/gi,
  /\binsurer:? *[A-Z][a-zA-Z'.]+(?:[ ]+[A-Z][a-zA-Z'.]+)*/gi,
];

const CO_OCCURRING_DATE_CONTEXT = ['hospital','clinic','seen by','consultant','gp:','surgery','appointment','attended','visit','referred'];

const NAME_PATTERNS = [
  /\bpatient:\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bname:\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bdear\s+(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bpatient\s+name:\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bnext of kin(?!\s+(?:phone|email|address|mobile|tel)):?\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bemergency contact(?!\s+(?:phone|email|address|mobile|tel)):?\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bguarantor(?:\s+name)?:?\s*(?:Mr\.?\s+|Mrs?\.?\s+|Ms\.?\s+|Dr\.?\s+)?([A-Z][a-z]+(?:[^\S\n]+[A-Z][a-z]*\.?){0,4})/gi,
  /\bcardholder(?:\s+name)?:?\s*([A-Z][A-Z\s]{1,30})\b/gi,
];

// ── Internal helpers ───────────────────────────────────────────────

function _getPatterns(region) {
  let patterns = {};
  if (region === 'US') {
    patterns = { ...US_PATTERNS, ...UK_PATTERNS };
  } else {
    patterns = { ...UK_PATTERNS };
  }
  if (region === 'EU') patterns = { ...patterns, ...EU_PATTERNS };
  patterns = { ...patterns, ...BASE_PATTERNS };
  return patterns;
}

function _redactWithContext(text, def, track) {
  const keywords = def.contextKeywords || [];
  return text.split('\n').map(line => {
    const lower = line.toLowerCase();
    if (!keywords.some(kw => lower.includes(kw))) return line;
    const re = new RegExp(def.regex.source, def.regex.flags);
    const matches = line.match(re);
    if (matches) { matches.forEach(m => track(def.label, m)); return line.replace(re, def.token); }
    return line;
  }).join('\n');
}

function _redactDatesInContext(text, def, track) {
  for (const kw of DOB_CONTEXT_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const proximityRe = new RegExp(escaped + '[:\\s,;.\\-]{0,10}' + def.regex.source, 'gi');
    const matches = text.match(proximityRe);
    if (matches) {
      for (const m of matches) {
        const dateMatch = m.match(new RegExp(def.regex.source));
        if (dateMatch) { track(def.label, dateMatch[0]); text = text.replace(dateMatch[0], def.token); }
      }
    }
  }
  return text;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Redact personal identifiers from text.
 * @param {string} text - Raw text to redact
 * @param {object} [options] - Configuration
 * @param {string} [options.region='UK'] - Pattern region: 'UK', 'US', or 'EU'
 * @returns {{ redactedText: string, totalRedacted: number, stats: object }}
 */
export function redactText(text, options = {}) {
  const region = options.region || 'UK';

  if (!text || typeof text !== 'string') {
    return { redactedText: text, totalRedacted: 0, stats: {} };
  }

  let result = _stripFormatting(text);
  let totalRedacted = 0;
  const stats = {};

  const track = (label, fragment) => {
    totalRedacted++;
    stats[label] = (stats[label] || 0) + 1;
  };

  // Priority 1: Region + base patterns
  const patterns = _getPatterns(region);
  for (const [id, def] of Object.entries(patterns)) {
    if (def.contextRequired) {
      if (def.contextKeywords) {
        result = _redactWithContext(result, def, track);
      } else {
        result = _redactDatesInContext(result, def, track);
      }
    } else {
      const re = new RegExp(def.regex.source, def.regex.flags);
      const matches = result.match(re);
      if (matches) { matches.forEach(m => track(def.label, m)); result = result.replace(re, def.token); }
    }
  }

  // Priority 2: Insurer/Clinician/Org prefixes (insurer first — more specific)
  const placeholders = [];
  result = result.replace(/\[[A-Z\-]+-REDACTED\]/g, (m) => {
    const ph = `__PH_${placeholders.length}__`;
    placeholders.push(m);
    return ph;
  });

  for (const regex of INSURER_PREFIXES) {
    const re = new RegExp(regex.source, regex.flags);
    const matches = result.match(re);
    if (matches) {
      for (const m of matches) {
        if (m.includes('__PH_')) continue;
        track('Insurer', m);
        result = result.replace(m, '[INSURER-REDACTED]');
      }
    }
  }

  for (const regex of CLINICIAN_PREFIXES) {
    const re = new RegExp(regex.source, regex.flags);
    const matches = result.match(re);
    if (matches) {
      for (const m of matches) {
        if (m.includes('__PH_')) continue;
        track('Clinician', m);
        result = result.replace(m, '[CLINICIAN-REDACTED]');
      }
    }
  }

  for (const regex of HOSPITAL_PREFIXES) {
    const re = new RegExp(regex.source, regex.flags);
    const matches = result.match(re);
    if (matches) {
      for (const m of matches) {
        if (m.includes('__PH_')) continue;
        track('Hospital', m);
        result = result.replace(m, '[HOSPITAL-REDACTED]');
      }
    }
  }

  for (const regex of INSURER_PREFIXES) {
    const re = new RegExp(regex.source, regex.flags);
    const matches = result.match(re);
    if (matches) {
      for (const m of matches) {
        if (m.includes('__PH_')) continue;
        track('Insurer', m);
        result = result.replace(m, '[INSURER-REDACTED]');
      }
    }
  }

  placeholders.forEach((tok, i) => {
    result = result.replace(`__PH_${i}__`, tok);
  });

  // Co-occurring dates
  const dateRegex = /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/g;
  result = result.split('\n').map(line => {
    const lower = line.toLowerCase();
    if (!CO_OCCURRING_DATE_CONTEXT.some(kw => lower.includes(kw))) return line;
    const matches = line.match(dateRegex);
    if (matches) { matches.forEach(m => track('Co-occurring Date', m)); return line.replace(dateRegex, '[DATE-REDACTED]'); }
    return line;
  }).join('\n');

  // Priority 3: Name detection (heuristic)
  for (const regex of NAME_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(result)) !== null) {
      if (match[1] && !match[1].includes('REDACTED')) {
        track('Name', match[1]);
        result = result.replace(match[1], '[NAME-REDACTED]');
      }
    }
  }

  return { redactedText: result, totalRedacted, stats };
}

/**
 * Create a configured redactor instance.
 * @param {object} [config] - Configuration
 * @param {string} [config.region='UK'] - Pattern region
 * @returns {{ redact: function }}
 */
export function createRedactor(config = {}) {
  const region = config.region || 'UK';
  return {
    redact: (text) => redactText(text, { region }),
  };
}
