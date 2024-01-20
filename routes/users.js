import express from "express";
const Router = express.Router();
import {
	getUser,
	createUser,
	deleteUser,
	updateUser,
	getUsersJson,
	getJobsFromDB,
} from "../db.js";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";

//session stuff
const port = 8484;
const TWO_HOURS = 1000 * 60 * 60 * 2;
const {
	PORT = port,
	NODE_ENV = "development",

	SESS_NAME = "sid",
	SESS_SECRET = "super secret sssshhhh",
	SESS_LIFETIME = TWO_HOURS,
} = process.env;

const IN_PROD = NODE_ENV === "production";

Router.use(
	session({
		name: SESS_NAME,
		resave: false,
		saveUninitialized: false,
		secret: SESS_SECRET,
		cookie: {
			maxAge: SESS_LIFETIME,
			sameSite: true,
			secure: IN_PROD,
		},
	})
);

// middleware and functions

Router.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

const redirectLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect("/login");
	} else {
		next();
	}
};

const redirectHome = (req, res, next) => {
	if (req.session.userId) {
		res.redirect("/home");
	} else {
		next();
	}
};

let users = await getUsersJson();
async function updateDB() {
	users = await getUsersJson();
	console.log("updated", users);
}
function isSecure(password) {
	return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

// TODO make function actually get the job from the db
async function getJobs(id) {
	let jobs = await getJobsFromDB(id);
	return jobs;
}

//Routes

Router.use((req, res, next) => {
	const { userId } = req.session;
	console.log(userId);
	if (userId) {
		res.locals.user = users.find((user) => user.id === userId);
	}
	next();
});

// login get
Router.get("/login", redirectHome, (req, res) => {
	res.status(201).render("login", {
		layout: "./layouts/users",
		page: "Login",
		link: {
			route: "/register",
			name: "Register",
		},
	});
});
// register get
Router.get("/register", redirectHome, (req, res) => {
	res.status(200).render("register", {
		layout: "./layouts/users",
		page: "Register",
		link: {
			route: "/login",
			name: "Login",
		},
	});
});
// login post
Router.post("/login", redirectHome, async (req, res) => {
	const { username, password } = req.body;
	let message;

	if (username && password) {
		const user = users.find((user) => user.username === username);
		let isMatch = false;
		if (user) {
			isMatch = await bcrypt.compare(password, user.password);
		} else {
			message = "User not found";
			return res.redirect(`/login?message=${encodeURIComponent(message)}`);
		}
		// login success
		if (user && isMatch) {
			req.session.userId = user.id;
			req.session.jobs = await getJobs(user.id);
			return res.redirect("/home");
		} else {
			message = "Invalid Username or Password";
			return res.redirect(`/login?message=${encodeURIComponent(message)}`);
		}
	}

	res.redirect("/login");
});

// register post
Router.post("/register", redirectHome, async (req, res) => {
	const { fname, lname, email, username, password } = req.body;
	const hash = await bcrypt.hash(password, 11);
	let message;

	if (fname && lname && email && username && password) {
		const exists = users.some(
			(user) => user.username === username || user.email === email
		);
		// creates account
		if (!exists && isSecure(password)) {
			let user = await createUser(fname, lname, username, email, hash);
			req.session.userId = user.id;
			updateDB();
			return res.redirect("/home");
		} else if (exists) {
			// account exists
			message = "Username or Email already in use.";
			return res.redirect(`/register?message=${encodeURIComponent(message)}`);
		} else {
			// not secure
			message =
				"Password must be at least 8 characters and include atleast 1 uppercase letter and number";
			return res.redirect(`/register?message=${encodeURIComponent(message)}`);
		}
	} else {
		// a field was left empty
		switch (true) {
			case !fname || !lname:
				message = "Please enter your name";
				break;
			case !username:
				message = "Please enter a username.";
				break;
			case !email:
				message = "Please enter an email address.";
				break;
			case !password:
				message = "Please enter a password";
				break;
			default:
				message = "an error occured";
		}
	}
	res.redirect(`/register?message=${encodeURIComponent(message)}`);
});

// logout post
Router.post("/logout", redirectLogin, (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.redirect("/home");
		}

		res.clearCookie(SESS_NAME);
		res.redirect("/");
	});
});

export default Router;
