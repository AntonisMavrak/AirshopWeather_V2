import zoneEnterEcho from "./dexie.mjs";

console.log('main.js ready');
import {header1} from "../Templates/templates.js";
import indexeddb from './indexeddb.js'

let weatherApp = {
    init: () => {
        const dataElement = document.getElementById('mainData');
        const pageData = JSON.parse(dataElement.innerText);
        let pageContainer = document.getElementById('container');
        pageContainer.insertAdjacentHTML('beforeend', weatherApp.buildHeader(pageData))
    },
    buildHeader: (data) => {
        return header1(data);
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

    getStoredData: async (indexedName) => {
        if (indexeddb[indexedName] === undefined) {
            return [];
        }
        return await indexeddb[indexedName].toArray()
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


//          >>>>>>>>>Workers<<<<<<<<<<
    worker: (message) => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');

        myWorker.postMessage(message);
        myWorker.onmessage = (message) => {
            weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", message.data).then(() => {
                console.log("success")
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
        }).then((responseData) => {

            if (!responseData){
               weatherApp.worker(data);
            }

            const indexedName = weatherApp.indexedChooser(responseData['type']);

            if (!exist) {
                //Not exist in index
                //Insert in index
                console.log("New location data added")
                weatherApp.addToDatabase(responseData, indexedName).then((result) => {
                    return weatherApp.successHandler('Added: ' + result)
                }).catch((e) => {
                    return weatherApp.errorHandler("Error: " + (e.stack || e));
                })
            } else {
                try {
                    weatherApp.modifyDocument(responseData['location'], responseData, indexedName)
                    console.log("Document updated")
                    return weatherApp.successHandler('Updated: ' + result)
                } catch (e) {
                    return weatherApp.errorHandler("Update Error: " + (e.stack || e));
                }

            }
        })
            .catch((e) => {
                return weatherApp.errorHandler("getData Error: " + (e.stack || e));
            })

    },

    dataHandler: (data) => {

        const indexedName = weatherApp.indexedChooser(data['type']);
        const storedData = weatherApp.getStoredData(indexedName);
        let exist = false;
        storedData.then(response => {
            if (response.length !== 0) {
                for (let i = 0; i < response.length; i++) {
                    if (response[i]["location"] === data["location"]) {
                        exist = true;

                        // From indexedDb                               // Add 2 hours in ms format     // Current Date in ms
                        if ((Number(response[i]['expireAt'].$date.$numberLong) + (2 * weatherApp.getInterval("h", true))) <= Date.now()) {
                            // Call Mongo
                            console.log("Getting data from Mongo")
                            weatherApp.getData(data,exist);
                        } else {
                            // Print from indexedDb
                            console.log("Data is already in IndexedDB")
                        }
                    }
                }
            } else if (response.length === 0 || exist === false) {
                weatherApp.getData(data,exist);
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
// weatherApp.dataHandler(data);