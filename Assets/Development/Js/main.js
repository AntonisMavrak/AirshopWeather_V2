import zoneEnterEcho from "./dexie.mjs";

console.log('main.js ready');
import {indexPage, buildPills, loginPage} from "../Templates/templates.js";
import indexeddb from './indexeddb.js'

let weatherApp = {
    init: () => {
        const dataElement = document.getElementById('mainData');
        const pageData = JSON.parse(dataElement.innerText);
        let pageContainer = document.getElementById('container');

        if (document.body.id === 'loginpage') {
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildLogin(pageData));
            weatherApp.buildLoginJs();
        } else {
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildIndex(pageData));
            weatherApp.runSearch();
        }
    },

//          >>>>>>>>>Page Building Functions<<<<<<<<<<
    buildLogin: (data) => {
        return loginPage(data);
    },
    buildLoginJs: () => {
        return buildPills();
    },
    buildIndex: (data) => {
        return indexPage(data);
    },

//          >>>>>>>>>Error/Success Handlers<<<<<<<<<<
    errorHandler(data) {
        weatherApp.postError(data)
        return {
            'status': 'error',
            'message': data
        }
    },
    successHandler(data) {
        return {
            'status': 'success',
            'message': data
        }
    },

//          >>>>>>>>>IndexedDb functions<<<<<<<<<<
    // Adds new document to indexedDB
    addToDatabase: async (data, indexedName) => {

        return await indexeddb[indexedName]
            .add(data)
            .then((location) => {
                return weatherApp.successHandler('Data added');
            })
            .catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
    },

    // Returns the data as an array that is equals to the location and type
    getStoredData: async (indexedName, locationName) => {
        if (indexeddb[indexedName] === undefined) {
            return [];
        }
        return await indexeddb[indexedName]
            .where('location')
            .equals(locationName)
            .toArray()
    },

    // Modifies already registered document with new data
    modifyDocument: async (location, data, indexedName) => {
        return await indexeddb[indexedName]
            .where('location')
            .equals(location)
            .modify(data)
            .then((result) => {
                return weatherApp.successHandler('modified: ' + result)
            })
            .catch(indexeddb.ModifyError, (error) => {
                return weatherApp.errorHandler(error.failures.length + " items failed to modify.");
            })
            .catch((error) => {
                return weatherApp.errorHandler("Generic error: " + error);
            })
    },

    // Updated indexedDB with new document or modifies already registered one
    updateIndexedDB: (data, exist) => {
        const indexedName = weatherApp.indexedPicker(data['type']);

        // If not exist in IndexedDB
        if (!exist) {
            //Insert in indexedDB
            console.log("New location '" + data['location'] + "' added in IndexedDB")
            weatherApp.addToDatabase(data, indexedName).then((result) => {
                // Here print data to front end
                return weatherApp.successHandler('Added: ' + result)
            }).catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
        } else {
            //Update in indexedDB
            console.log("Document '" + data['location'] + "' updated in IndexedDB")
            weatherApp.modifyDocument(data['location'], data, indexedName).then((result) => {
                // Here print data to front end
                return weatherApp.successHandler('Updated: ' + result)
            }).catch((e) => {
                return weatherApp.errorHandler("Update Error: " + (e.stack || e));
            })

        }
        console.log("Data that was saved: ")
        console.log(data);
        weatherApp.printData(data, false);
    },


//          >>>>>>>>>Workers<<<<<<<<<<
    // Worker that calls to the OpenWeatherAPI and registers that data to the MongoDB
    worker: (message, exist) => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');

        myWorker.postMessage(message);
        myWorker.onmessage = (msg) => {
            const msgJson = JSON.parse(msg.data)

            // If message['location'] does not exist or is wrong
            if (msgJson['cod'] == '404') {
                weatherApp.postError(msgJson);
                console.log("Location that was passed does not exist or could not be found")
                weatherApp.printData("Location that was passed does not exist or could not be found")
            } else {
                weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", msg.data, message).then(() => {
                    console.log("Successfully updated Mongo from OpenWeatherAPI")
                    // Call function
                    weatherApp.getData(message, exist);
                })
            }
        }

        return myWorker;
    },


//          >>>>>>>>>Data Handlers<<<<<<<<<<

    // Post data from the API to the MongoDB
    postData: async (url, data, requestedData) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({data: data, type: requestedData['type'], location: requestedData['location']}),
            headers: {'Content-Type': 'text/html'}
        });
        return response;
    },

    // Gets data from MongoDB and chooses if to update IndexedDB or call API to get new data
    getData: async (data, exist) => {

        await fetch("https://localhost/AirshopWeather_V2/index.html/saved_data", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            return response.json();
        }).then((mongoResponse) => {
            // If Mongo does not have the data
            if (mongoResponse === false) {
                // Call worker to fetch them from the API
                weatherApp.worker(data, exist);
            } else {
                weatherApp.updateIndexedDB(mongoResponse, exist);
            }
        })
            .catch((e) => {
                return weatherApp.errorHandler("getData Error: " + (e.stack || e));
            })

    },

    // Handles the data from the IndexedDB and chooses if to print them or to request new data
    dataHandler: (data) => {

        const indexedName = weatherApp.indexedPicker(data['type']);
        const storedData = weatherApp.getStoredData(indexedName, data['location']);
        let existInIndexedDB = false;
        storedData.then(response => {

            // If there is a match in indexedDB
            if (response.length !== 0) {
                existInIndexedDB = true;
                // Date in timestamp format
                const createdDate = Number(response[0]['expireAt'].$date.$numberLong);
                const expireDate = createdDate + (2 * weatherApp.getInterval("h", true));

                // If expire date has passed
                if (expireDate <= Date.now()) {
                    // Call Mongo
                    console.log("Getting data from Mongo to update")
                    weatherApp.getData(data, existInIndexedDB);
                } else {
                    // Print from indexedDb
                    console.log("Data already in IndexedDB")
                    weatherApp.printData(response, true);
                }
                // If there is not a match in indexedDB
            } else if (response.length === 0 || existInIndexedDB === false) {
                console.log("Getting new data from MongoDB to add in IndexedDB")
                weatherApp.getData(data, existInIndexedDB);
            }
        })
    },
    //          >>>>>>>>>Search Data<<<<<<<<<<
    runSearch: () => {
        const form = document.getElementById('formSearch');
        const city = document.getElementById('cityName');
        const type = document.getElementById('searchSelect');

        form.addEventListener('submit', function (e) {

            // Prevent default behavior
            e.preventDefault();

            // refresh div
            if (searchResult.textContent !== '') {
                searchResult.textContent = '';
            }

            // Create new FormData object
            const myFormData = new FormData(event.target);

            const formDataObj = {};
            myFormData.forEach((value, key) => (formDataObj[key] = value));

            city.value = "";
            type.value = "";

            weatherApp.saveHistory(formDataObj);
            weatherApp.dataHandler(formDataObj);
        });
    },

    //          >>>>>>>>>Save Data<<<<<<<<<<
    saveHistory: (data) => {

        console.log(data)
        fetch("https://localhost/AirshopWeather_V2/index.html/history", {
            method: 'PUT',
            body: JSON.stringify({history: data}),
            headers: {'Content-Type': 'application/json'}
        }).catch((e) => {
            return weatherApp.errorHandler("getData Error: " + (e.stack || e));
        })
    },
//          >>>>>>>>>Toolkit<<<<<<<<<<

    // Picks the correct 'table' from indexedDB that user requested
    indexedPicker: (type) => {
        switch (type) {
            case "airPollution":
                return "myAirPollution"
                break;
            case "weather":
                return "myWeather";
                break;
            case "forecast":
                return "myForecast"
                break;
            default:
                return 0;
        }
    },

    // Returns the correct number based on ms,sec,min,hour that user requests
    getInterval: (string, inMs = false) => {
        let second;
        if (inMs) {
            second = 1000;
        } else {
            second = 1;
        }
        let minute = second * 60;
        let hour = minute * 60;
        switch (string) {
            case "s":
                return second;
            case "m":
                return minute;
            case "h":
                return hour;
            default:
                throw new Error("There was no correct data parsed");
        }
    },
//          >>>>>>>>>Save errors<<<<<<<<<<
    postError: async (error) => {
        await fetch("https://localhost/AirshopWeather_V2/index.html/error_log", {
            method: 'POST',
            body: JSON.stringify(error),
            headers: {'Content-Type': 'application/json'}
        })
    },
//          >>>>>>>>>Display Data<<<<<<<<<<
    printData: (data, exist) => {

        let header = '';

        if (!exist) {
            header = data;
        } else {
            header = data[0];
        }

        let div = document.getElementById('searchResult');
        const dataLocation = header.location;
        const dataType = header.type;

        console.log(data);

        if(dataType!=='weather'){
            return div.innerHTML = "<h2>" + dataType + " for " + dataLocation + "</h2>" +
                "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
        }else{
            const dataId = header.data['id'];
            return  weatherApp.displayWeatherWidget(dataId);
        }
    },
    displayWeatherWidget: (id) => {
        const scriptWidgetW = document.getElementById('widget');

        window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
        window.myWidgetParam.push({
            id: 15,
            cityid: id,
            appid: 'c82ec9850c26c555aebf1467c733fb37',
            units: 'metric',
            containerid: 'searchResult',
        });
        if (scriptWidgetW !== null) {
            scriptWidgetW.remove();
        }
        (function () {
            var script = document.createElement('script');
            script.async = true;
            script.charset = "utf-8";
            script.id = "widget"
            script.src = "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(script, s);
        })();
    }
    // displayForecastrWidget: (id) => {
    //     const scriptWidgetF = document.getElementById('widgetF');
    //
    //     window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
    //     window.myWidgetParam.push({
    //         id: 11,
    //         cityid: id,
    //         appid: 'c82ec9850c26c555aebf1467c733fb37',
    //         units: 'metric',
    //         containerid: 'searchResult',
    //     });
    //
    //     (function () {
    //         var script = document.createElement('script');
    //         script.async = true;
    //         script.charset = "utf-8";
    //         script.id = "theme"
    //         script.src = "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/d3.min.js";
    //         var s = document.getElementsByTagName('script')[0];
    //         s.parentNode.insertBefore(script, s);
    //     })();
    // }
}

weatherApp.init();

