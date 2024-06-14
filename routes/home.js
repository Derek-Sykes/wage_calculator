// allow user to modify account info
// eventually make the amout of money have depend on your job income and take some percent of what they make a month and put it into their investment acct
// embed the stock name everywhere

// update README

import express from "express";
const Router = express.Router();
import Tax from "../controllers/tax.js";
import Predict from "../controllers/predict_check.js";
import TimeToBag from "../controllers/time_to_bag.js";
import Hourly from "../controllers/hourly.js";
//import liveStockPrice from "live-stock-price";
import axios from "axios";
import fs from "fs";
//import Stocks from "stocks.js";
import finnhub from "finnhub";

// let keys = {
// 	0: "TWP3X8MK0OC5JIYG",
// 	1: "YA4NT0N2N2043IGS",
// 	2: "XJ81CRSU4M2QXKBY",
// 	3: "HRWC8UJGHFKW9B7Q",
// 	4: "YP5JBPUAH4IKY5LF",
// };

// let keys2 = {
// 	0: "GWIM1C8FEAB8M4FI",
// 	1: "RRWF1S5L4S3TELQZ",
// 	2: "R7WQX3SC0OJZ4E7H",
// 	3: "84BEHYTHJ838VYDX",
// 	4: "L639XNAB3NBA8ZSY",
// };

let finkeys = {
	0: "cp985g1r01qo7b19p6ggcp985g1r01qo7b19p6h0",
	1: "cp9c62hr01qo7b1a1nggcp9c62hr01qo7b1a1nh0",
	2: "cp9c701r01qo7b1a1pigcp9c701r01qo7b1a1pj0",
	3: "cp9c7k1r01qo7b1a1qt0cp9c7k1r01qo7b1a1qtg",
	4: "cp9cfd1r01qo7b1a2b60cp9cfd1r01qo7b1a2b6g",
	5: "cp9cfupr01qo7b1a2cagcp9cfupr01qo7b1a2cb0",
	6: "cp9ci9pr01qo7b1a2gngcp9ci9pr01qo7b1a2go0",
};

let counter = 0;

import {
	postJobToDB,
	getJobsFromDB,
	modifyJob,
	deleteJob,
	deselectJobs,
	selectJob,
	modifyStock,
	addStockToDB,
	modifyCash,
	deleteFromDb,
} from "../db.js";
const stocksJSON = JSON.parse(fs.readFileSync("public/stocks.json", "utf-8"));
let jobs = [];
const redirectLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect("/login");
	} else {
		next();
	}
};
function convertToTitleCase(str) {
	str = str.toLowerCase();
	return str.replace(/\b\w/g, function (match) {
		return match.toUpperCase();
	});
}

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
	if (isHourly === "hourly" || isHourly === "salary") {
		hourly = isHourly == "hourly";
		hourly = hourly ? "Hourly" : "Salary";
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
	return hourly;
}

function makeIsHourly(jobs) {
	let isHourly = [];
	jobs.forEach((job) => {
		isHourly.unshift(translateIsHourly(job.isHourly));
	});
	return isHourly;
}

// Stock API functions
// -
// -
// -
// -
// -
// -
// -

function getfinkey() {
	let key = counter % Object.keys(finkeys).length;
	//console.log("key: ", finkeys[key], "counter: ", key, "length: ", Object.keys(finkeys).length);
	counter++;
	return finkeys[key];
}

async function getStockPrice(ticker) {
	// Set up the API key
	const api_key = finnhub.ApiClient.instance.authentications["api_key"];
	api_key.apiKey = getfinkey(); // Replace this with your actual API key
	const finnhubClient = new finnhub.DefaultApi();

	try {
		// Promisify the quote method
		const getQuote = (ticker) => {
			return new Promise((resolve, reject) => {
				finnhubClient.quote(ticker, (error, data, response) => {
					if (error) {
						reject(error);
					} else {
						resolve(data);
					}
				});
			});
		};

		// Await the result of the API call
		const data = await getQuote(ticker);
		console.log("Done");
		return data.c; // Current price
	} catch (error) {
		console.error("Error fetching stock price:", error);
	}
}

async function getStockName(ticker) {
	try {
		// Convert ticker to uppercase
		ticker = ticker.toUpperCase();

		// Get the API key
		const api_key = finnhub.ApiClient.instance.authentications["api_key"];
		api_key.apiKey = getfinkey(); // Assuming getfinkey() is defined elsewhere and returns a valid API key

		// Create the Finnhub client
		const finnhubClient = new finnhub.DefaultApi();

		// Wrap the symbolSearch in a promise to use with async/await
		const symbolSearch = (ticker) => {
			return new Promise((resolve, reject) => {
				finnhubClient.symbolSearch(ticker, (error, data, response) => {
					if (error) {
						reject(error);
					} else {
						resolve(data);
					}
				});
			});
		};

		// Await the result of the symbol search
		const data = await symbolSearch(ticker);

		// Check if results are found
		if (data && data.result && data.result.length > 0) {
			// Return the description of the first result
			return data.result[0].description;
		} else {
			throw new Error("No results found");
		}
	} catch (error) {
		// Log the error and rethrow or handle it as needed
		console.error("Error fetching stock name:", error);
		throw error;
	}
}

// get ticker from file which has large list of stocks
function getStockTicker(name) {
	name = convertToTitleCase(name);
	let stocks = stocksJSON.filter((stock) => {
		let s = stock.Name;
		return s.indexOf(name) !== -1;
	});
	if (stocks[0].Symbol) {
		return stocks;
	} else {
		return "invalid";
	}
}
// alpha vantage
// async function getStockPrice(ticker) {
// 	console.log("Counter0: ", counter);
// 	counter++;
// 	counter = counter % 5;
// 	console.log("Counter1: ", counter);
// 	let key = keys2[counter];
// 	console.log("Key: ", key);
// 	let price = NaN;
// 	try {
// 		let liveStocks = new Stocks(key); // replace XXXX with your API Key
// 		let result = await liveStocks.timeSeries({
// 			symbol: ticker,
// 			interval: "1min",
// 			amount: 1,
// 		});
// 		console.log(result);
// 		price = result[0].open;
// 	} catch (err) {
// 		console.log(err);
// 		//getStockPrice(ticker);
// 	}
// 	return price;
// }

//idk
// async function getStockPrice(stock) {
// 	let price1 = "error";
// 	await liveStockPrice(stock)
// 		.then((price) => {
// 			console.log("Stock price:", price);
// 			price = Number(Number(price).toFixed(2));
// 			price1 = price;
// 		})
// 		.catch((error) => {
// 			console.error("Invalid tiker symbol");
// 			price1 = "invalid";
// 		});
// 	console.log(typeof price1);
// 	return price1;
// }
async function translateTiker(type, value) {
	try {
		let response;

		if (type === "tkr") {
			let ticker = value.toUpperCase();
			let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${ticker}&apikey=W0ETJ7YQC060L3EH`;
			response = await axios.get(url);
			console.log("response: ", response);
		} else if (type === "name") {
			let company = value;
			let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${company}&apikey=W0ETJ7YQC060L3EH`;
			response = await axios.get(url);
		} else {
			throw new Error("Invalid type");
		}

		if (response.status !== 200) {
			throw new Error(`Status ${response.status}`);
		}

		const data = response.data;
		if (type === "tkr") {
			let company = data.bestMatches[0]["2. name"];
			console.log(company);
			return company;
		} else {
			let ticker = data.bestMatches[0]["1. symbol"];
			console.log(ticker);
			return ticker;
		}
	} catch (error) {
		console.error("Error:", error.message);
		throw error;
	}
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
// -
// -
// -
// -
// -
// -
// -
// -
// -
// -
// main
Router.get("/", async (req, res) => {
	// let price = await getStockPrice("AAPL");
	// console.log("Globals: ", req.globalVars.counter, "Price: ", price);

	try {
		console.log(await getStockName("plnh"));
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
	console.log("global var: ", req.globalVars.counter);
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

Router.post("/enter-job", redirectLogin, async (req, res) => {
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
		selected: true,
	};
	await deselectJobs();
	for (let job of req.session.jobs) {
		// set all jobs selected attribute to false
		if (job.selected) {
			job.selected = false;
		}
	}

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
Router.post("/jobs", redirectLogin, async (req, res) => {
	const { user } = res.locals;
	let jobs = req.session.jobs;
	let jobId = req.body.jobId;
	await deselectJobs();
	await selectJob(jobId);
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

Router.get("/unemployed", redirectLogin, async (req, res) => {
	try {
		console.log("should deselect");
		await deselectJobs();
		for (let job of req.session.jobs) {
			// set all jobs selected attribute to false
			if (job.selected) {
				job.selected = false;
			}
		}
		res.status(201).redirect("jobs");
	} catch {
		res.status(201).render("error");
	}
});

Router.get("/stocks", redirectLogin, (req, res) => {
	try {
		const { user } = res.locals;
		res.status(201).render("stocks", {
			...getUserInfo(user, "stocks"),
			price: "nothing",
			stock: "nothing",
			otherOptions: [],
		});
	} catch {
		res.status(201).render("error", { ...getUserInfo("", "stocks") });
	}
});

Router.post("/stocks", redirectLogin, async (req, res) => {
	try {
		const { user } = res.locals;
		let { stock, type } = req.body;
		let otherOptions = [];
		// searching by company name
		if (type === "name") {
			let stocks = getStockTicker(stock);
			stock = stocks[0].Symbol;

			for (let s of stocks) {
				otherOptions.push({ name: s.Name, ticker: s.Symbol });
			}
			// searching by ticker symbol
		} else if (type === "ticker") {
			stock = stock.toUpperCase();
		}
		let name = convertToTitleCase(await getStockName(stock));
		let price = await getStockPrice(stock);
		console.log(price);
		res.status(201).render("stocks", {
			...getUserInfo(user, "stocks"),
			stock: stock,
			page: "stocks",
			price: price,
			otherOptions: otherOptions,
			name: name,
		});
	} catch (e) {
		console.log(e);
	}
});

Router.get("/buy-stocks", redirectLogin, async (req, res) => {
	try {
		const { user } = res.locals;
		let stock = req.query.ticker;
		let price = await getStockPrice(stock);
		if (price == "invalid" || price == "error") {
			return res.redirect("/stocks");
		}
		price = Number(price);
		res.status(201).render("buy-stocks", {
			...getUserInfo(user, "buy-stocks"),
			price: price,
			stock: stock,
		});
	} catch {
		res.status(201).render("error", { ...getUserInfo("", "buy-stocks") });
	}
});

Router.post("/buy-stocks", redirectLogin, async (req, res) => {
	let message;
	try {
		const { user } = res.locals;
		let { shares, stock } = req.body;
		let portfolio = req.session.invest.portfolio;
		shares = parseInt(shares);
		console.log("info: ", shares, stock);
		let price = await getStockPrice(stock);
		let cost = shares * price;
		let s_id;
		if (req.session.invest.cash - cost >= 0) {
			req.session.invest.cash -= cost;
			await modifyCash(-cost, user.username);
			let name = await getStockName(stock);
			let dbstock = {
				ticker: stock,
				name: name,
				quantity: shares,
				purchase_price: price,
				user_id: user.id,
			};
			let exist = portfolio.filter((stock) => stock.ticker === dbstock.ticker)[0];
			if (exist) {
				portfolio.forEach((stock) => {
					if (exist.ticker === stock.ticker) {
						let newPurchasePrice =
							(stock.price * stock.shares + dbstock.purchase_price * dbstock.quantity) /
							(stock.shares + dbstock.quantity);
						let newShares = stock.shares + dbstock.quantity;
						s_id = stock.s_id;
						let modifiedStock = {
							s_id: stock.s_id,
							ticker: stock.ticker,
							quantity: newShares,
							purchase_price: newPurchasePrice,
							user_id: user.id,
						};
						modifyStock(modifiedStock);
					}
				});
			} else {
				s_id = await addStockToDB(dbstock);
			}

			let newstock = {
				s_id: s_id,
				ticker: stock,
				shares: shares,
				price: price,
				cost: cost,
				currentPrice: price,
				currentValue: cost,
			};
			console.log(newstock);
			let exists = portfolio.filter((stock) => stock.ticker === newstock.ticker)[0];
			if (exists) {
				portfolio.forEach((stock) => {
					if (exists.ticker === stock.ticker) {
						let newPurchasePrice =
							(stock.price * stock.shares + newstock.price * newstock.shares) /
							(stock.shares + newstock.shares);
						let newShares = stock.shares + newstock.shares;
						let newValue = stock.price * stock.shares + newstock.price * newstock.shares;
						stock.shares = newShares;
						stock.price = newPurchasePrice;
						stock.cost = newValue;
					}
				});
				message = "purchase success";
			} else {
				portfolio.unshift(newstock);
				message = "purchase success";
			}
		} else {
			message = "Insuffcient funds";
		}

		res.status(201).redirect(`/portfolio?message=${message}`);
	} catch (e) {
		console.log(e);
	}
});

Router.get("/sell", redirectLogin, async (req, res) => {
	try {
		const { user } = res.locals;
		let ticker = req.query.ticker;
		let price = await getStockPrice(ticker);
		let cash = req.session.invest.cash;
		res.status(201).render("sell", {
			...getUserInfo(user, "sell"),
			ticker: ticker,
			price: price,
			cash: cash,
		});
	} catch (e) {
		console.log(e);
		res.status(201).render("error", { ...getUserInfo("", "portfolio") });
	}
});

Router.post("/sell", redirectLogin, async (req, res) => {
	try {
		const { user } = res.locals;
		let message;
		let { ticker, shares } = req.body;
		let portfolio = req.session.invest.portfolio;
		let cash = req.session.invest.cash;
		let currentPrice = await getStockPrice(ticker);
		for (let stock of portfolio) {
			if (stock.ticker === ticker) {
				let newShares = stock.shares - shares;
				if (newShares >= 0) {
					modifyStock({
						s_id: stock.s_id,
						ticker: stock.ticker,
						quantity: newShares,
						purchase_price: stock.price,
						user_id: user.id,
					});
					let gain = currentPrice * shares;
					stock.cost -= (stock.cost / stock.shares) * shares;
					stock.shares -= shares;
					cash = Number(cash);
					gain = Number(gain);
					req.session.invest.cash = (cash + gain).toFixed(2);
					await modifyCash(gain, user.username);
				} else {
					message = "you dont own that many shares";
				}
				if (newShares === 0) {
					deleteFromDb(stock.s_id);
				}
				if (stock.shares <= 0) {
					const index = portfolio.indexOf(stock);
					if (index !== -1) {
						portfolio.splice(index, 1);
					}
				}
			}
		}
		res.status(201).redirect("portfolio");
	} catch (e) {
		console.log(e);
		res.status(201).render("error", { ...getUserInfo("", "portfolio") });
	}
});

Router.get("/portfolio", redirectLogin, async (req, res) => {
	try {
		let value = 0;
		const { user } = res.locals;
		let message = req.query.message || "";
		console.log("cash: ", req.session.invest.cash);
		let portfolio = req.session.invest.portfolio || [];
		let cash = parseFloat(req.session.invest.cash);
		// displaying the stocks from the session on the portfolio page
		for (let stock of portfolio) {
			console.log(stock.ticker);
			let currentPrice = await getStockPrice(stock.ticker);
			stock.cost = stock.cost;
			stock.currentValue = Number((currentPrice * stock.shares).toFixed(2));
			console.log("current value: ", stock.currentValue);
			stock.currentPrice = currentPrice;
			value += stock.currentValue;
		}
		console.log("after");
		res.status(201).render("portfolio", {
			...getUserInfo(user, "Portfolio"),
			portfolio: portfolio,
			cash: cash,
			message: message,
			value: value,
		});
	} catch (e) {
		console.log(e);
		res.status(201).render("error", { ...getUserInfo("", "portfolio") });
	}
});

export default Router;
