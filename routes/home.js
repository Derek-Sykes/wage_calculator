import express from 'express'
const Router = express.Router();
import Tax from '../controllers/tax.js'


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

export default Router;