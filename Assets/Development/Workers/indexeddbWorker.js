import indexeddb from "../Js/indexeddb.js";

onmessage = (event) => {
    console.log(event.data)

}


//          >>>>>>>>>IndexedDb functions<<<<<<<<<<
async function addToDatabase(data) {

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
}

async function getStoredData() {
    if (indexeddb['myAirPollution'] === undefined){
        console.log("f")
    }
    //return await indexeddb['myAirPollution'].toArray()
}

async function modifyProduct(location, data) {
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
}

