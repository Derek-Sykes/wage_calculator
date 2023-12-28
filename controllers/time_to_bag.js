export default class TimeToBag{

    constructor(sum, tax, payRate, isHourly, hours=0, days=0){
        this.totalHours;
        this.sum = sum;
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
            this.totalHours = this.sum/(this.payRate*tax)
            return this.totalHours
        }
        this.totalHours = this.sum/((((this.payRate/52)/5)/8) * this.tax)
        return this.totalHours
        

    }
    convertToTimePeriod(timePeriod){
        if (this.isHourly) {
            if(isNaN(this.hours)){
                return NaN
            }
            switch(timePeriod){
                case "days":
                    return this.totalHours/(this.hours/this.days)
                case "weeks":
                    return this.totalHours/this.hours
                case "months":
                    return this.this.totalHours/((this.hours/5)* this.getWorkdaysInMonth(year,month))
                case "years":
                    return this.totalHours/(this.hours*52)
                default:
                    return NaN
            }
        }else{
            switch(timePeriod){
                case "days":
                    return this.totalHours/8
                case "weeks":
                    return this.totalHours/40
                case "months":
                    return this.totalHours/730
                case "years":
                    return this.totalHours/(730*12)
                default:
                    return NaN
            }
        }
    }
}
