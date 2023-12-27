import bodyParser from 'body-parser'
import express from 'express'

import userRoutes from './routes/users.js'
import homeRoutes from './routes/home.js'

const port = 8484;
const app = express();
 
app.use(express.static('public'))
app.use(express.json())
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // Set the view engine to EJS

app.use(userRoutes);
app.use(homeRoutes);


app.listen(port, () => console.log(`server has started running on port: ${port}`));