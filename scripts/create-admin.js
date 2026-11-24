require("dotenv").config();
const bcrypt=require("bcryptjs"),db=require("../src/config/database");
(async()=>{
 try{
  const {ADMIN_NAME:name,ADMIN_EMAIL}=process.env,password=process.env.ADMIN_PASSWORD||"",email=(ADMIN_EMAIL||"").toLowerCase().trim();
  if(!name||!email||password.length<12) throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) in .env.");
  const [roles]=await db.execute("SELECT id FROM roles WHERE name='super_admin' LIMIT 1");
  if(!roles.length) throw new Error("Import database/schema/utunyange.sql first.");
  const username=email.split("@")[0].replace(/[^a-z0-9._-]/g,"").slice(0,80);
  const [found]=await db.execute("SELECT id FROM users WHERE email=? OR username=? LIMIT 1",[email,username]);
  if(found.length){console.log("Account already exists; no changes made.");return;}
  const hash=await bcrypt.hash(password,12);
  await db.execute("INSERT INTO users(role_id,full_name,username,email,password_hash,status,must_change_password) VALUES(?,?,?,?,?,'active',1)",[roles[0].id,name,username,email,hash]);
  console.log("Super administrator created:",email,". Change the initial password after first login.");
 }catch(e){console.error(e.message);process.exitCode=1;}finally{await db.end();}
})();
