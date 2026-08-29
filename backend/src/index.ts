import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
dotenv.config();
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import connect from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))

const PORT = process.env.PORT || 5000;

app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}))
app.use(cookieParser())


app.use("/api/v1/users",userRoutes)
app.use("/api/v1/auth",authRoutes)

app.use(errorHandler)

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });