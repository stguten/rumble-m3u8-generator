import * as cheerio from 'cheerio';

async function parsing (html) {   
    return cheerio.load(html);
}

export default parsing;