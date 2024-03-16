import express from "express";
import { conn } from "../dbconnect";
import { register } from "../model/register";
import mysql from "mysql";



export const router = express.Router();
router.get("/:email/:password", (req, res) => {
    let email = req.params.email;
    let password = req.params.password;
    const sql ="SELECT * FROM users WHERE email = ? AND password = ?";
    conn.query(sql, [email, password], (err, result, fields) => {
            // ตรวจสอบว่ามีผลลัพธ์หรือไม่
            if (result && result.length > 0) {
                // ส่ง response กลับด้วยข้อมูลผู้ใช้
                res.json(result);
            } else {
                // ถ้าไม่พบผู้ใช้, ส่ง response กลับเป็น { success: false }
                res.json({
                    success: false,
                });
            }
    });
});

router.post("/register",(req,res)=>{
    let register : register = req.body;
    let sql = "INSERT INTO users(email, name,password,types) VALUES (?,?,?,?)";
    sql = mysql.format(sql,[
        register.email,
        register.name,
        register.password,
        register.types,
    ]);
    conn.query(sql,(err,result)=>{
        if(err)throw err;
        res.status(201).json({affected_row: result.affectedRows });
    });
});