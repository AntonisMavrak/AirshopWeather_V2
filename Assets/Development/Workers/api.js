onmessage = (event) => {
    console.log('Worker Received Message');

 switch ('weather'){
     case 'weather': getWeather().then((response) => {
         postMessage(JSON.stringify(response));
     });
        break;
     case 'airPollution':airPollution().then((response) => {
         postMessage(JSON.stringify(response));
     });
        break;
     default: postMessage('ola lathos');



 }}
let getWeather=async ()=>{
    let city_select='Thessaloniki';
    let key='80d2ff5f959352f4319d73dc1f0171ce';
    return  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city_select},eng&lang=eng&units=metric&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error)=>{
            return error;
            });


}

let airPollution=async ()=>{
    let lat=37.983810;
    let lon=37.983810;
    let key='80d2ff5f959352f4319d73dc1f0171ce';
    return  fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error)=>{
            return error;
        });


}