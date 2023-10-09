import parsing from "../config/cheerio.config.js";
import axios from 'axios';
import * as fs from 'fs';
import md5 from "md5";
import path from 'path';

async function salvarArquivo(lista) {
  const nomeLista = Date.now() + ".m3u8";
  const localArquivo = path.join(path.resolve(".data/listas/"), nomeLista);

  if(lista.length < 0) return false;
  else fs.writeFileSync(localArquivo,"#EXTM3U\n\n")

  for(let i=0; i< lista.length; i++){
    fs.appendFileSync(localArquivo,lista[i].dados);
  }
  return nomeLista;
}

async function montarLista(linkCanal, lista) {
  let listSize = [];   
  let i = 1;

  do {   
    const html = await axios.get(`${linkCanal}?page=${i++}`);
    const $ = await parsing(html.data);
    listSize = $("li.video-listing-entry").length;

    for (let i = 0; i < $("li.video-listing-entry").length; i++) {
      let element = $("li.video-listing-entry")[i];

      const title = $(element).find("h3.video-item--title").text();
      const link = $(element).find("a.video-item--a").attr("href");

      const videoLink = await axios.get(`https://rumble.com/${link.split("-")[0]}`);
      
      const linksec = await parsing(videoLink.data);

      const codEmbed = linksec('link[type="application/json+oembed"]').attr("href").split("%2F")[4];

      const mp4 = await axios.get(`https://rumble.com/embedJS/u3/?request=video&ver=2&v=${codEmbed}`);
      
      const linkFinal = mp4.data.u.mp4.url;

      lista.push({titulo: title,dados: `#EXTINF:0 group-title="${title.split("E")[0].trim()}",${title}\n${linkFinal}\n\n`});   
      
    }

  } while (listSize >= 25);

  const nomeLista = await salvarArquivo(lista);
  return {link: `/lista/${nomeLista}`};
}

async function verificarLink(url) {
  if (url.toLowerCase().includes("https://rumble.com/c")) {
    return true;
  } else {
    return false;
  }
}

async function gerarLista(req, res) {
  const channelUrl = req.query.channel;
  if (verificarLink(channelUrl) == false) {
    res.status(400).send("Link Invalido!");
    return;
  }
  if(channelUrl.includes("?pages=")) channelUrl.split("?")[0]

  res.status(200).send(await montarLista(channelUrl, []));

}

export { gerarLista };
