// let frequencyEl = document.getElementById("frequency")
// let checkEl = document.getElementById("check")
// let payRateEl = document.getElementById("payRate")
// let isHourlyEl = document.getElementById("isHourly")
// let hoursEl = document.getElementById("hours")
// let timePeriodEl = document.getElementById("timePeriod")

// let frequency = frequencyEl.value;
// let check = checkEl.value;
// let payRate = payRateEl.value;
// let isHourly = isHourlyEl.value;
// let hours = hoursEl.value;
// let timePeriod = timePeriodEl.value;

// let baseurl = "localhost:8484/"
// async function postInfo(frequency, check, payRate, isHourly, hours=0){
//     //e.preventDefault();
//     const res = await fetch(baseurl + 'tax', 
//     {
//         method:'POST',
//         headers: {
//             "Content-Type": 'application/json'
//         },
//         body: JSON.stringify({
//             frequency: frequency,
//             check: check,
//             payRate: payRate,
//             isHourly: isHourly,
//             hours: hours,
//             timePeriod: timePeriod         
//         })
//     });
// }
// function updateUI(){
//     postInfo(frequency, check, payRate, isHourly, hours)
// }
// //add event listener to the submit button
// document.querySelector("#submit").addEventListener('click', (event)=>{
//     updateUI()
// })