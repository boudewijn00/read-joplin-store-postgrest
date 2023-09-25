import nodefetch from 'node-fetch'

class Postgrest {
    async postNote (note, tagNames) {
        const url = process.env.POSTGREST_HOST + '/notes'
        const payload = {
            note_id: note.id,
            title: note.title,
            body: note.body,
            parent_id: note.parent_id,
            created_time: note.created_time,
            order_id: note.order,
            tags: tagNames ? tagNames : [],
            is_todo: note.is_todo,
            todo_due: note.todo_due,
            todo_completed: note.todo_completed,
        }
        const stringify = JSON.stringify(payload)
        console.log('Posting note ' + note.id)
        const response = await nodefetch(url, {
            method: 'POST',
            body: stringify,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        }).catch(err => console.log('Post note failed ' + stringify))

        return response
    }

    async postTag (item) {
        console.log('Posting tag ' + item.id)
        const url = process.env.POSTGREST_HOST + '/tags'
        const payload = {
            tag_id: item.id,
            tag: item.title,
        }
        const stringify = JSON.stringify(payload)
        const response = await nodefetch(url, {
            method: 'POST',
            body: stringify,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
        console.log('Posted tag ' + item.id)

        return response
    }

    async postFolder (item) {
        console.log('Posting folder ' + item.id)
        const url = process.env.POSTGREST_HOST + '/folders'
        const payload = {
            folder_id: item.id,
            title: item.title,
            icon: item.icon,
            user_updated_time: item.user_updated_time,
        }
        const stringify = JSON.stringify(payload)
        const response = await nodefetch(url, {
            method: 'POST',
            body: stringify,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
        console.log('Posted folder ' + item.id)

        return response
    }

    async postResource (item, resource) {
        console.log('Posting resource ' + item.id)
        const url = process.env.POSTGREST_HOST + '/resources'
        
        const headers = resource.headers.raw();
        const buffer = await resource.buffer();

        const payload = {
            resource_id: item.id,
            title: item.title,
            contents: buffer.toString('base64'),
            mime: headers['content-type'][0],
        }
        const stringify = JSON.stringify(payload)
        const response = await nodefetch(url, {
            method: 'POST',
            body: stringify,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
        console.log('Posted resource ' + item.id)

        return response
    }

    async deleteAll(){
        let promises = [];
        promises.push(new Promise(async (resolve, reject) => {
            await this.deleteAllFolders()
            resolve()
        }), new Promise(async (resolve, reject) => {
            await this.deleteAllTags()
            resolve()
        }), new Promise(async (resolve, reject) => {
            await this.deleteAllNotes()
            resolve()
        }), new Promise(async (resolve, reject) => {
            await this.deleteAllResources()
            resolve()
        }));
            
        return Promise.all(promises);
    }

    async deleteAllFolders () {
        console.log('Deleting all folders')
        const url = process.env.POSTGREST_HOST + '/folders'
        const response = await nodefetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
        console.log('Deleted all folders')

        return response
    }

    async deleteAllTags () {
        const url = process.env.POSTGREST_HOST + '/tags'
        const response = await nodefetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
    
        return response
    }
    
    async deleteAllNotes () {
        console.log('Deleting all notes')
        const url = process.env.POSTGREST_HOST + '/notes'
        const response = await nodefetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
        console.log('Deleted all notes')
    
        return response
    }

    async deleteAllResources () {
        const url = process.env.POSTGREST_HOST + '/resources'
        const response = await nodefetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
    }
}

export default Postgrest