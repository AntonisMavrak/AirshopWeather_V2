import Dexie from './dexie.mjs'

export const indexeddb = new Dexie('Weather_App');

indexeddb.version(2).stores({
    'myWeather': 'location',
    'myAirPollution': 'location',
    'myForecast': 'location'

});

export default indexeddb;