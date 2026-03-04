import express from "express"
import multer from "multer"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import contactRouter from "./routes/contact.js"
import homeRouter from "./routes/home.js"
import aboutRouter from "./routes/about.js"
import userRouter from "./routes/user.js"
import studentRouter from "./routes/student.js"
import adminRouter from "./routes/admin.js"
import instructorRouter from "./routes/instructor.js"
import session from "express-session"



const app = express();

app.set("view engine","ejs");
app.set("views","./views");

// static File middleware
app.use(express.static("static"));
app.use(express.static("./uploads"));


// app.use(express.static("static"));
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



// session Middleware
app.use(session({
    secret: 'ABC',
    resave: false,
    saveUninitialized: true,
}));

// bodyParser middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Mongodb Connection
mongoose.connect("mongodb+srv://landemonu002_db_user:ynNixX6ie3jccXvL@developer.ffhd9al.mongodb.net/e-learning?appName=developer")
.then(()=>{console.log("DB Connected")});

app.use(contactRouter);
app.use(homeRouter);
app.use(aboutRouter);
app.use(userRouter);
app.use(studentRouter);
app.use(adminRouter);
app.use(instructorRouter);


app.listen(1000,()=>{ 
    console.log("Server Started : http://localhost:1000")
});
