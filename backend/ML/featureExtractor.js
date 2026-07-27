// backend/ml/featureExtractor.js
//
// Converts raw email text (subject + body combined) into a fixed-length
// numeric vector: one entry per word in VOCABULARY, set to 1 if the
// word appears anywhere in the text, 0 otherwise ("bag of words").
//
// This same function is used both at training time and at prediction
// time, so the model always sees vectors in the exact same shape.

const { VOCABULARY } = require("./vocabulary");

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * @param {string} text - raw email text (e.g. `${subject} ${body}`)
 * @returns {number[]} vector of length VOCABULARY.length, values 0 or 1
 */
function textToFeatureVector(text) {
  const words = new Set(tokenize(text));
  return VOCABULARY.map((vocabWord) => (words.has(vocabWord) ? 1 : 0));
}

module.exports = { textToFeatureVector, tokenize, VOCAB_SIZE: VOCABULARY.length };
