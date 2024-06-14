import bodyParser from "body-parser";
import express from "express";
import expressLayouts from "express-ejs-layouts";

import userRoutes from "./routes/users.js";
import homeRoutes from "./routes/home.js";
import { attachGlobals } from "./middleware/globals.js";

// creating app
const port = 8484;
const app = express();

app.locals.globalVars = {
	counter: 0,
};

// static files
app.use(express.static("public"));

// middleware
app.use(express.json());
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach global variables to req
app.use(attachGlobals);

// template engine setup
app.use(expressLayouts);
app.set("layout", "./layouts/default");
app.set("view engine", "ejs"); // Set the view engine to EJS

// routes
app.use(userRoutes);
app.use(homeRoutes);

// starting server
app.listen(port, () => console.log(`server has started running on port: ${port}`));
