import zoneEnterEcho from "./dexie.mjs";

console.log('ready');
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
    addToDatabase: async (data) => {

        console.log(data["name"])
        return await indexeddb['myWeather']
            .add(data)
            .then((id) => {
                console.log(id);
                return weatherApp.successHandler('Product with id:' + id + ' added to shopping cart');
            })
            .catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
    },
    getStoredData: async () => {
        return await indexeddb['myWeather'].toArray()
    },
    modifyProduct: async (location, data) => {
        return await indexeddb['myWeather']
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

    worker: () => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');
        let message = {
            'Location': 'Athens',
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
        const dbWorker = new Worker('./Assets/Development/Workers/api.js');
        let message = {
            'function': 'start',
            'message': 'starting api'
        }
        dbWorker.postMessage(message);
        dbWorker.onmessage = (message) => {
            let jsonData = JSON.parse(message.data);
            let storedData = weatherApp.getStoredData();
            let exist = false;
            storedData.then(value => {
                for (let i = 0; i < value.length; i++) {
                    if (value[i]["name"] === jsonData["name"]) {
                        console.log("Location already registered in indexedDB")
                        exist = true;
                        // TODO
                        //  Check if date of indexeddb data equals with the date of the db data
                    }
                }
                if (!exist) {
                    console.log("New location data added")
                    weatherApp.addToDatabase(jsonData).then((result) => {
                        return weatherApp.successHandler('modified: ' + result)
                    }).catch((e) => {
                        return weatherApp.errorHandler("Error: " + (e.stack || e));
                    })
                }
            })
                .catch((e) => {
                    return weatherApp.errorHandler("Error: " + (e.stack || e));
                })
        }
        return dbWorker;
    },

    postData: async (url, data) => {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({data: data, type: 'airPollution',location:"Athens"}),  //na tsekaroume an exei data to array pou erxetai
            headers: {'Content-Type': 'text/html'}
        });
        return response;
    },
    getData:async ()=>{
        let data={type:'airPollution',location:'Athens'}
        const response = await fetch("https://localhost/AirshopWeather_V2/index.html/saved_data", {
            method: 'POST',
            body: JSON.stringify( data),
            headers: {'Content-Type': 'application/json'}
        }).then(response=>{
           return response.json();
        }).then((data) =>{
            console.log(data);
            return data;
        })

    }
}


// weatherApp.worker();
weatherApp.getData();








