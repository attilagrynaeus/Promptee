// src/setupTests.js
require('@testing-library/jest-dom');

if (!global.crypto) global.crypto = {};
if (!crypto.randomUUID) crypto.randomUUID = () => 'test-uuid';

if (!global.TextEncoder || !global.TextDecoder) {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

