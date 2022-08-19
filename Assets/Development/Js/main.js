import zoneEnterEcho from "./dexie.mjs";

console.log('main.js ready');
import {indexPage, buildPills, loginPage} from "../Templates/templates.js";
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

    updateIndexedDB: (data, exist) => {
        const indexedName = weatherApp.indexedChooser(data['type']);

        // If not exist in IndexedDB
        if (!exist) {
            //Insert in indexDB
            console.log("New location data added")
            weatherApp.addToDatabase(data, indexedName).then((result) => {
                // Here print data to front end
                return weatherApp.successHandler('Added: ' + result)
            }).catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
        } else {

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
    worker: (message, exist) => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');

        myWorker.postMessage(message);
        myWorker.onmessage = (message) => {
            weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", message.data).then(() => {
                console.log("Successfully updated Mongo")

                // Call function
                weatherApp.updateIndexedDB(message.data, exist);
            })

        }

        return myWorker;
    },

    indexedDBWorker: () => {
        const dbWorker = new Worker('./Assets/Development/Workers/indexeddbWorker.js');
        dbWorker.postMessage("asg")
    },


//          >>>>>>>>>Data Handlers<<<<<<<<<<
    postData: async (url, data) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({data: data, type: 'forecast', location: "Thessaloniki"}),  //na tsekaroume an exei data to array pou erxetai
            headers: {'Content-Type': 'text/html'}
        });
        return response;
    },


    getData: async (data, exist) => {

        await fetch("https://localhost/AirshopWeather_V2/index.html/saved_data", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            return response.json();
        }).then((mongoResponse) => {

            if (mongoResponse === false) {
                weatherApp.worker(data, exist);
            } else {
                // Call function
                weatherApp.updateIndexedDB(mongoResponse, exist);
            }
        })
            .catch((e) => {
                return weatherApp.errorHandler("getData Error: " + (e.stack || e));
            })

    },

    dataHandler: (data) => {

        const indexedName = weatherApp.indexedChooser(data['type']);
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



//          >>>>>>>>>Helping Functions<<<<<<<<<<

    indexedChooser: (type) => {
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

let data = {type: 'weather', location: 'Athens'}
weatherApp.getData(data,false);

// let data = {type: 'forecast', location: 'Thessaloniki'}
// weatherApp.getData(data, false);

let data = {type: 'forecast', location: 'Thessaloniki'}
weatherApp.dataHandler(data);