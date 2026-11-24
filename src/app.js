require("dotenv").config();
const express=require("express"),path=require("path"),helmet=require("helmet"),morgan=require("morgan"),session=require("express-session");
const MySQLStoreFactory=require("express-mysql-session");
const routes=require("./routes/web.routes");
const {attachCsrf}=require("./middleware/csrf.middleware");
if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32) throw new Error("Set SESSION_SECRET in .env (minimum 32 characters).");
const app=express(),root=path.resolve(__dirname,".."),MySQLStore=MySQLStoreFactory(session);
const store=new MySQLStore({
 host:process.env.DB_HOST||"localhost",port:Number(process.env.DB_PORT)||3306,
 user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",
 database:process.env.DB_NAME||"utunyange_school",createDatabaseTable:true
});
app.set("view engine","ejs");app.set("views",path.join(root,"views"));
app.use(helmet({contentSecurityPolicy:{directives:{
 defaultSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'","https://fonts.googleapis.com","https://cdn.jsdelivr.net"],
 fontSrc:["'self'","https://fonts.gstatic.com","https://cdn.jsdelivr.net"],
 scriptSrc:["'self'","'unsafe-inline'","https://cdn.jsdelivr.net"],imgSrc:["'self'","data:","https:"],connectSrc:["'self'"]
}}}));
app.use(morgan("dev"));app.use(express.urlencoded({extended:false,limit:"20kb"}));app.use(express.json({limit:"20kb"}));app.use(express.static(path.join(root,"public")));
app.use(session({name:"utunyange.sid",secret:process.env.SESSION_SECRET,store,resave:false,saveUninitialized:false,cookie:{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:8*60*60*1000}}));
app.use(attachCsrf);app.use((req,res,next)=>{res.locals.currentUser=req.session.user||null;res.locals.appName=process.env.APP_NAME||"UTUNYANGE";next();});
app.use("/",routes);
app.use((req,res)=>res.status(404).render("errors/404",{title:"Page not found",active:""}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).render("errors/500",{title:"Server error",active:""});});
module.exports=app;
