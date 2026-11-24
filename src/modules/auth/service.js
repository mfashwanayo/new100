const bcrypt=require("bcryptjs");
const db=require("../../config/database");
async function findUser(identifier){
 const [rows]=await db.execute(
  `SELECT u.id,u.full_name,u.email,u.username,u.password_hash,u.status,r.name AS role
   FROM users u JOIN roles r ON r.id=u.role_id
   WHERE LOWER(u.email)=LOWER(?) OR LOWER(u.username)=LOWER(?) LIMIT 1`,
  [identifier,identifier]);
 return rows[0]||null;
}
async function checkPassword(password,hash){return bcrypt.compare(password,hash);}
module.exports={findUser,checkPassword};
