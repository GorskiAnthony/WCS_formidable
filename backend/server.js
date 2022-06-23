const app = require("./src/app");
const PORT = 5500;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Server is listening on http://localhost:${PORT}`);
});
