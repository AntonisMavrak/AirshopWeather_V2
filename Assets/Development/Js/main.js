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
            .then((id) => {
                console.log(id);
                return weatherApp.successHandler('Product with id:' + id + ' added to shopping cart');
            })
            .catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
    },

    getStoredData: async (indexedName) => {
        if (indexeddb[indexedName] === undefined){
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
    worker: () => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');
        let message = {
            'Location': 'Thessaloniki',
            'Type': 'airPollution'
        }
        myWorker.postMessage(message);
        myWorker.onmessage = (message) => {
            weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", message.data).then(() => {
                console.log("success")
            })
        }
        return myWorker;
    },

    indexedDBWorker: () => {
        //const dbWorker = new Worker('./Assets/Development/Workers/indexeddbWorker.js');

    },


//          >>>>>>>>>Data Handlers<<<<<<<<<<
    postData: async (url, data) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({data: data, type: 'airPollution', location: "Thessaloniki"}),  //na tsekaroume an exei data to array pou erxetai
            headers: {'Content-Type': 'text/html'}
        });
        return response;
    },

    getData: async (data) => {

        await fetch("https://localhost/AirshopWeather_V2/index.html/saved_data", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            return response.json();
        }).then((responseData) => {
            const indexedName = weatherApp.indexedChooser(responseData['type']);
            const storedData = weatherApp.getStoredData(indexedName);
            let exist = false;

            storedData.then(response => {

                if (response.length !== 0) {
                    for (let i = 0; i < response.length; i++) {
                        if (response[i]["location"] === responseData["location"]) {
                            console.log("Location already registered in indexedDB");
                            exist = true;

                            // Update indexedDB
                            // if IndexedDb date !== MongoDb date
                            if (response[0]['expireAt'].$date.$numberLong !== responseData['expireAt'].$date.$numberLong){
                                try {
                                    weatherApp.modifyDocument(responseData['location'], responseData, indexedName)
                                    console.log("Document updated")
                                }catch (e){
                                    weatherApp.errorHandler("Update Error: " + (e.stack || e));
                                }

                            }
                        }
                    }
                }

                // Insert new document in IndexDB
                if (!exist || response.length === 0) {
                    console.log("New location data added")
                    weatherApp.addToDatabase(responseData, indexedName).then((result) => {
                        return weatherApp.successHandler('Modified: ' + result)
                    }).catch((e) => {
                        return weatherApp.errorHandler("Error: " + (e.stack || e));
                    })
                }

            })
        })
            .catch((e) => {
                return weatherApp.errorHandler("getData Error: " + (e.stack || e));
            })

    },

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
    }
}


weatherApp.init();
let data = {type: 'airPollution', location: 'Thessaloniki'}
weatherApp.getData(data);