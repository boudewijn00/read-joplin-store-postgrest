import nodefetch from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import {Readability, isProbablyReaderable} from '@mozilla/readability'

class ParseLink {
  async parseLink (url) {
    
    const AbortController = globalThis.AbortController || await import('abort-controller')
    const controller = new AbortController();
    const timeout = setTimeout(() => {
	    controller.abort();
    }, 250);

    try {    
      url = new URL(url)
    
      const response = await nodefetch(url.href, {signal: controller.signal});
      const html = await response.text();

      var doc = new JSDOM(html, {
        url: url
      });

      if(!isProbablyReaderable(doc.window.document)) {
        return;
      }

      let reader = new Readability(doc.window.document);
      let result = reader.parse();

      return result;
    }

    catch (err) {      
      return;
    }

    finally {
      clearTimeout(timeout);
    }
  }
}

export default ParseLink;