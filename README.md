# Upload un fichier

Comment envoyer un fichier ?

Il existe plusieurs moyens de faire cela.

Nous avons plusieurs packages qui vous permettent de faire cela.

Les plus connus :
- [multer](https://www.npmjs.com/package/multer)
- [formidable](https://www.npmjs.com/package/formidable)

![trends](_doc/trend.png)
[Lien du trends](https://www.npmtrends.com/multer-vs-formidable)

Il y en a bien sûr, plein d'autres.

Mais nous allons nous concentrer sur [formidable](https://www.npmjs.com/package/formidable).

## Formidable

Il y a 3 branches, la branche du projet par défaut sera `crm`, ensuite la branche `backend` sera uniquement dédiée à la configuration de `express` & `formidable` et la branche `frontend` sera dédiée pour notre appel à l'api avec axios.

## ⚙️ Backend

```shell
npm install formidable
```

Nous allons créer un `middleware` pour la gestion de nos fichiers. Pourquoi faire un `middleware` ? 

Car nous allons juste utiliser `formidable` pour gérer les fichiers dans le reste des cas j'en ai pas besoin.

```js
// ./src/middleware/fileMiddleware.js
const fs = require("fs");
const UPLOADS = "./uploads";
const formidable = require("formidable");

const fileMiddleware = (req, res, next) => {
    // create folder if not exist
    if (!fs.existsSync(UPLOADS)) {
        // create folder
        fs.mkdirSync(UPLOADS);
    }
    // create form
    const form = new formidable.IncomingForm({
        uploadDir: UPLOADS,
        keepExtensions: true,
    });
    // parse form
    form.parse(req, (err, fields, files) => {
        // check error
        if (err) {
            // return error
            res.status(500).json({ validationErrors: [{ message: err.message }] });
        } else {
            // else add fields to req.body & files to req.files
            req.body = fields;
            req.files = files;
            next();
        }
    });
};

module.exports = fileMiddleware;
```

Une fois le `middleware` créé, nous allons l'ajouter à notre notre route.

```js
// .src/routes/index.js
const router = require("express").Router();
const fileMiddleware = require("../middleware/fileMiddleware");

router.post("/add", fileMiddleware, (req, res) => {
    res.status(200).json({ success: true, message: "add done" });
});

module.exports = router;
```

Nous allons tester si l'upload fonctionne avec `postman`.

![postman](_doc/add.png)
⚠️ Pour le screenshot j'ai du décocher la ligne du milieu.
Mais pour le bien du test, il faut bien sûr l'activer.

Notre `Backend` à l'air de bien fonctionner.

### ./src/router/index.js

```js
const router = require("express").Router();
const fileMiddleware = require("../middleware/fileMiddleware");

router.post("/add", fileMiddleware, (req, res) => {
  /**
   * Ici, nous allons simplement ajouter un fichier dans le dossier uploads
   * et retourner un message de succès.
   *
   * Dans la vrai vie, on va sauvegarder le nom du fichier dans la bdd.
   * Le nom du fichier ce trouve ici : req.files.{file}.newFilename
   *
   * {file} est le nom qu'on lui donne dans le frontend, il peut avoir d'autre nom selon comment vous l'appelez.
   */
  res.status(200).json({
    success: true,
    message: `${req.files.file.newFilename} add to upload directory`,
  });
});

module.exports = router;
```

### ./src/middleware/fileMiddleware.js

```js
// ./src/middleware/fileMiddleware.js
const fs = require("fs");
const UPLOADS = "./uploads";
const formidable = require("formidable");

const fileMiddleware = (req, res, next) => {
  // create folder if not exist
  if (!fs.existsSync(UPLOADS)) {
    // create folder
    fs.mkdirSync(UPLOADS);
  }
  // create form
  const form = new formidable.IncomingForm({
    uploadDir: UPLOADS,
    keepExtensions: true,
  });
  // parse form
  form.parse(req, (err, fields, files) => {
    // check error
    if (err) {
      // return error
      res.status(500).json({ validationErrors: [{ message: err.message }] });
    } else {
      // else add fields to req.body & files to req.files
      req.body = fields;
      req.files = files;
      next();
    }
  });
};

module.exports = fileMiddleware;
```

### ./src/app.js

```js
// ./src/app.js
// j'ajoute juste les cors avec le frontend comme origin
app.use(
    cors({
        origin: "http://localhost:3000",
    })
);

```

## 🖥 Frontend

Le frontend est pas mal avancé, mais pas fini. Nous allons du coup créer la logique pour l'upload.

Sur le fichier `./src/components/Form.jsx` nous allons ajouter des `states` et utiliser notre `api`.

```js
// .src/components/Form.jsx
/**
 * ici, je créer un state pour mon file, et un state pour mon filename
 */
const [file, setFile] = useState(null);
const [filename, setFilename] = useState("file not found");
```

Pourquoi faire ça ?

Car nous allons garder notre ficher de coté pour l'envoyer sur notre `backend`, et le `filename` est le nom du fichier qui sera affiché sur mon `frontend`.

Ensuite, nous allons faire une fonction pour récupérer le fichier.

```js
  const handleSaveImage = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
};
```

Ensuite, on modifie le fichier `Form.jsx`.

```js
<div className="flex text-sm text-gray-600">
  <label
    htmlFor="file-upload"
    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
  >
    <span>Upload a file</span>
    <input
      id="file-upload"
      name="file-upload"
      type="file"
      className="sr-only"
      onChange={handleSaveImage}
    />
  </label>
  <p className="pl-1">{filename}</p>
</div>
```

Et pour finir, on va avoir l'élément le plus important : le submit ! 

```js
  const handleSubmit = (e) => {
    e.preventDefault();

    if (file) {
        // doc: https://developer.mozilla.org/fr/docs/Web/API/FormData
        /**
         * Ici, nous allons créer un `FormData` pour envoyer le fichier sur notre `backend`
         */
        const formData = new FormData();
        //doc: https://developer.mozilla.org/fr/docs/Web/API/FormData/append
        formData.append("file", file);

        // api provient de ./src/services/api.js qui utilise axios
        // Dont la baseUrl est définie vers notre backend..
        api
            .post("/files/add", formData)
            .then((res) => {
                console.log(res.data);
                setFile(null);
                setFilename("file not found");
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        alert("Please select a file");
    }
};
```

# Et voilà ! Le frontend est fini.
