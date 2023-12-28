export default class Tax{
    // let frequency;
    // let amount;
    // let payRate;
    // let isHourly;

    constructor(frequency, check, payRate, isHourly, hours=0){
        this.frequency = frequency;
        this.check = check;
        this.payRate = payRate;
        this.isHourly = isHourly === 'hourly';
        this.hours = hours || NaN;
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth() + 1;
        this.currentYear = this.currentDate.getFullYear();
    }

    getWorkdaysInMonth(year, month) {
        // Validate inputs
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            throw new Error('Invalid year or month');
        }
    
        // Calculate the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
    
        // Initialize count of workdays
        let workdayCount = 0;
    
        // Iterate over each day in the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
    
            // Check if the day is a weekday (Monday to Friday)
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
                workdayCount++;
            }
        }
    
        return workdayCount;
    }
    
    calculateTax(month = this.currentMonth, year = this.currentYear){
        if (this.isHourly) {
            if(isNaN(this.hours)){
                return NaN
            }
            switch(this.frequency){
                case "daily":
                    return this.check / this.payRate * hours/5
                case "weekly":
                    return this.check/(this.hours * this.payRate);
                case "bi-weekly":
                    return this.check/(2*this.hours * this.payRate);
                case "monthly":
                    return this.check/((this.hours/5) * this.getWorkdaysInMonth(year, month)* this.payRate);
                case "yearly":
                    return this.check/((this.hours*52)* this.payRate);
                default:
                    return NaN
            }
        }else{
            switch(this.frequency){
                
                case "daily":
                    return this.check / ((this.payRate/52)/5)
                case "weekly":
                    return this.check / (this.payRate/52)
                case "bi-weekly":
                    return this.check / ((this.payRate/52)*2)
                case "monthly":
                    return this.check / (this.payRate/12)
                case "yearly":
                    return this.check/this.payRate;
                default:
                    return NaN
            }
        }

    }
}
