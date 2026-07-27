const express = require("express");
const cors = require("cors");
const analysisRouter = require("./routes/analysis");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// /analyze-url, /analyze-email, /latest-scan
app.use(analysisRouter);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
