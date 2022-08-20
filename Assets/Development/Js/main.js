import zoneEnterEcho from "./dexie.mjs";

console.log('main.js ready');
import indexeddb from './indexeddb.js'

let weatherApp = {
    init: () => {
        const dataElement = document.getElementById('mainData');
        const pageData = JSON.parse(dataElement.innerText);
        let pageContainer = document.getElementById('container');

        if(document.body.id === 'index'){
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildApp(pageData));
            weatherApp.buildJavaS();
        }else{
            pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildData(pageData));
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
            console.log("New location data added")
            weatherApp.addToDatabase(data, indexedName).then((result) => {
                // Here print data to front end
                return weatherApp.successHandler('Added: ' + result)
            }).catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
        } else {
            //Update in indexedDB
            console.log("Document updated")
            weatherApp.modifyDocument(data['location'], data, indexedName).then((result) => {
                // Here print data to front end
                return weatherApp.successHandler('Updated: ' + result)
            }).catch((e) => {
                return weatherApp.errorHandler("Update Error: " + (e.stack || e));
            })

        }
        console.log(data);
    },



//          >>>>>>>>>Workers<<<<<<<<<<
    // Worker that calls to the OpenWeatherAPI and registers that data to the MongoDB
    worker: (message, exist) => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');

        myWorker.postMessage(message);
        myWorker.onmessage = (msg) => {
            weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", msg.data).then(() => {
                console.log("Successfully updated Mongo from API")
                // Call function
                weatherApp.getData(message, exist);
            })

        }

        return myWorker;
    },

    indexedDBWorker: () => {
        const dbWorker = new Worker('./Assets/Development/Workers/indexeddbWorker.js');
        dbWorker.postMessage("asg")
    },


//          >>>>>>>>>Data Handlers<<<<<<<<<<
    // Post data from the API to the MongoDB
    postData: async (url, data) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({data: data, type: 'airPollution', location: "Thessaloniki"}),  /*TODO fix type and
                                                                                                        location to be inputted by front end */
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

            if (response.length !== 0) {
                existInIndexedDB = true;

                // From indexedDb                               // Add 2 hours in ms format     // Current Date in ms
                if ((Number(response[0]['expireAt'].$date.$numberLong) + (2 * weatherApp.getInterval("h", true))) <= Date.now()) {
                    // Call Mongo
                    console.log("Getting data from Mongo to update")
                    weatherApp.getData(data, existInIndexedDB);
                } else {
                    // Print from indexedDb
                    console.log(response)
                    console.log("Data is already in IndexedDB")
                }

            } else if (response.length === 0 || existInIndexedDB === false) {
                console.log("Getting data from Mongo to add new")
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

let data = {type: 'airPollution', location: 'Thessaloniki'}
weatherApp.dataHandler(data);