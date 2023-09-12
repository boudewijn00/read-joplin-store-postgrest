import dotenv from 'dotenv'
import postgrestService from './services/postgrest.js'
import joplinService from './services/joplin.js'

const postgrestServiceObject = new postgrestService()
const joplinServiceObject = new joplinService()
dotenv.config();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processTags () {
    console.log('Processing tags...')
    return await postgrestServiceObject.deleteAllTags().then(async () => {
        await joplinServiceObject.getTags().then(async data => {
            for (let i in data.items) {
                await postgrestServiceObject.postTag(data.items[i]).catch(err => console.log(err))
            }
        })
    })
}

async function processFolders () {
    console.log('Processing folders...')
    return await postgrestServiceObject.deleteAllFolders().then(async () => {
        await joplinServiceObject.getFolders().then(async data => {
            for (let i in data.items) {
                await postgrestServiceObject.postFolder(data.items[i]).catch(err => console.log(err))
            }
        })
    })
}

async function processNotes () {
    console.log('Processing notes...')
    return postgrestServiceObject.deleteAllNotes().then(async () => {
        console.log('Deleted all notes')
        await joplinServiceObject.getFolders().then(data => {
            console.log('Processing ' + data.items.length + ' folders')
            let promises = [];
            for (let i in data.items){
                let promise = new Promise(async (resolve, reject) => {
                    await processFolderNotes(data.items[i].id)
                    resolve()
                })
                promises.push(promise);
            }

            return Promise.all(promises);
        }).catch(err => console.log(err))
    })
}

async function processFolderNotes(folderId, page = 1) {
    console.log('Processing folder ' + folderId + ' page ' + page)
    await joplinServiceObject.getFolderNotes(folderId, page).then(async notes => {
        for (let i in notes.items) {
            await joplinServiceObject.getNoteTags(notes.items[i].id).then(async data => {
                const tagNames = data.items.map(item => notes.items[i].title)
                await postgrestServiceObject.postNote(notes.items[i], tagNames).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }
        
        return notes
    }).then(async notes => {
        if (notes.has_more) {
            await processFolderNotes(folderId, page + 1)
        }
    }).catch(err => console.log(err))
}

async function processResources () {
    console.log('Processing resources...')
    postgrestServiceObject.deleteAllResources().then(() => {
        joplinServiceObject.getResources().then(async data => {
            for (let i in data.items) {
                await joplinServiceObject.getResource(data.items[i].id).then(async resource => {
                    await postgrestServiceObject.postResource(data.items[i], resource).catch(err => console.log(err))
                })
            }
        })
    }).then(() => {
        console.log('Finished processing resources')
    })
}

processTags().then(() => {
    processFolders().then(() => {
        processNotes().then(() => {
            processResources()
        })
    })
})
