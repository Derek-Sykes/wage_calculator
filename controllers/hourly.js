// how much youll make in x time
export default class Hourly{

    constructor(frequency, tax=0, check, isHourly, hours=0,days=0){
        this.frequency = frequency;
        this.tax = tax||1;
        this.check = check;
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
    
    calculateHourly(month = this.currentMonth, year = this.currentYear){
        if (this.isHourly) {
            if(isNaN(this.hours)){
                return NaN
            }
            switch(this.frequency){
                case "daily":
                    return ((this.check / this.tax)*this.days)/this.hours
                case "weekly":
                    return (this.check / this.tax) /this.hours
                case "bi-weekly":
                    return ((this.check / this.tax)/2) /this.hours
                case "monthly":
                    return (this.check / this.tax) /((this.hours/5) * this.getWorkdaysInMonth(year,month))
                case "yearly":
                    return (this.check / this.tax) /(this.hours * 52)
                default:
                    return NaN
            }
        }else{
            switch(this.frequency){
                case "daily":
                    return ((this.check / this.tax))/8
                case "weekly":
                    return (this.check / this.tax) /40
                case "bi-weekly":
                    return ((this.check / this.tax)) /80
                case "monthly":
                    return (this.check / this.tax) /(2080/12)
                case "yearly":
                    return (this.check / this.tax) /(2080)
                default:
                    return NaN
            }
        }

    }
}
