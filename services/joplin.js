import nodefetch from 'node-fetch'

class Joplin {
    async getTags () {
        const url = 'http://localhost:41184/tags?token='
        + process.env.JOPLIN_TOKEN
        const response = await nodefetch(url, {
            method: 'GET',
        })
    
        return response.json()
    }
    
    async getFolders () {
        const url = 'http://localhost:41184/folders?token='
        + process.env.JOPLIN_TOKEN
        + '&fields=user_updated_time,id,title,icon'
        const response = await nodefetch(url, {
            method: 'GET',
        })
    
        return response.json()
    }
    
    async getFolderNotes (folderId, page = 1) {
        const url = 'http://localhost:41184/folders/'
        + folderId 
        + '/notes'
        + '?token='
        + process.env.JOPLIN_TOKEN
        + '&fields=id,title,body,parent_id,created_time,order,is_todo,todo_due,todo_completed'
        + '&order_by=created_time&order_dir=DESC'
        + '&page=' + page
        const response = await nodefetch(url, {
            method: 'GET',
        })
    
        return response.json()
    }
    
    async getNoteTags (noteId) {
        const url = 'http://localhost:41184/notes/'
        + noteId
        + '/tags?token='
        + process.env.JOPLIN_TOKEN
        const response = await nodefetch(url, {
            method: 'GET',
        })
    
        return response.json()
    }
}

export default Joplin