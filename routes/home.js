import express from 'express'
const Router = express.Router();
import Tax from '../controllers/tax.js'
import Predict from '../controllers/predict_check.js'
import TimeToBag from '../controllers/time_to_bag.js'
import Hourly from '../controllers/hourly.js'


const redirectLogin = (req, res, next) => {
    if (!req.session.userId){
        res.redirect('/login')
    } else{
        next()
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId){
        res.redirect('/home')
    } else{
        next()
    }
}

// main
Router.get('/', (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('home', {
            page: 'Home', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username
        });
    }catch{
        res.status(201).render('home', {
            page: 'Welcome',
            userId: ''
        });
    }
    

})
//home get
Router.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.status(201).render('home', {
        page: 'Home', 
        userId: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        username: user.username
    });
})

//tax get
Router.get('/tax', (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('tax', {
            page: 'Tax', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: ''
        });
    }catch{
        res.status(201).render('tax', {
            page: 'Welcome',
            userId: '',
            answer: ''
        });
    }
})

Router.post('/tax', (req, res) => {
    const { frequency, timePeriod, check, payRate, isHourly, hours  } = req.body
    console.log(frequency, timePeriod, check, payRate, isHourly, hours)
    let { year, month } = timePeriod.split('-') || null;
    let tax = new Tax(frequency, check, payRate, isHourly, hours)
    console.log(tax);
    
    let answer = tax.calculateTax(month, year)
    console.log(answer)
    answer = (100-(answer*100)).toFixed(1)
    res.status(201).render('tax', { 
        answer: answer
    });
})

Router.get('/predict', (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('predict_check', {
            page: 'Predict Check', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: ''
        });
    }catch{
        res.status(201).render('predict_check', {
            page: 'Predict Check',
            userId: '',
            answer: ''
        });
    }
})

Router.post('/predict', (req, res) => {
    let { frequency, timePeriod, tax, payRate, isHourly, hours, days  } = req.body
    if(tax.includes('%')){
        tax = tax.replace("%", "")
    }
    tax = Math.abs((parseFloat(tax)/100)-1)
    console.log(frequency, tax, payRate, isHourly, hours, days)
    let { year, month } = timePeriod.split('-') || null;
    let predict = new Predict(frequency, tax, payRate, isHourly, hours, days)
    console.log(predict);
    
    let answer = predict.calculatePredict(month, year).toFixed(2)
    console.log(answer)
    // answer = (100-(answer*100)).toFixed(1)
    res.status(201).render('predict_check', { 
        answer: answer
    });
})

Router.get('/bag', (req, res) => {

    try{
        const { user } = res.locals
        res.status(201).render('time_to_bag', {
            page: 'Time to bag', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: '',
            answer1: '',
            hide1: 0,
            hide2: 1
        });
    }catch{
        res.status(201).render('time_to_bag', {
            page: 'Time to bag',
            userId: '',
            answer: '',
            answer1: '',
            hide1: 0,
            hide2: 1
        });
    }
})
let timeToBag;
Router.post('/bag', (req, res) => {
    let { sum, tax, payRate, isHourly, hours, days  } = req.body
    if(tax.includes('%')){
        tax = tax.replace("%", "")
    }
    tax = Math.abs((parseFloat(tax)/100)-1)
    console.log(sum, tax, payRate, isHourly, hours, days)
    //let { year, month } = timePeriod.split('-') || null;
    timeToBag = new TimeToBag(sum, tax, payRate, isHourly, hours, days)
    console.log(timeToBag);
    
    let answer = {}
    answer.time = timeToBag.calculateTimeToBag().toFixed(2)
    answer.sum = sum
    timeToBag.totalHours = answer.time
    
    console.log(answer)
    res.status(201).render('time_to_bag', { 
        answer: answer,
        answer1:"",
        hide1: 1,
        hide2: 0
    });
})

Router.post('/bag-time', (req, res) => {
    let { timePeriod, date } = req.body
    let  year, month;
    if(date){
        [year, month] = date.split('-') || [null, null];
    }
    
    console.log(timeToBag);
    
    let answer1 = {}
    answer1.time = timeToBag.convertToTimePeriod(timePeriod, month, year).toFixed(2)
    answer1.sum = timeToBag.sum
    answer1.timePeriod = timePeriod
    
    console.log(answer1)
    res.status(201).render('time_to_bag', { 
        answer1: answer1,
        answer: "",
        hide1: 1,
        hide2: 0
    });
})


Router.get('/hourly', (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('hourly', {
            page: 'Hourly', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: ''
        });
    }catch{
        res.status(201).render('hourly', {
            page: 'Hourly',
            userId: '',
            answer: ''
        });
    }
})

Router.post('/hourly', (req, res) => {
    let { frequency, timePeriod, tax, check, isHourly, hours, days  } = req.body
    // converts tax from Ex. 20% to .80
    if(tax.includes('%')){
        tax = tax.replace("%", "")
    }
    tax = Math.abs((parseFloat(tax)/100)-1)
    console.log(frequency, timePeriod, tax, check, isHourly, hours, days)
    let { year, month } = timePeriod.split('-') || null;
    let hourly = new Hourly(frequency, tax, check, isHourly, hours, days)
    console.log(hourly);
    
    let answer = {}
    answer.rate = hourly.calculateHourly(month, year).toFixed(2)
    answer.tax = tax ? "before": "after";
    console.log(answer)
    res.status(201).render('hourly', { 
        answer: answer
    });
})

export default Router;