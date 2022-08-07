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

    worker:async ()=>{
        const myWorker =new Worker('./Assets/Development/Workers/api.js');
        let dataJson;
        let message = {
            'function': 'start',
            'message': 'starting api'
        }
        myWorker.postMessage(message);
        myWorker.onmessage = (message) => {
            dataJson=message.data;
             return dataJson=JSON.parse(dataJson);



        }

    }
}

console.log(a);
weatherApp.worker();


weatherApp.init();

// TODO add data to database
// const product = {
//   'collection':'shoppingCart',
//   'data':{
//     'reference':1234567555,
//     'price':156.3,
//     'type':'SolarPanel',
//     'name':'GoalZero 80W Nomad',
//     'quantity':'5'
//   }
// }
//
// weatherApp.addToDatabase(product)
//     .then((result)=>{
//       console.log(result);
//     });

// TODO return stored data
// weatherApp.getStoredData().then((result)=>{
//     console.log(result);
// })

// TODO update stored data
// const data = {
//     'reference':1234567555,
//     'price':88.88,
//     'type':'SolarPanel',
//     'name':'GoalZero 80W Nomad',
//     'quantity':'123'
//   }
// weatherApp.modifyProduct(1234567555,data)
//     .then((result)=>{
//         console.log(result);
//     })

// TODO delete stored data
// weatherApp.deleteProduct(1234567555)
//     .then((result)=>{
//         console.log(result);
//     })
// .then(()=>{
//     weatherApp.refreshCart()
// })