import dotenv from 'dotenv'
import postgrestService from './services/postgrest.js'
import joplinService from './services/joplin.js'

const postgrestServiceObject = new postgrestService()
const joplinServiceObject = new joplinService()
dotenv.config();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

joplinServiceObject.getNotes().then(async data => {
    for (let i in data.items) {
        sleep(50).then(async() => {await joplinServiceObject.getNoteTags(data.items[i].note_id).then(async tags => {
                const tagNames = tags.items.map(item => item.title)
                postgrestServiceObject.postNote(data.items[i], tagNames).catch(err => console.log(err))
            })
        })
    }
})