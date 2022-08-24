import zoneEnterEcho from "./dexie.mjs";

console.log('main.js ready');
import {indexPage, buildPills, loginPage} from "../Templates/templates.js";
import indexeddb from './indexeddb.js'

let weatherApp = {
    init: () => {
        const dataElement = document.getElementById('mainData');
        const pageData = JSON.parse(dataElement.innerText);
        let pageContainer = document.getElementById('container');

        console.log(document.body.id)
        if(document.body.id === 'loginpage'){
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildApp(pageData));
            weatherApp.buildJavaS();
        }else{
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildData(pageData));
            weatherApp.runSearch();
            //weatherApp.getSearchData();
            // weatherApp.postData();
            //weatherApp.changeAction();

            //weatherApp.getFData();
        }
    },

//          >>>>>>>>>Page Building Functions<<<<<<<<<<
    buildApp: (data) => {
        return indexPage(data);
    },
    buildJavaS: () => {
        return buildPills();
    },
    buildData: (data) => {
        return loginPage(data);
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

        console.log(data["location"])
        return await indexeddb[indexedName]
            .add(data)
            .then((location) => {
                console.log(location);
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
                weatherApp.displaySData(mongoResponse, false);
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
                }
                weatherApp.displaySData(response, true);

                // If there is not a match in indexedDB
            } else if (response.length === 0 || existInIndexedDB === false) {
                console.log("Getting new data from MongoDB to add in IndexedDB")
                weatherApp.getData(data, existInIndexedDB);
            }
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
    //          >>>>>>>>>Display Data<<<<<<<<<<
    displaySData: (data, exist) => {

        console.log(data);
        let mainData = '';

        if (!exist) {
            mainData = data;
        } else {
            mainData = data[0];
        }

        // const airPollutionData = data[0]['data']['list'];
        const searchResult = document.getElementById("searchResult");
        const heading = document.createElement("h2");
        const dataLocation = mainData.location;
        const dataType = mainData.type;

        heading.innerHTML = dataType + " for " + dataLocation;
        searchResult.appendChild(heading);

        switch (dataType) {
            case "airPollution":
                return weatherApp.airPollution(mainData, searchResult);
                break;
            case "weather":
                return weatherApp.weather(mainData, searchResult);
                break;
            case "forecast":
                return weatherApp.forecast(mainData, searchResult);
                break;
            default:
                throw new Error("There was no correct input");
        }

    },
    airPollution: (data, searchResult) => {
    },
    weather: (data, searchResult) => {
        // const weatherIcon = document.createElement("img");
        // weatherIcon.src = data.data['weather'][0].icon;
        // searchResult.appendChild(weatherIcon);
        // const paragraphW = document.createElement("p");
        // paragraphW.innerHTML = data.data['weather'][0].description;
        //
        // searchResult.appendChild(paragraphW);
        //
        // console.log(data.data['weather'][0].description);


    },
    forecast: (data, searchResult) => {
    },
    //          >>>>>>>>>Save Data<<<<<<<<<<
    saveHistory: (data) => {

        fetch("https://localhost/AirshopWeather_V2/index.html/history", {
            method: 'PUT',
            body: JSON.stringify({history: data}),
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            // console.log(response);
            return response.json();
        }).catch((e) => {
            return weatherApp.errorHandler("getData Error: " + (e.stack || e));
        })
    },
    //          >>>>>>>>>Search Data<<<<<<<<<<
    runSearch: () => {
        const form = document.getElementById('formSearch');
        const city = document.getElementById('cityName');
        const country = document.getElementById('countryName');
        const type = document.getElementById('searchSelect');
        const searchResult = document.getElementById("searchResult");


        form.addEventListener('submit', function (e) {

            // Prevent default behavior
            e.preventDefault();

            // delete div data
            if (searchResult.textContent.trim() !== '') {
                searchResult.textContent = '';
            }

            // Create new FormData object
            const myFormData = new FormData(event.target);

            const formDataObj = {};
            myFormData.forEach((value, key) => (formDataObj[key] = value));
            console.log(formDataObj);

            city.value = "";
            country.value = "";
            type.value = "";


            weatherApp.saveHistory(formDataObj);
            weatherApp.dataHandler(formDataObj);
        });

        },
    postError: async (error) => {
        await fetch("https://localhost/AirshopWeather_V2/index.html/error_log", {
            method: 'POST',
            body: JSON.stringify(error),
            headers: {'Content-Type': 'application/json'}
        })
    },sanitizeData:()=>{



        }

}


// let message = {
//     'Location': 'Thessaloniki',
//     'Type': 'forecast'
// }
// weatherApp.worker(message);
// weatherApp.getData(data);


// let data = {type: 'forecast', location: 'Thessaloniki'}
// weatherApp.getData(data, false);
weatherApp.init();
// let data = {type: 'airPollution', location: 'Thessaloniki'}
// weatherApp.dataHandler(data);
