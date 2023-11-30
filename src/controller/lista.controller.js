import parsing from "../config/cheerio.config.js";
import axios from "axios";
import * as fs from "fs";
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
  let listSize = [];
  let page = 1;

  do {
    const html = await axios.get(`${linkCanal}?page=${page++}`);
    const $ = await parsing(html.data);
    listSize = $("li.video-listing-entry").length;

    for (let i = 0; i < $("li.video-listing-entry").length; i++) {
      let element = $("li.video-listing-entry")[i];

      const title = $(element).find("h3.video-item--title").text();
      const link = $(element).find("a.video-item--a").attr("href");

      const videoLink = await axios.get(`https://rumble.com/${link.split("-")[0]}`).data;

      const linksec = await parsing(videoLink);

      const codEmbed = linksec('link[type="application/json+oembed"]').attr("href").split("%2F")[4];

      const mp4 = await axios.get(`https://rumble.com/embedJS/u3/?request=video&ver=2&v=${codEmbed}`);

      const linkFinal = mp4.data.u.mp4.url;

      lista.push({
        titulo: title,
        dados: `#EXTINF:-1 group-title="${title.split("E")[0].trim()}",${title}\n${linkFinal}\n`,
      });
    }
  } while (listSize >= 25);

  const nomeLista = await salvarArquivo(lista);
  return { link: `/lista/${nomeLista}` };
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

  res
    .status(200)
    .send(
      await montarLista(
        channelUrl.includes("?page=") ? channelUrl.split("?")[0] : channelUrl,
        []
      )
    );
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
  res.sendFile(fileName, options, (err) => {
    if (err) {
      res.status(404).send("Arquivo não encontrado!");
    }
  });
}
export { gerarLista, baixarlista };
