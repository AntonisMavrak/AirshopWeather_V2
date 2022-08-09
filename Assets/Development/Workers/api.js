onmessage = (event) => {
    console.log('Worker Received Message');
    const postMess = () => {
        getWeather().then((response) => {
            postMessage(JSON.stringify(response));
        });
    };
    postMess();

}

// Get data from the API
let getWeather = async () => {
    let city_select = 'Athens';
    let key = '80d2ff5f959352f4319d73dc1f0171ce';
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city_select},eng&lang=eng&units=metric&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error) => {
            return error;
        });


}