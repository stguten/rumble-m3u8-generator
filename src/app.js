import express from "express";
import path from "path";
import app from "./config/express.config.js";
import { gerarLista } from "./controller/lista.controller.js";

const publicDir = path.join(process.cwd(), "public");

app.use("/gerar-lista",gerarLista);
app.use("/lista", express.static(path.resolve(".data/listas/"),{extensions: ['m3u8']}));
app.use("/", express.static(publicDir));

app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(publicDir, "404.html"));
});

app.use((err, req, res, next) => {
  res.status(500).sendFile(path.join(publicDir, "500.html"));
});

export default app;
