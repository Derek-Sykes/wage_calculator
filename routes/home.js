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


function postJob(job){
    // TODO make function actually post the job to the db
    console.log(job);
    req.session.jobs.push(job)
}

let emptyJob = {
    name: '',
    frequency: '',
    tax: '', 
    payRate: '', 
    isHourly: '',
    hours: '', 
    days: '',
    id: '',
    selected: false
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
        username: user.username,
        jobs: req.session.jobs
    });
    
})

//tax get
Router.get('/tax', (req, res) => {
    try{
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0]
        res.status(201).render('tax', {
            page: 'Tax', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: '',
            job: job

        });
    }catch{
        res.status(201).render('tax', {
            page: 'Tax',
            userId: '',
            answer: '',
            job: emptyJob
        });
    }
})

Router.post('/tax', (req, res) => {
    const { frequency, timePeriod, check, payRate, isHourly, hours  } = req.body
    console.log(frequency, timePeriod, check, payRate, isHourly, hours)
    let [ year, month ] = timePeriod.split('-') || null;
    let tax = new Tax(frequency, check, payRate, isHourly, hours)
    console.log(tax);
    
    let answer = tax.calculateTax(month, year)
    console.log(answer)
    answer = (100-(answer*100)).toFixed(1)
    
    try {
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0]

        res.status(201).render('tax', { 
            page: "tax",
            answer: answer,
            userId: user.id,
            job: job
        });
    } catch {
        res.status(201).render('tax', { 
            page: "tax",
            answer: answer,
            userId: '',
            job: emptyJob
        });
    }
})

Router.get('/predict', (req, res) => {
    try{
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0] || ''
        res.status(201).render('predict_check', {
            page: 'Predict Check', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            job: job,
            answer: ''
        });
    }catch{
        res.status(201).render('predict_check', {
            page: 'Predict Check',
            userId: '',
            job: '',
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
    let [ year, month ] = timePeriod.split('-') || null
    let predict = new Predict(frequency, tax, payRate, isHourly, hours, days)
    console.log(predict);
    
    let answer = predict.calculatePredict(month, year).toFixed(2)
    console.log(answer)
    
    // answer = (100-(answer*100)).toFixed(1)
    try {
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0] || ''
        res.status(201).render('predict_check', { 
            page: "Predict Check",
            answer: answer,
            job: job,
            userId: user.id
        });
    } catch {
        res.status(201).render('predict_check', { 
            page: "Predict Check",
            answer: answer,
            job: '',
            userId: ''
        });
    }
    
})

Router.get('/bag', (req, res) => {

    try{
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0]
        res.status(201).render('time_to_bag', {
            page: 'Time to bag', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: '',
            answer1: '',
            job: job,
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

    try{
        const { user } = res.locals
        
        res.status(201).render('time_to_bag', { 
            page: 'Time to bag',
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer: answer,
            answer1:'',
            hide1: 1,
            hide2: 0
    });
    }catch{
        res.status(201).render('time_to_bag', {
            page: 'Time to bag',
            userId: '',
            answer: answer,
            answer1: '',
            hide1: 1,
            hide2: 0
        });
    }


    
})

Router.post('/bag-time', (req, res) => {
    let { timePeriod, month } = req.body
    console.log(timePeriod, month)
    let  year, month1;
    if(month){
        [year, month1] = month.split('-') || [null, null];
    }else{
        year = 0
        month = 0
    }
    console.log(year, month1)
    console.log(timeToBag);
    
    let answer1 = {}
    answer1.time = timeToBag.convertToTimePeriod(timePeriod, month1, year).toFixed(2)
    answer1.sum = timeToBag.sum
    answer1.timePeriod = timePeriod
    
    console.log(answer1)


    try{
        const { user } = res.locals
    
        res.status(201).render('time_to_bag', { 
            page: 'Time to bag',
            userId: user.id,
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            answer1: answer1,
            answer: "",
            hide1: 1,
            hide2: 0
        });
    }catch{
        res.status(201).render('time_to_bag', {
            page: 'Time to bag',
            userId: '',
            answer1: answer1,
            answer: "",
            hide1: 1,
            hide2: 0
        });
    }



    
})


Router.get('/hourly', (req, res) => {
    try{
        const { user } = res.locals
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.selected))[0]
        res.status(201).render('hourly', {
            page: 'Hourly', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            job: job,
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
    let [ year, month ] = timePeriod.split('-') || null;
    let hourly = new Hourly(frequency, tax, check, isHourly, hours, days)
    console.log(hourly);
    
    let answer = {}
    answer.rate = hourly.calculateHourly(month, year).toFixed(2)
    answer.tax = tax ? "before": "after";
    console.log(answer)
    try {
        const { user } = res.locals
        res.status(201).render('hourly', { 
            page: "hourly",
            answer: answer,
            userId: user.id
        });
    } catch {
        res.status(201).render('hourly', { 
            page: "hourly",
            answer: answer,
            userId: ''
        });
    }
})

Router.get('/enter-job', redirectLogin, (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('enter-job', {
            page: 'Enter Job', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username
        });
        console.log(req.session.jobs)
    }catch{
        res.status(201).render('error');
    }
})

Router.post('/enter-job', redirectLogin, (req, res) => {
    const { user } = res.locals
    let { frequency, tax, payRate, isHourly, hours, days, save, name  } = req.body
    isHourly = isHourly == 'hourly'
    isHourly = isHourly ? 'Hourly' : 'Salary'
    console.log(frequency, tax, payRate, isHourly, hours, days, save)
    let id
    try {
        id =  req.session.jobs[0].id + 1
    } catch (error) {
        id = 1
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
        selected: false
    }
    // // make any job that was selected before no longer selected
    // for(job of req.session.jobs){
    //     if(job.selected) {
    //         job.selected = false
    //     }
    // }
    // if they said save the job the it goes to db other wise it just goes to session list
    if(save) {
        postJob(job)
    }else{
        req.session.jobs.unshift(job)
        console.log(req.session.jobs)
    }
    
    
    res.status(201).redirect('home');
})

Router.get('/jobs', redirectLogin, (req, res) => {
    try{
        const { user } = res.locals
        res.status(201).render('jobs', {
            page: 'Jobs', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            jobs: req.session.jobs
        });
    }catch{
        res.status(201).render('error');
    }
})

Router.post('/jobs', redirectLogin, (req, res) => {
    const { user } = res.locals;
    let jobs = req.session.jobs;
    let jobId = req.body.jobId
    console.log(jobId)
    // if when you select another job any job is selected it makes it false and makes the job you selected at that id true
    for(let job of jobs){
        if(job.selected){
            job.selected = false
        }
        if(job.id == jobId){
            job.selected = true
        }
    }
    console.log(req.session.jobs)

    
    
    res.status(201).redirect('jobs');
})


Router.get('/delete', redirectLogin, (req, res) => {
    try{
        const { user } = res.locals
        const jobId = req.query.jobId
        let jobs = req.session.jobs
        req.session.jobs = jobs.filter(job => job.id != jobId)
        res.status(201).redirect('jobs');
    }catch{
        res.status(201).render('error');
    }
})

Router.get('/modify', redirectLogin, (req, res) => {
    try{
        const { user } = res.locals
        const jobId = req.query.jobId
        let jobs = req.session.jobs
        let job = (jobs.filter(job => job.id == jobId))[0]
        console.log(job.id)
        res.status(201).render('modify-job', {
            page: 'Modify Job', 
            userId: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email, 
            username: user.username,
            job: job
        });
    }catch{
        res.status(201).render('error');
    }
})

Router.post('/modify', redirectLogin, (req, res) => {
    const { user } = res.locals;
    let jobs = req.session.jobs;
    let { jobId, frequency, tax, payRate, isHourly, hours, days, name  } = req.body
    isHourly = isHourly == 'hourly'
    isHourly = isHourly ? 'Hourly' : 'Salary'
    console.log(jobId, frequency, tax, payRate, isHourly, hours, days)
    let job = (jobs.filter(job => job.id == jobId))[0]
    console.log(job)
    let newJob = {
        name: name,
        frequency: frequency,
        tax: tax, 
        payRate: payRate, 
        isHourly: isHourly,
        hours: hours, 
        days: days,
        id: job.id,
        selected: job.selected
    }
    console.log(newJob)
    jobs.forEach(job => {
        if(job.id == jobId){
            Object.assign(job,newJob);
        }
    });
    console.log(jobs)
    
    res.status(201).redirect('jobs');
})



export default Router;