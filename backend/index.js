import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 5500, () => {
  console.log("Server is running on port 5500");
});
