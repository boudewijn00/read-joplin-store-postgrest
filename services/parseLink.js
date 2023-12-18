import nodefetch, { AbortError } from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import {Readability, isProbablyReaderable} from '@mozilla/readability'

class ParseLink {
  async parseLink (url) {
    
    const AbortController = globalThis.AbortController || await import('abort-controller')
    const controller = new AbortController();
    const timeout = setTimeout(() => {
	    controller.abort();
    }, 1500);

    try {    
      url = new URL(url)
    
      const response = await nodefetch(url.href, {signal: controller.signal});
      const html = await response.text();

      var doc = new JSDOM(html, {
        url: url
      });

      if(!isProbablyReaderable(doc.window.document)) {
        console.log("Not readable");
        return;
      }

      let reader = new Readability(doc.window.document);
      let result = reader.parse();

      return result;
    }

    catch (err) {
      if (err instanceof AbortError) {
        console.log(err.message);
      }
      
      return null
    }

    finally {
      clearTimeout(timeout);
    }
  }
}

export default ParseLink;