// backend/ml/trainModel.js
//
// Builds and trains a small neural network that classifies email text
// as phishing (1) or legitimate (0), then saves it to
// backend/ml/saved-model/ so the server can load it at runtime without
// retraining every time.
//
// Run this whenever you:
//   - change the vocabulary (vocabulary.js)
//   - add/edit training examples (trainingData.js)
//   - want to retrain from scratch
//
// Usage:
//   npm run train-model
//
// Training runs in pure JS on the CPU backend (no native binaries, no
// GPU needed) — it's a tiny model and finishes in a few seconds.

const path = require("path");
const tf = require("@tensorflow/tfjs");

const { TRAINING_DATA } = require("./trainingData");
const { textToFeatureVector, VOCAB_SIZE } = require("./featureExtractor");
const { saveModel } = require("./modelIO");

const MODEL_SAVE_DIR = path.join(__dirname, "saved-model");

function buildModel(inputSize) {
  const model = tf.sequential();

  model.add(tf.layers.dense({
    inputShape: [inputSize],
    units: 16,
    activation: "relu"
  }));

  model.add(tf.layers.dense({
    units: 8,
    activation: "relu"
  }));

  model.add(tf.layers.dense({
    units: 1,
    activation: "sigmoid" // outputs a 0-1 phishing probability
  }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

async function train() {
  console.log(`Training on ${TRAINING_DATA.length} examples, vocab size ${VOCAB_SIZE}...`);

  const xs = TRAINING_DATA.map((ex) => textToFeatureVector(ex.text));
  const ys = TRAINING_DATA.map((ex) => [ex.label]);

  const xTensor = tf.tensor2d(xs);
  const yTensor = tf.tensor2d(ys);

  const model = buildModel(VOCAB_SIZE);

  await model.fit(xTensor, yTensor, {
    epochs: 60,
    batchSize: 8,
    shuffle: true,
    validationSplit: 0.15,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0 || epoch === 0) {
          console.log(
            `Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)} ` +
            `acc=${logs.acc.toFixed(4)} val_acc=${(logs.val_acc ?? 0).toFixed(4)}`
          );
        }
      }
    }
  });

  await saveModel(model, MODEL_SAVE_DIR);
  console.log(`\nModel saved to ${MODEL_SAVE_DIR}`);

  xTensor.dispose();
  yTensor.dispose();
}

train()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Training failed:", err);
    process.exit(1);
  });
