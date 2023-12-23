import task from "./cron/delete.routine.js";
import app from "./src/app.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = false

app.listen(3000, () => {
  task.start();
  console.log("Servidor iniciado.");
});