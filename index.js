import dotenv from 'dotenv'
import postgrestService from './services/postgrest.js'
import joplinService from './services/joplin.js'

const postgrestServiceObject = new postgrestService()
const joplinServiceObject = new joplinService()
dotenv.config();

postgrestServiceObject.deleteAllTags().then(() => {
    joplinServiceObject.getTags().then(data => {
        data.items.map(item => {
            postgrestServiceObject.postTag(item).catch(err => console.log(err))
        })
    })
})

postgrestServiceObject.deleteAllFolders().then(() => {
    joplinServiceObject.getFolders().then(data => {
        data.items.map(item => {
            postgrestServiceObject.postFolder(item).catch(err => console.log(err))
        })
    })
})

postgrestServiceObject.deleteAllNotes().then(() => {
    joplinServiceObject.getFolders().then(data => {
        data.items.map(item => {
            processFolderNotes(item.id)
        })
    }).catch(err => console.log(err))
})

function processFolderNotes(folderId, page = 1) {
    joplinServiceObject.getFolderNotes(folderId, page).then(notes => {
        notes.items.map(note => {
            joplinServiceObject.getNoteTags(note.id).then(data => {
                const tagNames = data.items.map(item => item.title)
                postgrestServiceObject.postNote(note, tagNames).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
        if(notes.has_more) {
            processFolderNotes(folderId, page + 1)
        }
    }).catch(err => console.log(err))
}