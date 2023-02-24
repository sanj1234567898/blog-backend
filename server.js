import express from "express";
import mongoose from "mongoose";
import {
  registerValidation,
  loginValidator,
  postCreateValidator,
} from "./validations.js";
import { UserController, PostController } from "./controllers/index.js";
import { handleValidationErrors, checkAuth } from "./utils/index.js";
import multer from "multer";
import fs from "fs";
import cors from "cors";

const PORT = 4444;
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://admin:qwerty12345@cluster0.qvchahz.mongodb.net/blog?retryWrites=true&w=majority`
  )
  .then(() => console.log(`connected to DB`))
  .catch((err) => console.log(`DB error ${err.message}`));

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  "/auth/login",
  loginValidator,
  handleValidationErrors,
  UserController.login
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/tags", PostController.getTags);

app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getTags);
app.get("/posts/:id", PostController.getOne);
app.patch("/posts/:id", checkAuth, postCreateValidator, PostController.update);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.post("/posts", checkAuth, postCreateValidator, PostController.create);

app.listen(PORT, (err) => {
  err ? console.error(err) : console.log(`Server ${PORT}'s OK`);
});
