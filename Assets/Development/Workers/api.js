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
// findLocation('Thessaloniki').then((response) => {
//     postMessage(JSON.stringify(response));
// });


