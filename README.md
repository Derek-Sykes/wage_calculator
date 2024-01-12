<h1>Wage Calculator</h1>

<h3>Description:</h3>

I wanted to make this wage calculator because there have been many times ive gotten a new job and wanted to figure out how much i would make or how much im getting taxed and all these other things i would always have to think of the algrithm to find these things out and many other people i know wanted to know the answer to these questions too and had no idea how to even find the answers.

i used nodejs as a backend and ejs for the veiws to just learn everything i can about backend development in javascript and understand how the server communicates to the webpage through the different kinds of reqests. i chose nodejs over django because i wanted to learn javascript for webdevelopment for front and backend and nodejs is more lower level and invoved than django and will force me to learn all how to organize my project implent login and accounts and learn about web security.
through this project i am bringing to life soemthing i feel passionate about and trying to learn something new with each new feature i implement into the website.

so far you can create an account and login to that account while your logged in you can create a job entry. all of the questions allow you to autofill the information from the job that you have selected.
and if your not logged in you only have access to the basic functionality of the questions you may want to answer you cant create a job or autofill any of the questions.

in the future i would like to add an investment simulation component to the website so that you can invest in live stocks with their live prices with fake money. this will allow me to become much more familiar with working with API's in my program and tying larger amounts of user data with their account and session. i would also like to add a budgeting feature so it takes your job into account and you can create a budgeting plan based on whats left after your needs take and you can create goals on where all your money will go in one place. finally i think the next thing to learn will be about securing the website learning about and implementing all the modern security features websites have today like csrf token and all that.

the biggest challange i faced so far was fully understanding the difference between get reqests and post requests and how to access the information the webpage was sending to the server and how to send things from the server to the webpage, but through much repatition this became clear.

from this project so far ive learned that the webpage sends a http request in the form of a post request(to give the server information to be processed) or get requests(to get a webpage or info from server). on the server you have 2 parameters and request and response object and the request is the information the webpage sends to the server and the response is what the server sends to the webpage. the request has both a body and a header the the header is what generally contains user credentials and other info about the request and the body contains the data the page is actually requesting from the server.



<h3>How to Set it up in your computer:</h3>



1. make sure you have a MYSQL database server
2. create a schema called 'wage_calc' (not including the quotes)
3. use this SQL command to create the table 

    CREATE TABLE `accounts` (
      `id` int NOT NULL AUTO_INCREMENT,
      `first_name` varchar(45) DEFAULT NULL,
      `last_name` varchar(45) DEFAULT NULL,
      `username` varchar(45) NOT NULL,
      `email` varchar(90) DEFAULT NULL,
      `password` varchar(90) NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `username_UNIQUE` (`username`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


4. create a .env file in the root directory of the project within that provide it with the info to your database in such format

    MYSQL_HOST='127.0.0.1'
    MYSQL_USER='yourUsername'
    MYSQL_PASSWORD='yourPassword'
    MYSQL_DATABASE='wage_calc'



