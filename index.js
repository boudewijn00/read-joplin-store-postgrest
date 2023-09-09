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
    postgrestServiceObject.deleteAllTags().then(() => {
        joplinServiceObject.getTags().then(data => {
            data.items.map(item => {
                postgrestServiceObject.postTag(item).catch(err => console.log(err))
            })
        })
    })
}

async function processFolders () {
    console.log('Processing folders...')
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
    postgrestServiceObject.deleteAllNotes().then(() => {
        joplinServiceObject.getFolders().then(data => {
            data.items.map(item => {
                sleep(100).then(() => processFolderNotes(item.id))
            })
        }).catch(err => console.log(err))
    })
}

async function processFolderNotes(folderId, page = 1) {
    console.log('Processing notes for folder ' + folderId + ' page ' + page)
    joplinServiceObject.getFolderNotes(folderId, page).then(notes => {
        notes.items.map(note => {
            joplinServiceObject.getNoteTags(note.id).then(data => {
                const tagNames = data.items.map(item => item.title)
                postgrestServiceObject.postNote(note, tagNames).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
        
        return notes
    }).then(notes => {
        console.log('finished processing notes for folder ' + folderId + ' page ' + page)
        if (notes.has_more) {
            processFolderNotes(folderId, page + 1)
        }
    }).catch(err => console.log(err))
}

async function processResource () {
    console.log('Processing resources...')
    postgrestServiceObject.deleteAllResources().then(() => {
        joplinServiceObject.getResources().then(data => {
            console.log(data)
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

processTags().then(() => processFolders().then(() => processNotes())).then(() => processResource())