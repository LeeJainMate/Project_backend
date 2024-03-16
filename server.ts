import http from "http";
import { app } from "./app";

const port = process.env.port || 3000; //ประกาศตัวแปรชื่อว่า port ขึ้นมา
const server = http.createServer(app);

//Start Server at port number
server.listen(port,()=>{
    console.log("Server is started");
    
}); //เปิดและรอการรับเข้ามา