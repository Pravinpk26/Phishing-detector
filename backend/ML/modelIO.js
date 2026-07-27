// backend/ml/modelIO.js
//
// We're using the pure-JS "@tensorflow/tfjs" package (no native
// bindings) so this project installs cleanly on any machine, including
// Windows, without a C++ build toolchain. The tradeoff is that the
// convenient `file://` save/load handlers are only registered by
// "@tensorflow/tfjs-node" -- so we implement a small manual save/load
// using tf.io.withSaveHandler / tf.io.fromMemory instead. This writes
// two files: model-topology.json (architecture + weight specs) and
// weights.bin (raw weight bytes).

const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs");

const TOPOLOGY_FILE = "model-topology.json";
const WEIGHTS_FILE = "weights.bin";

/**
 * Saves a trained tf.LayersModel to a directory as two files.
 * @param {tf.LayersModel} model
 * @param {string} dir - directory to save into (created if missing)
 */
async function saveModel(model, dir) {
  fs.mkdirSync(dir, { recursive: true });

  let capturedArtifacts = null;

  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      capturedArtifacts = artifacts;
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON"
        }
      };
    })
  );

  const weightBuffer = Buffer.from(capturedArtifacts.weightData);
  fs.writeFileSync(path.join(dir, WEIGHTS_FILE), weightBuffer);

  const topologyJson = {
    modelTopology: capturedArtifacts.modelTopology,
    weightSpecs: capturedArtifacts.weightSpecs,
    format: capturedArtifacts.format,
    generatedBy: capturedArtifacts.generatedBy,
    convertedBy: capturedArtifacts.convertedBy
  };
  fs.writeFileSync(
    path.join(dir, TOPOLOGY_FILE),
    JSON.stringify(topologyJson)
  );
}

/**
 * Loads a tf.LayersModel previously saved with saveModel().
 * @param {string} dir - directory the model was saved into
 * @returns {Promise<tf.LayersModel>}
 */
async function loadModel(dir) {
  const topologyPath = path.join(dir, TOPOLOGY_FILE);
  const weightsPath = path.join(dir, WEIGHTS_FILE);

  if (!fs.existsSync(topologyPath) || !fs.existsSync(weightsPath)) {
    throw new Error(`No saved model found in ${dir}. Run "npm run train-model" first.`);
  }

  const topologyJson = JSON.parse(fs.readFileSync(topologyPath, "utf8"));
  const weightBuffer = fs.readFileSync(weightsPath);

  // Convert Node Buffer to a plain ArrayBuffer slice tf.js expects.
  const weightData = weightBuffer.buffer.slice(
    weightBuffer.byteOffset,
    weightBuffer.byteOffset + weightBuffer.byteLength
  );

  const model = await tf.loadLayersModel(
    tf.io.fromMemory({
      modelTopology: topologyJson.modelTopology,
      weightSpecs: topologyJson.weightSpecs,
      weightData
    })
  );

  return model;
}

function modelExists(dir) {
  return (
    fs.existsSync(path.join(dir, TOPOLOGY_FILE)) &&
    fs.existsSync(path.join(dir, WEIGHTS_FILE))
  );
}

module.exports = { saveModel, loadModel, modelExists };
