import parsing from "../config/cheerio.config.js";
import http from "../config/axios.config.js";
import fs from "node:fs";
import path from "path";

async function salvarArquivo(lista) {
  const nomeLista = Date.now() + ".m3u";
  const localArquivo = path.join(path.resolve(".data/listas/"), nomeLista);

  if (lista.length < 0) return false;
  else fs.writeFileSync(localArquivo, "#EXTM3U\n");

  for (let i = 0; i < lista.length; i++) {
    fs.appendFileSync(localArquivo, lista[i].dados);
  }
  return nomeLista;
}

async function montarLista(linkCanal, lista) {
  let listSize = 0;
  let page = 1;
  console.time("Tempo de criação da lista: ");
  do {
    const html = await http.get(`${linkCanal}?page=${page++}`);
    const $ = await parsing(html.data);
    if($("h1").text() == "404 - Not found") break;

    const siteconfig = {
      length: ($("div.thumbnail__grid--item").length > 0 ? $("div.thumbnail__grid--item").length : $("li.video-listing-entry").length),
      element: ($("div.thumbnail__grid--item").length > 0 ? "div.thumbnail__grid--item" : "li.video-listing-entry"),
    }
    
    listSize = siteconfig.length;
    
    for (let i = 0; i < siteconfig.length; i++) {
      try {        
        let element = $(siteconfig.element)[i];
        const linkElement = ($("div.thumbnail__grid--item").length > 0 ? "a.videostream__link" : "a.video-item--a")
        const link = $(element).find(linkElement).attr("href").trim();

        const videoLink = await http.get(`https://rumble.com${link}`);
        const linksec = await parsing(videoLink.data);

        const codEmbed = linksec('link[type="application/json+oembed"]').attr("href").split("%2F")[4];

        const mp4 = await http.get(`https://rumble.com/embedJS/u3/?request=video&ver=2&v=${codEmbed}`);

        const title = mp4.data.title;      
        const linkFinal = mp4.data.ua.mp4[Object.keys(mp4.data.ua.mp4).reverse()[0]].url; //Verificar o porque de estar checando se existe o 720p

        lista.push({
          dados: `#EXTINF:-1 group-title="${mp4.data.author.name}",${title}\n${linkFinal}\n`,
        });      
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
    }
  } while (listSize >= 25);

  const nomeLista = await salvarArquivo(lista);
  console.timeEnd("Tempo de criação da lista: ");
  return { link: `/lista/${nomeLista}` };
}

async function verificarLink(url) {
  if (url.toLowerCase().includes("https://rumble.com/c" ) || url.toLowerCase().includes("https://rumble.com/user")) {
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

   res.status(200).send(await montarLista(channelUrl.includes("?page=") ? channelUrl.split("?")[0] : channelUrl, [])); 
}

async function baixarlista(req, res) {
  const fileName = req.params.name;
  const options = {
    root: path.resolve(".data/listas/"),
    headers: {
      "Content-Type": "audio/x-mpegurl",
      "Content-Disposition": "inline",
      "x-timestamp": Date.now(),
      "x-sent": "true",
    },
  };
  res.sendFile(fileName, options, err => err ? res.status(404).send("Arquivo não encontrado!") : "" );
}

export { gerarLista, baixarlista };
