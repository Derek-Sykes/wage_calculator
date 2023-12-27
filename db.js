import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();



export async function getUsersJson(){
    const [rows] = await pool.query("SELECT * FROM accounts");
    return rows;
}
export async function getUsers(){
    let users=[];
    const [rows] = await pool.query("SELECT * FROM accounts");
    for(let row of rows){
        users.push(row.username)
    }
    return users;
}
export async function getUser(username){
    const [rows] = await pool.query(`
    SELECT *
    FROM accounts 
    WHERE username = ?
    `, [username])
    return rows[0];
}

export async function createUser(first_name, last_name, username, email, password){
    
    if(typeof await getUser(username) == "undefined"){
        const [result] = await pool.query(`
        INSERT INTO accounts (first_name, last_name, username, email, password)
        VALUES (?, ?, ?, ?, ?)
        `, [first_name, last_name, username, email, password])
        const id = result.insertId-1
        let value = await getUsersJson()
        let user = value.find(
            user => user.username === username
        )
        return user;
    }else{
        console.log('That Username already Exists')
        return 'That Username already Exists';
    }
}

export async function updateUser(id, first_name, last_name, username, email, password){
        const [rows] = await pool.query(`
        UPDATE accounts
        SET first_name = ?, last_name = ?, username = ?, email = ?, password = ?
        WHERE id = ?
        `, [first_name, last_name, username, email, password, id])
            return rows;
}
export async function deleteUser(id){
    const [rows] = await pool.query(`
    DELETE FROM accounts 
    WHERE id = ?
    `, [id])
    return rows;
}