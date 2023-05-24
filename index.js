import dotenv from 'dotenv'
import nodefetch from 'node-fetch'

// get params from command line and put in associative array
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=')
    acc[key] = value
    return acc
}, {})

dotenv.config();

const getFolders = async () => {
    const url = 'http://localhost:41184/folders?token='
    + process.env.JOPLIN_TOKEN
    const response = await nodefetch(url, {
        method: 'GET',
    })

    return response.json()
}

const getNotes = async (page) => {
    const url = 'http://localhost:41184/notes?has_more=true&token='
    + process.env.JOPLIN_TOKEN
    + '&page='
    + page
    + '&fields=id,title,body,parent_id,created_time,order'
    const response = await nodefetch(url, {
        method: 'GET',
    })

    return response.json()
}

const getFolderNotes = async (folderId) => {
    const url = 'http://localhost:41184/folders/'
    + folderId 
    + '/notes'
    + '?token='
    + process.env.JOPLIN_TOKEN
    + '&fields=id,title,body,parent_id,created_time,order'
    const response = await nodefetch(url, {
        method: 'GET',
    })

    return response.json()
}

const getNoteTags = async (noteId) => {
    const url = 'http://localhost:41184/notes/'
    + noteId
    + '/tags?token='
    + process.env.JOPLIN_TOKEN
    const response = await nodefetch(url, {
        method: 'GET',
    })

    return response.json()
}

const postNote = async (note, tagNames) => {
    const url = 'http://localhost:8000/notes'
    const payload = {
        note_id: note.id,
        title: note.title,
        body: note.body,
        parent_id: note.parent_id,
        created_time: note.created_time,
        order_id: note.order,
        tags: tagNames ? tagNames : []
    }
    const stringify = JSON.stringify(payload)
    const response = await nodefetch(url, {
        method: 'POST',
        body: stringify,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
    })
    
    return response
}

getFolders().then(data => {
    data.items.map(item => {
        getFolderNotes(item.id).then(notes => {
            notes.items.map(note => {
                getNoteTags(note.id).then(data => {
                    const tagNames = data.items.map(item => item.title)
                    postNote(note, tagNames).catch(error => {
                        console.error(error, item.title)
                    }) 
                })
            })
        })
    })
})

/*getNotes(args['--page'] ? args['--page'] : 0).then(data => data.items.map(item => {
    const tags = getNoteTags(item.id).then(data => {
        const tagNames = data.items.map(item => item.title)
        if(tagNames.length > 0) console.log(item.title, tagNames)
    })
}))*/