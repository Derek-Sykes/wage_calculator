// how much youll make in x time
export default class Time{

    constructor(timePeriod, tax, payRate, isHourly, hours=0,days=0){
        this.timePeriod = timePeriod;
        this.tax = tax;
        this.payRate = payRate;
        this.isHourly = isHourly === 'hourly';
        this.hours = hours || NaN;
        this.days = days || NaN;
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
            switch(this.timePeriod){
                case "daily":
                    return this.payRate * this.hours/this.days * this.tax
                case "weekly":
                    return this.payRate * this.hours * this.tax
                case "bi-weekly":
                    return this.payRate * (this.hours*2) * this.tax
                case "monthly":
                    return this.payRate * ((this.hours/5) * this.getWorkdaysInMonth(year,month)) * this.tax
                case "yearly":
                    return this.payRate * (this.hours*52) * this.tax
                default:
                    return NaN
            }
        }else{
            switch(this.timePeriod){
                case "hourly":
                    return (((this.payRate/52)/5)/8) * this.tax
                case "daily":
                    return ((this.payRate/52)/5) * this.tax
                case "weekly":
                    return (this.payRate/52) * this.tax
                case "bi-weekly":
                    return ((this.payRate/52)*2) * this.tax
                case "monthly":
                    return ((this.payRate/12)) * this.tax
                default:
                    return NaN
            }
        }

    }
}
