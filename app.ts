import express from "express";
// import {router as index} from "./api/index";
// import {router as trip} from "./api/trip";
import {router as login} from "./api/login";
import {router as image} from "./api/image";
import {router as vote} from "./api/vote";
import {router as ranks} from "./api/ranks";
import bodyParser from "body-parser";
import cors from "cors";


//app = Web API
export const app = express();


app.use(
  cors({
    origin: "*",
  })
);
//request and response
// app.use("/",(req, res)=>{
//     res.send("Hello World!!!!");
// });
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/login", login);
app.use("/img", image);
app.use("/vote", vote);
app.use("/ranks", ranks);

// app.use("/", index);
// app.use("/trip", trip);
