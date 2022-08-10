import Dexie from './dexie.mjs'

export const indexeddb = new Dexie('Weather_App');

indexeddb.version(1).stores({
    'myWeather':'name'

});

export default indexeddb;