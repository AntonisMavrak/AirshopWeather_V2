import Dexie from './dexie.mjs'

export const db = new Dexie('Test_App');

db.version(1).stores({
    'shoppingCart':'reference'
    // header:'name,data',
    // paragraphs: 'name,data',
    // karameles: 'version,update'
});

export default db;