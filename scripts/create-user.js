require("dotenv").config();
const bcrypt=require("bcryptjs"),db=require("../src/config/database");
(async()=>{
 try{
  const name=process.env.NEW_USER_NAME,email=(process.env.NEW_USER_EMAIL||"").toLowerCase().trim();
  const role=(process.env.NEW_USER_ROLE||"").toLowerCase().trim(),password=process.env.NEW_USER_PASSWORD||"";
  const allowed=["admin","teacher","student","parent","staff"];
  if(!name||!email||!allowed.includes(role)||password.length<12)
   throw new Error("Set NEW_USER_NAME, NEW_USER_EMAIL, NEW_USER_ROLE (admin/teacher/student/parent/staff) and NEW_USER_PASSWORD (12+ characters) in .env.");
  const username=email.split("@")[0].replace(/[^a-z0-9._-]/g,"").slice(0,80);
  const [roleRows]=await db.execute("SELECT id FROM roles WHERE name=? LIMIT 1",[role]);
  if(!roleRows.length) throw new Error("Role missing. Import the UTUNYANGE SQL schema.");
  const [existing]=await db.execute("SELECT id FROM users WHERE email=? OR username=? LIMIT 1",[email,username]);
  if(existing.length) throw new Error("An account already uses this email or username.");
  const hash=await bcrypt.hash(password,12);
  await db.execute("INSERT INTO users(role_id,full_name,username,email,password_hash,status,must_change_password) VALUES(?,?,?,?,?,'active',1)",[roleRows[0].id,name,username,email,hash]);
  console.log(`${role} account created: ${email}`);
 }catch(e){console.error(e.message);process.exitCode=1;}finally{await db.end();}
})();
