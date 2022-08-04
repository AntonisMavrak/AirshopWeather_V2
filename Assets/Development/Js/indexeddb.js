import Dexie from './dexie.mjs'

export const indexeddb = new Dexie('Test_App');

indexeddb.version(1).stores({
    'shoppingCart':'reference'
    // header:'name,data',
    // paragraphs: 'name,data',
    // karameles: 'version,update'
});

export default indexeddb;