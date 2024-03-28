import express from "express";
import { conn, mysql, queryAsync } from "../dbconnect";
import { VoteItem } from "../model/rankget";
export const router = express.Router();

router.get("/yesterday", (req, res) => {
  conn.query(
    `
    SELECT  
    shoes.*,
        ROW_NUMBER() OVER (ORDER BY SUM(vote.score) DESC) AS rankingyesterday
    FROM 
    shoes,vote
    WHERE  
    shoes.sid = vote.sid_fk
    AND 
        DATE(vote.date) < CURDATE()
    GROUP BY 
        shoes.sid, shoes.image, shoes.name, shoes.score, shoes.uid_fk
    ORDER BY 
        shoes.score DESC
    LIMIT 0, 10 `,
    (err, result, fields) => {
      if (result && result.length > 0) {
        // ส่ง response กลับด้วยข้อมูลผู้ใช้
        res.json(result);
      } else {
        // ถ้าไม่พบผู้ใช้, ส่ง response กลับเป็น { success: false }
        res.json({
          success: false,
        });
      }
    }
  );
});

router.get("/today", (req, res) => {
    conn.query(
      `
      SELECT  
      shoes.*,
      ROW_NUMBER() OVER (ORDER BY SUM(vote.score) DESC) AS rankingtoday
  FROM 
      shoes
  INNER JOIN 
      vote ON shoes.sid = vote.sid_fk
  GROUP BY 
      shoes.sid, shoes.image, shoes.name, shoes.score, shoes.uid_fk
  ORDER BY 
      shoes.score DESC
  LIMIT 0, 10;  `,
      (err, result, fields) => {
        if (result && result.length > 0) {
          // ส่ง response กลับด้วยข้อมูลผู้ใช้
          res.json(result);
        } else {
          // ถ้าไม่พบผู้ใช้, ส่ง response กลับเป็น { success: false }
          res.json({
            success: false,
          });
        }
      }
    );
  });


const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// #######################################################################################

router.get("/graph/:uid", async (req, res) => {
  const uid = +req.params.uid;
  let day7: any = {};
  // เริ่มที่วันที่ 6 ถึง 0 (แทน 7 วันย้อนหลัง)
  for (let i = 6; i >= 0; i--) {
    let sql: string;
    if (i === 0) {
      sql = mysql.format(
        `SELECT 
        shoes.sid,
        shoes.name,
        DATE(CURDATE()) AS voteDate,
        0+SUM(vote.score) as score,
        shoes.image
      FROM vote, shoes
      WHERE vote.sid_fk = shoes.sid
      AND vote.uid_fk = ?
      GROUP BY sid, DATE(CURDATE()), shoes.image, shoes.name`,
        [uid]
      );
    } else {
      sql = mysql.format(
        `SELECT 
          shoes.sid,
          shoes.name,
          DATE(DATE_SUB(NOW(), INTERVAL ? DAY)) AS voteDate,
          500+SUM(CASE WHEN DATE(vote.date) <= CURDATE() - INTERVAL ? DAY THEN vote.score ELSE 0 END) AS score,
          shoes.image
        FROM vote, shoes
        WHERE vote.sid_fk = shoes.sid
        AND vote.uid_fk = ?
        GROUP BY sid, DATE(DATE_SUB(NOW(), INTERVAL ? DAY)), shoes.image, shoes.name`,
        [i, i, uid, i]
      );
    }

    let results: any[] = await queryAsync(sql) as unknown[];
    // ตรวจสอบผลลัพธ์ที่ได้จากการสอบถามฐานข้อมูล
    for (let result of results) {
      // ตรวจสอบว่าออบเจกต์ที่มี key เป็นวันที่หรือยัง
      if (day7[result.sid]) {
        // ถ้ามีอยู่แล้ว เพิ่มค่าเสียงเข้าไปในออบเจกต์ที่มีอยู่แล้ว
        day7[result.sid].voteDate += ',' + formatDate(new Date(result.voteDate));
        day7[result.sid].score += ',' + result.score;
      } else {
        // ถ้ายังไม่มีให้สร้าง key ใหม่และใส่ค่าเสียงเข้าไป
        day7[result.sid] = {
          sid: result.sid,
          name : result.name,
          voteDate: formatDate(new Date(result.voteDate)),
          score: result.score.toString(),
          Image: result.image,
        };
      }
    }
  }

  // แปลง object ให้กลายเป็น array ของค่าเสียง
  let day7Array = Object.values(day7);

  res.json(day7Array);
});