import express from "express"
import dotenv from "dotenv"
import router from "./routes/router.js"
import connectDB from "./db/connect.js"
import session from "express-session"
import passport from "passport"
import MongoStore from "connect-mongo"
import { IntegerType } from "mongodb"
import { fileURLToPath } from "url";
import path from "path";


// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the views directory


// import keysRouter from "./routes/key-bindings.js"
const app = express()
dotenv.config()

//middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../view_templates")); // Adjust the path if your views folder is elsewhere
app.use(express.static(path.join(__dirname, "../public"))) // cache data
// app.use(express.static(path.join(__dirname, "../public"), {maxAge: 1_200_000})) // cache data
// app.use(express.static("./public"))

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}))

app.use(passport.initialize())
app.use(passport.session())

//make sure the session values are avilible in the templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  

app.use("", router)

//for errpr pages
// app.use((req, res) => {
//     res.status(404).send("Error 404")
// })


const PORT: number = Number(process.env.PORT) || 5000

const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI).then(() => console.log("DB connection established"))
        
        // start the server only when we are connected to the db
        app.listen(PORT, () => {
            console.log(`Server is listening on the port ${PORT}...`)
        })
    } catch (error) {
        console.log(error)
    }
}
start()
