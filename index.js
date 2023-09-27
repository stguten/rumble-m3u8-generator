import task from "./cron/delete.routine.js";
import app from "./src/app.js";

app.listen(3000, () => {
  task.start();
  console.log("Servidor iniciado.");
});