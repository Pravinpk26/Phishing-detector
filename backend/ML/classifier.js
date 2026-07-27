// backend/ml/classifier.js
//
// Runtime wrapper around the trained TensorFlow.js model. Loads the
// saved model once (lazily, on first use) and exposes a simple
// predictPhishing(text) function returning a 0-100 AI score plus a
// 0-1 confidence value.
//
// If no trained model is found on disk, this fails gracefully: the
// caller gets a null result and the rest of the app (rule engine)
// keeps working exactly as before -- the AI layer is additive, never
// a hard dependency.

const path = require("path");
const tf = require("@tensorflow/tfjs");

const { textToFeatureVector } = require("./featureExtractor");
const { loadModel, modelExists } = require("./modelIO");

const MODEL_DIR = path.join(__dirname, "saved-model");

let modelPromise = null;
let modelLoadFailed = false;

function getModel() {
  if (modelLoadFailed) return Promise.resolve(null);

  if (!modelPromise) {
    if (!modelExists(MODEL_DIR)) {
      console.warn(
        "[ML] No trained model found in backend/ml/saved-model. " +
        "Run 'npm run train-model' to enable AI-based scoring. " +
        "Falling back to rule-based scoring only."
      );
      modelLoadFailed = true;
      return Promise.resolve(null);
    }

    modelPromise = loadModel(MODEL_DIR).catch((err) => {
      console.error("[ML] Failed to load model, falling back to rule-based scoring only:", err.message);
      modelLoadFailed = true;
      return null;
    });
  }

  return modelPromise;
}

/**
 * Runs the trained model on a piece of email text.
 *
 * @param {string} text - combined subject + body text
 * @returns {Promise<{ score: number, confidence: number } | null>}
 *   score: 0-100 phishing likelihood
 *   confidence: 0-1, how far the prediction is from the 0.5 midpoint
 *     (0 = model is unsure, 1 = model is very sure either way)
 *   Returns null if no model is available (caller should fall back to
 *   rule-based scoring alone).
 */
async function predictPhishing(text) {
  const model = await getModel();
  if (!model) return null;

  const vector = textToFeatureVector(text || "");

  const inputTensor = tf.tensor2d([vector]);
  const outputTensor = model.predict(inputTensor);
  const [probability] = await outputTensor.data();

  inputTensor.dispose();
  outputTensor.dispose();

  const score = Math.round(probability * 100);
  const confidence = Math.round(Math.abs(probability - 0.5) * 2 * 100) / 100;

  return { score, confidence };
}

module.exports = { predictPhishing };
