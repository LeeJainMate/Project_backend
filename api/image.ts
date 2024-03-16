import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { getImg } from "../model/getImg";
export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('select * from shoes', (err, result, fields) => {
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

router.put("/update/:sid", async (req, res) => {
    //1. Receive data from requrst
    const sid = +req.params.sid;
    let img: getImg = req.body;

    let sql = "update  `shoes` set `score`=? where `sid`=?";
    sql = mysql.format(sql, [
        img.score,
        sid
    ]);
    //5.Send Query for updata
    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            affected_row: result.affectedRows
        });
    });
});

function queryAsync(sql: string) {
    throw new Error("Function not implemented.");
}
