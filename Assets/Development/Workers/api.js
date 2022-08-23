onmessage = (event) => {

    switch (event.data['type']) {
        case 'weather':
            getWeather(event.data['location']).then((response) => {
                postMessage(JSON.stringify(response));
            });
            break;
        case 'airPollution':
            findLocation(event.data['location']).then((response) => {
                // City passed does not exist or could not be found
                if (response.length === 0){
                    postMessage('{"cod":"404"}');
                }else {
                    airPollution(response[0].lat, response[0].lon).then((response) => {
                        postMessage(JSON.stringify(response));
                    })
                }
            });
            break;
        case'forecast':
            findLocation(event.data['location']).then((response) => {
                // City passed does not exist or could not be found
                if (response.length === 0){
                    postMessage('{"cod":"404"}');
                }else {
                    weatherForecast(response[0].lat, response[0].lon).then((response) => {
                        postMessage(JSON.stringify(response));
                    })
                }
            });
            break;
        default:
            postMessage('Wrong data["type"] passed');
    }
}

// Returns the weather as JSON of a city name that is passed
let getWeather = async (city_select) => {
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

// Returns the air pollution data as JSON of the lat and lon location that is passed
let airPollution = async (lat,lon) => {
    let key = '80d2ff5f959352f4319d73dc1f0171ce';
    return fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error) => {
            return error;
        });


}

// Returns the forecast as JSON of the lat and lon location that is passed
let weatherForecast = async (lat,lon) => {

    let key = '80d2ff5f959352f4319d73dc1f0171ce';
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error) => {
            return error;
        });
}

// Returns lat and lot as JSON based of a city name that is passed
let findLocation = async (city_name) => {
    let key = '80d2ff5f959352f4319d73dc1f0171ce';
    let country_code = 'GR';
    let limit = 1;
    return fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city_name},${country_code}&limit=${limit}&appid=${key}`,
        {method: 'GET'}
    )
        .then(response => {
            return response.json();
        })
        .catch((error) => {
            return error;
        });
}



