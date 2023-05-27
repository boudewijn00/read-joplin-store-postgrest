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

    async postTag (item) {
        const url = process.env.POSTGREST_HOST + '/tags'
        const payload = {
            hash: item.id,
            tag: item.title,
        }
        const stringify = JSON.stringify(payload)
        const response = nodefetch(url, {
            method: 'POST',
            body: stringify,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })

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
        const url = process.env.POSTGREST_HOST + '/notes'
        const response = await nodefetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + process.env.POSTGREST_TOKEN },
        })
    
        return response
    }
}

export default Postgrest