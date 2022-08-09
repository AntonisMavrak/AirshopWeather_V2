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
    addToDatabase: async (data) => {
        return await indexeddb[data['collection']]
            .add(data['data'])
            .then((id) => {
                console.log(id);
                return weatherApp.successHandler('Product with id:' + id + ' added to shopping cart');
            })
            .catch((e) => {
                return weatherApp.errorHandler("Error: " + (e.stack || e));
            })
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
    getStoredData: async () => {
        return await indexeddb['shoppingCart'].toArray()
    },
    modifyProduct: async (productRef, data) => {
        return await indexeddb['shoppingCart']
            .where('reference')
            .equals(productRef)
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
    deleteProduct: async (productRef) => {
        return await indexeddb['shoppingCart']
            .where('reference')
            .equals(productRef)
            .delete()
            .then((result) => {
                return weatherApp.successHandler('deleted: ' + result)
            })
    },
    refreshCart(){
        console.log('Cart is Refreshed !!!!!')
    },

    worker: () => {
        const myWorker = new Worker('./Assets/Development/Workers/api.js');
        let message = {
            'function': 'start',
            'message': 'starting api'
        }
        myWorker.postMessage(message);
        myWorker.onmessage = (message) => {
            weatherApp.postData("https://localhost/AirshopWeather_V2/index.html/saved_data", message.data).then(()=>{
                console.log("success")
            })
        }
        return myWorker;
    },

    postData:async (url,data)=>{
        const response = await fetch(url, {
            method: 'POST',
            body:  data,
            headers:{'Content-Type':'text/html'}
        });
        return response;
    }
}

weatherApp.worker();
// weatherApp.init();

// let myWorker=weatherApp.worker();
// myWorker.postMessage("ok");
// myWorker.onmessage=(ev)=>{
//     console.log(ev.data);
// }


// let postData=(dataJson)=>{
//     let url="https://localhost/AirshopWeather_V2/index";
//     let flag=dataJson;
//     console.log(flag);
//     let httpRequest = new XMLHttpRequest();
//     // httpRequest.onreadystatechange = alertContents;
//     httpRequest.open('POST', url);
//     httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     httpRequest.send('flag=' + encodeURIComponent(flag));
// }
// function alertContents() {
//     let httpRequest;
//     if (httpRequest.readyState === XMLHttpRequest.DONE) {
//         if (httpRequest.status === 200) {
//             let response = JSON.parse(httpRequest.responseText);
//             alert(response.computedString);
//         } else {
//             alert('There was a problem with the request.');
//         }
//     }
// }

