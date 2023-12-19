import dotenv from 'dotenv'
import postgrestService from './services/postgrest.js'
import parseLinkService from './services/parseLink.js'

const postgrestServiceObject = new postgrestService()
const parseLinkServiceObject = new parseLinkService()
dotenv.config();


postgrestServiceObject.getNotesNotEquelToParentId('50b7e22b73c24dffad6c1d246b08612b').then(async notes => {
    for (let i = 0; i < notes.length; i++) {
        try {
            const parsedLink = await parseLinkServiceObject.parseLink(notes[i].body);
            if(!parsedLink) {
                continue;
            }
            
            await postgrestServiceObject.patchNote(notes[i], parsedLink)
        } catch (error) {
            continue;
        }
        
    }
})

