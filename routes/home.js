import express from 'express'
const Router = express.Router();
import Tax from '../controllers/tax.js'
import Predict from '../controllers/predict_check.js'


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
        const { user } = req.locals
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
Router.get('/tax', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.status(201).render('tax', { 
        userId: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        username: user.username,
        answer: ''
    });
})

Router.post('/tax', redirectLogin, (req, res) => {
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

Router.get('/predict', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.status(201).render('predict_check', { 
        userId: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        username: user.username,
        answer: ''
    });
})

Router.post('/predict', redirectLogin, (req, res) => {
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

Router.get('/bag', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.status(201).render('time_to_bag', { 
        userId: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        username: user.username,
        answer: ''
    });
})

Router.post('/bag', redirectLogin, (req, res) => {
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
    res.status(201).render('time_to_bag', { 
        answer: answer
    });
})
export default Router;