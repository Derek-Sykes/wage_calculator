// WHY IS JOBS ISHOURLY ELEMENT GETTING CHANGED (TRANSLATED WHEN THE JOBS ROUTE IS CALLED)
// make modify and delete update the db

// add select as an attribute to the db so it remembers what was selected but everytime something new is selected
// i have to unselect everything from db then select it if its from the db then i can make the connection

// allow user to modify account info

// update README

import express from "express";
const Router = express.Router();
import Tax from "../controllers/tax.js";
import Predict from "../controllers/predict_check.js";
import TimeToBag from "../controllers/time_to_bag.js";
import Hourly from "../controllers/hourly.js";
import { postJobToDB, getJobsFromDB, modifyJob, deleteJob } from "../db.js";
let jobs = [];
const redirectLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect("/login");
	} else {
		next();
	}
};

function postJob(req, job) {
	let userId = req.session.userId;
	postJobToDB(job, userId);
	console.log(job);
	req.session.jobs.unshift(job);
}

function removeChar(string, char) {
	if (string.includes(char)) {
		return string.replace(char, "");
	}
	return string;
}

let emptyJob = {
	name: "",
	frequency: "",
	tax: "",
	payRate: "",
	isHourly: "",
	hours: "",
	days: "",
	id: "",
	selected: false,
};
// get user and page info
function getUserInfo(user, pageName) {
	if (user) {
		return {
			page: pageName,
			userId: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			username: user.username,
		};
	} else {
		return {
			page: pageName,
			userId: "",
		};
	}
}

function jobSelected(jobs) {
	return jobs.filter((job) => job.selected)[0];
}

function translateIsHourly(isHourly) {
	let hourly;
	console.log("isHourly: ", isHourly);
	if (isHourly === "hourly" || isHourly === "salary") {
		hourly = isHourly == "hourly";
		console.log("inside: ", hourly);
		hourly = hourly ? "Hourly" : "Salary";
		console.log("inside2: ", hourly);
	} else if (isHourly === true || isHourly === false) {
		if (isHourly === true) {
			hourly = "Hourly";
		} else if (isHourly === false) {
			hourly = "Salary";
		}
	} else if (isHourly === "Hourly" || isHourly === "Salary") {
		if (isHourly === "Hourly") {
			hourly = true;
		} else if (isHourly === "Salary") {
			hourly = false;
		}
	}
	console.log("hourly: ", hourly);
	return hourly;
}

function makeIsHourly(jobs) {
	let isHourly = [];
	jobs.forEach((job) => {
		isHourly.unshift(translateIsHourly(job.isHourly));
	});
	return isHourly;
}

// logic for calculator functions
function calcTax(frequency, timePeriod, check, payRate, isHourly, hours) {
	console.log(frequency, timePeriod, check, payRate, isHourly, hours);
	payRate = removeChar(payRate, ",");
	check = removeChar(check, ",");
	let [year, month] = timePeriod.split("-") || null;
	let tax = new Tax(frequency, check, payRate, isHourly, hours);
	console.log(tax);
	let answer = tax.calculateTax(month, year);
	console.log(answer);
	answer = (100 - answer * 100).toFixed(1);
	return answer;
}
function calcPredict(frequency, timePeriod, tax, payRate, isHourly, hours, days) {
	tax = removeChar(tax, "%");
	payRate = removeChar(payRate, ",");
	tax = Math.abs(parseFloat(tax) / 100 - 1);
	console.log(frequency, tax, payRate, isHourly, hours, days);
	let [year, month] = timePeriod.split("-") || null;
	let predict = new Predict(frequency, tax, payRate, isHourly, hours, days);
	console.log(predict);

	let answer = predict.calculatePredict(month, year).toFixed(2);
	console.log(answer);
	return answer;
}
let timeToBag;
function calcBag(sum, tax, payRate, isHourly, hours, days) {
	payRate = removeChar(payRate, ",");
	sum = removeChar(sum, ",");
	tax = removeChar(tax, "%");
	tax = Math.abs(parseFloat(tax) / 100 - 1);
	console.log(sum, tax, payRate, isHourly, hours, days);
	timeToBag = new TimeToBag(sum, tax, payRate, isHourly, hours, days);
	console.log(timeToBag);

	let answer = {};
	answer.time = timeToBag.calculateTimeToBag().toFixed(2);
	answer.sum = sum;
	timeToBag.totalHours = answer.time;

	console.log(answer);
	return answer;
}
function calcTimeToBag(timePeriod, month) {
	let year, month1;
	let answer1 = {};
	if (month) {
		[year, month1] = month.split("-") || [null, null];
		answer1.time = timeToBag.convertToTimePeriod(timePeriod, month1, year).toFixed(2);
	} else {
		console.log(timePeriod);
		answer1.time = timeToBag.convertToTimePeriod(timePeriod).toFixed(2);
	}
	console.log("year: ", year, month1);
	console.log(timeToBag);

	answer1.sum = timeToBag.sum;
	answer1.timePeriod = timePeriod;

	console.log(answer1);
	return answer1;
}
function calcHourly(frequency, timePeriod, tax, check, isHourly, hours, days) {
	// converts tax from Ex. 20% to .80
	tax = removeChar(tax, "%");
	check = removeChar(check, ",");
	tax = Math.abs(parseFloat(tax) / 100 - 1);
	console.log(frequency, timePeriod, tax, check, isHourly, hours, days);
	let [year, month] = timePeriod.split("-") || null;
	let hourly = new Hourly(frequency, tax, check, isHourly, hours, days);
	console.log(hourly);

	let answer = {};
	answer.rate = hourly.calculateHourly(month, year).toFixed(2);
	answer.tax = tax ? "before" : "after";
	console.log(answer);
	return answer;
}

// Routes start

// main
Router.get("/", (req, res) => {
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs);
		res.status(201).render("home", getUserInfo(user, "Home"));
	} catch {
		res.status(201).render("home", { ...getUserInfo("", "Welcome") });
	}
});
//home get
Router.get("/home", redirectLogin, (req, res) => {
	const { user } = res.locals;
	res.status(201).render("home", {
		...getUserInfo(user, "Home"),
		jobs: req.session.jobs,
	});
});

//tax get
Router.get("/tax", (req, res) => {
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs);
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("tax", {
			...getUserInfo(user, "Tax"),
			answer: "",
			job: job,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("tax", {
			...getUserInfo("", "Tax"),
			answer: "",
			job: emptyJob,
			isHourly: null,
		});
	}
});

Router.post("/tax", (req, res) => {
	const { frequency, timePeriod, check, payRate, isHourly, hours } = req.body;
	let answer = calcTax(frequency, timePeriod, check, payRate, isHourly, hours);
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs);
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("tax", {
			...getUserInfo(user, "Tax"),
			answer: answer,
			job: job,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("tax", {
			...getUserInfo("", "Tax"),
			answer: answer,
			job: emptyJob,
			isHourly: null,
		});
	}
});

Router.get("/predict", (req, res) => {
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs);
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("predict_check", {
			...getUserInfo(user, "Predict Check"),
			job: job,
			answer: "",
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("predict_check", {
			...getUserInfo("", "Predict Check"),
			job: emptyJob,
			answer: "",
			isHourly: null,
		});
	}
});

Router.post("/predict", (req, res) => {
	let { frequency, timePeriod, tax, payRate, isHourly, hours, days } = req.body;
	let answer = calcPredict(frequency, timePeriod, tax, payRate, isHourly, hours, days);

	// answer = (100-(answer*100)).toFixed(1)
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs);
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("predict_check", {
			...getUserInfo(user, "Predict Check"),
			answer: answer,
			job: job,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("predict_check", {
			...getUserInfo("", "Predict Check"),
			answer: answer,
			job: "",
			isHourly: null,
		});
	}
});

Router.get("/bag", (req, res) => {
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs) || emptyJob;
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("time_to_bag", {
			...getUserInfo(user, "Time to Bag"),
			answer: "",
			answer1: "",
			job: job,
			hide1: 0,
			hide2: 1,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("time_to_bag", {
			...getUserInfo("", "Time to Bag"),
			answer: "",
			answer1: "",
			job: emptyJob,
			hide1: 0,
			hide2: 1,
			isHourly: null,
		});
	}
});

Router.post("/bag", (req, res) => {
	let { sum, tax, payRate, isHourly, hours, days } = req.body;
	let answer = calcBag(sum, tax, payRate, isHourly, hours, days);

	try {
		const { user } = res.locals;

		res.status(201).render("time_to_bag", {
			...getUserInfo(user, "Time to Bag"),
			answer: answer,
			answer1: "",
			job: emptyJob,
			hide1: 1,
			hide2: 0,
			isHourly: null,
		});
	} catch {
		res.status(201).render("time_to_bag", {
			...getUserInfo("", "Time to Bag"),
			answer: answer,
			answer1: "",
			job: emptyJob,
			hide1: 1,
			hide2: 0,
			isHourly: null,
		});
	}
});

Router.post("/bag-time", (req, res) => {
	let { timePeriod, month } = req.body;
	let answer1 = calcTimeToBag(timePeriod, month);

	try {
		const { user } = res.locals;

		res.status(201).render("time_to_bag", {
			...getUserInfo(user, "Time to Bag"),
			answer1: answer1,
			answer: "",
			job: emptyJob,
			hide1: 1,
			hide2: 0,
			isHourly: null,
		});
	} catch {
		res.status(201).render("time_to_bag", {
			...getUserInfo("", "Time to Bag"),
			answer1: answer1,
			job: emptyJob,
			answer: "",
			hide1: 1,
			hide2: 0,
			isHourly: null,
		});
	}
});

Router.get("/hourly", (req, res) => {
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs) || emptyJob;
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("hourly", {
			...getUserInfo(user, "Hourly"),
			job: job,
			answer: "",
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("hourly", {
			...getUserInfo("", "Hourly"),
			job: emptyJob,
			answer: "",
			isHourly: null,
		});
	}
});

Router.post("/hourly", (req, res) => {
	let { frequency, timePeriod, tax, check, isHourly, hours, days } = req.body;
	let answer = calcHourly(frequency, timePeriod, tax, check, isHourly, hours, days);
	try {
		const { user } = res.locals;
		let job = jobSelected(req.session.jobs) || emptyJob;
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("hourly", {
			...getUserInfo(user, "Hourly"),
			answer: answer,
			job: job,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("hourly", {
			...getUserInfo("", "Hourly"),
			answer: answer,
			job: emptyJob,
			isHourly: null,
		});
	}
});

Router.get("/enter-job", redirectLogin, (req, res) => {
	try {
		const { user } = res.locals;
		res.status(201).render("enter-job", {
			...getUserInfo(user, "Enter Job"),
		});
	} catch {
		res.status(201).render("error");
	}
});

Router.post("/enter-job", redirectLogin, (req, res) => {
	const { user } = res.locals;
	let { frequency, tax, payRate, isHourly, hours, days, save, name } = req.body;
	isHourly = isHourly === "hourly" ? "Hourly" : "Salary";
	isHourly = translateIsHourly(isHourly);
	let id;
	try {
		id = req.session.jobs[0].id + 1;
	} catch (error) {
		id = 1;
	}
	let job = {
		name: name,
		frequency: frequency,
		tax: tax,
		payRate: payRate,
		isHourly: isHourly,
		hours: hours,
		days: days,
		id: id,
		selected: false,
	};
	// // make any job that was selected before no longer selected
	// for(job of req.session.jobs){
	//     if(job.selected) {
	//         job.selected = false
	//     }
	// }

	// if they said save the job the it goes to db other wise it just goes to session list
	if (save) {
		postJob(req, job);
	} else {
		req.session.jobs.unshift(job);
	}

	res.status(201).redirect("home");
});

Router.get("/jobs", redirectLogin, (req, res) => {
	try {
		const { user } = res.locals;
		let jobs = req.session.jobs;
		res.status(201).render("jobs", {
			...getUserInfo(user, "Jobs"),
			jobs: jobs,
			isHourly: makeIsHourly(jobs),
		});
	} catch {
		res.status(201).render("error");
	}
});
// handles selected
Router.post("/jobs", redirectLogin, (req, res) => {
	const { user } = res.locals;
	let jobs = req.session.jobs;
	let jobId = req.body.jobId;
	// if when you select another job any job is selected it makes it false and makes the job you selected at that id true
	for (let job of jobs) {
		// set all jobs selected attribute to false
		if (job.selected) {
			job.selected = false;
		}
		// set the job that has the right id to true
		if (job.id == jobId) {
			job.selected = true;
		}
	}

	res.status(201).redirect("jobs");
});

Router.get("/delete", redirectLogin, async (req, res) => {
	try {
		const { user } = res.locals;
		const jobId = req.query.jobId;
		let userId = user.id;
		let jobs = req.session.jobs;
		req.session.jobs = jobs.filter((job) => job.id != jobId);
		await deleteJob(jobId, userId);
		res.status(201).redirect("jobs");
	} catch {
		res.status(201).render("error");
	}
});

Router.get("/modify", redirectLogin, (req, res) => {
	try {
		const { user } = res.locals;
		const jobId = req.query.jobId;
		let jobs = req.session.jobs;
		let job = jobs.filter((job) => job.id == jobId)[0];
		let isHourly = translateIsHourly(job.isHourly);
		res.status(201).render("modify-job", {
			...getUserInfo(user, "Modify Job"),
			job: job,
			isHourly: isHourly,
		});
	} catch {
		res.status(201).render("error");
	}
});

Router.post("/modify", redirectLogin, async (req, res) => {
	const { user } = res.locals;
	let jobs = req.session.jobs;
	let { jobId, frequency, tax, payRate, isHourly, hours, days, name } = req.body;
	isHourly = isHourly === "hourly" ? "Hourly" : "Salary";
	isHourly = translateIsHourly(isHourly);
	console.log(jobId, frequency, tax, payRate, isHourly, hours, days);
	let job = jobs.filter((job) => job.id == jobId)[0];
	let newJob = {
		name: name,
		frequency: frequency,
		tax: tax,
		payRate: payRate,
		isHourly: isHourly,
		hours: hours,
		days: days,
		id: job.id,
		selected: job.selected,
	};
	console.log(newJob);
	await jobs.forEach(async (job) => {
		if (job.id == jobId) {
			Object.assign(job, newJob);
			await modifyJob(job);
		}
	});

	res.status(201).redirect("jobs");
});

export default Router;
