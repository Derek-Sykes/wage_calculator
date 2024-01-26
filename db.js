import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
	.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	})
	.promise();

export async function getUsersJson() {
	const [rows] = await pool.query("SELECT * FROM accounts");
	return rows;
}
export async function getUsers() {
	let users = [];
	const [rows] = await pool.query("SELECT * FROM accounts");
	for (let row of rows) {
		users.push(row.username);
	}
	return users;
}
export async function getUser(username) {
	const [rows] = await pool.query(
		`
    SELECT *
    FROM accounts 
    WHERE username = ?
    `,
		[username]
	);
	return rows[0];
}

export async function createUser(first_name, last_name, username, email, password) {
	if (typeof (await getUser(username)) == "undefined") {
		const [result] = await pool.query(
			`
        INSERT INTO accounts (first_name, last_name, username, email, password)
        VALUES (?, ?, ?, ?, ?)
        `,
			[first_name, last_name, username, email, password]
		);
		const id = result.insertId - 1;
		let value = await getUsersJson();
		let user = value.find((user) => user.username === username);
		return user;
	} else {
		console.log("That Username already Exists");
		return "That Username already Exists";
	}
}

export async function updateUser(id, first_name, last_name, username, email, password) {
	const [rows] = await pool.query(
		`
        UPDATE accounts
        SET first_name = ?, last_name = ?, username = ?, email = ?, password = ?
        WHERE id = ?
        `,
		[first_name, last_name, username, email, password, id]
	);
	return rows;
}
export async function deleteUser(id) {
	const [rows] = await pool.query(
		`
    DELETE FROM accounts 
    WHERE id = ?
    `,
		[id]
	);
	return rows;
}

export async function postJobToDB(job, userId) {
	let { name, frequency, tax, payRate, isHourly, hours, days, id, selected } = job;
	isHourly == true || isHourly == "Hourly" ? (isHourly = 1) : (isHourly = 0);
	const [rows] = await pool.query(`SELECT * FROM jobs`);
	if (rows[rows.length - 1]) {
		let jobId = rows[rows.length - 1].job_id;
		id = jobId + 1;
	}
	hours = !hours ? null : hours;
	days = !days ? null : days;
	await pool.query(
		`
    INSERT INTO jobs (job_id, title, pay_frequency, tax, pay_rate, is_hourly, hours, days, user_id, selected)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
		[id, name, frequency, tax, payRate, isHourly, hours, days, userId, selected]
	);
}

export async function getJobsFromDB(id) {
	let jobs = [];
	try {
		const [rows] = await pool.query(`SELECT * FROM jobs WHERE user_id = ?`, [id]);
		for (let row of rows) {
			row.is_hourly ? (row.is_hourly = true) : (row.is_hourly = false);
			let job = {
				name: row.title,
				frequency: row.pay_frequency,
				tax: row.tax,
				payRate: row.pay_rate,
				isHourly: row.is_hourly,
				hours: row.hours,
				days: row.days,
				id: row.job_id,
				selected: row.selected,
			};
			jobs.unshift(job);
		}
	} catch (e) {
		console.log(`ERROR: ${e}`);
	}
	return jobs;
}

export async function modifyJob(job) {
	let { name, frequency, tax, payRate, isHourly, hours, days, id } = job;
	isHourly == true || isHourly == "Hourly" ? (isHourly = 1) : (isHourly = 0);
	hours = !hours ? null : hours;
	days = !days ? null : days;
	await pool.query(
		`
		UPDATE jobs
		SET title = ?,
			pay_frequency = ?,
			tax = ?, 
			pay_rate = ?,
			is_hourly = ?,
			hours = ?,
			days = ? 
		WHERE job_id = ?;
    `,
		[name, frequency, tax, payRate, isHourly, hours, days, id]
	);
}

export async function deleteJob(id, userId) {
	let user_id;
	try {
		const [rows] = await pool.query(`SELECT * FROM jobs WHERE job_id = ?`, [id]);
		if (rows[0]) {
			user_id = rows[0].user_id;
		}
		if (userId == user_id) {
			await pool.query(
				`
				DELETE FROM jobs
				WHERE job_id = ?;
			`,
				[id]
			);
		}
	} catch (e) {
		console.log("ERROR: ", e);
	}
}

export async function deselectJobs() {
	try {
		await pool.query(`
		UPDATE jobs
		SET selected = 0
		WHERE selected = 1;
		`);
	} catch (e) {
		console.log("ERROR: ", e);
	}
}

export async function selectJob(jobId) {
	try {
		await pool.query(
			`
		UPDATE jobs
		SET selected = 1
		WHERE job_id = ?;
		`,
			[jobId]
		);
	} catch (e) {
		console.log("ERROR: ", e);
	}
}
