let array = [];
let elem = array[0] || "h";
console.log("Elem: ", elem);

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
// // })
// window.onload = function(){
//     for(let job of jobs){
//         console.log(jobs)
//         // every time the element select plus id is clicked
//         document.getElementById("select"+job.id).addEventListener('click', function() {
//             for(let Job of jobs){
//                 if(Job.selected){
//                     document.getElementById("paragraph"+Job.id).hidden = false
//                     document.getElementById("select"+job.id).replaceWith(document.getElementById("paragraph"+Job.id))
//                 }else{
//                     document.getElementById("paragraph"+Job.id).hidden = true
//                     document.getElementById("paragraph"+Job.id).replaceWith(document.getElementById("select"+job.id))
//                 }
//             }

//         })
//     }
// }
