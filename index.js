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
    postgrestServiceObject.deleteAllTags().then(() => {
        joplinServiceObject.getTags().then(data => {
            data.items.map(item => {
                postgrestServiceObject.postTag(item).catch(err => console.log(err))
            })
        })
    })
}

async function processFolders () {
    postgrestServiceObject.deleteAllFolders().then(() => {
        joplinServiceObject.getFolders().then(data => {
            data.items.map(item => {
                postgrestServiceObject.postFolder(item).catch(err => console.log(err))
            })
        })
    })
}

async function processNotes () {
    console.log('Processing notes...')
    return postgrestServiceObject.deleteAllNotes().then(() => {
        console.log('Deleted all notes')
        return joplinServiceObject.getFolders().then(data => {
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
    return joplinServiceObject.getFolderNotes(folderId, page).then(notes => {
        notes.items.map(note => {
            joplinServiceObject.getNoteTags(note.id).then(data => {
                const tagNames = data.items.map(item => item.title)
                postgrestServiceObject.postNote(note, tagNames).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
        
        return notes
    }).then(async notes => {
        if (notes.has_more) {
            await processFolderNotes(folderId, page + 1)
        }
    }).catch(err => console.log(err))
}

async function processResource () {
    console.log('Processing resources...')
    postgrestServiceObject.deleteAllResources().then(() => {
        joplinServiceObject.getResources().then(data => {
            data.items.map(item => {
                joplinServiceObject.getResource(item.id).then(resource => {
                    postgrestServiceObject.postResource(item, resource).catch(err => console.log(err))
                })
            })
        })
    }).then(() => {
        console.log('Finished processing resources')
    })
}

processNotes().then(() => {
    console.log('Finished processing notes')
})