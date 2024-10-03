import axios from "axios";

const initOptions = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
}

Object.assign(initOptions, process.env.PROXY_USE ? {
  proxy: {
    protocol: "http",
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
  }
} : {});

const http = axios.create(initOptions);

export default http;
