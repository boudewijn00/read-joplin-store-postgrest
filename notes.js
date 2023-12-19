import dotenv from 'dotenv'
import postgrestService from './services/postgrest.js'
import joplinService from './services/joplin.js'

const postgrestServiceObject = new postgrestService()
const joplinServiceObject = new joplinService()
dotenv.config();

postgrestServiceObject.deleteAll().then(async () => {
    await joplinServiceObject.getTags().then(async data => {
        let promises = [];
        for (let i in data.items){
            let promise = new Promise(async (resolve, reject) => {
                await postgrestServiceObject.postTag(data.items[i]).catch(err => console.log(err))
                resolve()
            })
            promises.push(promise);
        }

        return Promise.all(promises);
    })
}).then(async () => {
    await joplinServiceObject.getFolders().then(async data => {
        let promises = [];
        for (let i in data.items){
            let promise = new Promise(async (resolve, reject) => {
                await postgrestServiceObject.postFolder(data.items[i]).catch(err => console.log(err))
                resolve()
            })
            promises.push(promise);
        }

        return Promise.all(promises);
    })
}).then(async () => {
    await joplinServiceObject.getFolders().then(async folders => {
        let promises = [];
            for (let i in folders.items){
                let promise = new Promise(async (resolve, reject) => {
                    await processFolderNotes(folders.items[i].id)
                    resolve()
                })
                promises.push(promise);
            }

            return Promise.all(promises);
        })
}).then(async () => {
    await joplinServiceObject.getResources().then(async data => {
        let promises = [];
        for (let i in data.items){
            let promise = new Promise(async (resolve, reject) => {
                await joplinServiceObject.getResource(data.items[i].id).then(async resource => {
                    await postgrestServiceObject.postResource(data.items[i], resource).catch(err => console.log(err))
                })
                resolve()
            })
            promises.push(promise);
        }

        return Promise.all(promises);
    })
})

async function processFolderNotes(folderId, page = 1) {
    await joplinServiceObject.getFolderNotes(folderId, page).then(async notes => {
        let promises = [];
        for (let i in notes.items) {
            let promise = new Promise(async (resolve, reject) => {
                await joplinServiceObject.getNoteTags(notes.items[i].id).then(async tags => {
                    const tagNames = tags.items.map(tag => tag.title)
                    await postgrestServiceObject.postNote(notes.items[i], tagNames, null)    
                })
                resolve()
            })
            promises.push(promise);
        }
           
        return Promise.all(promises);
    })
}