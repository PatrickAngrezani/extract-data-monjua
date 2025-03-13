import express from "express";
import bodyParser from "body-parser";
import { formRouter } from "./routes/formRoutes.js";

const app = express();
app.use(bodyParser.json());

//routes
app.use("/webhook/form", formRouter);
app.get("/webhook/form", (req, res) => {
  console.log("Testing webhook from zoho");
  res.send("Server is running");
});

app.get("/callback", (req, res) => {
  console.log({ code: req.query.code });
  res.send("callback called");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
