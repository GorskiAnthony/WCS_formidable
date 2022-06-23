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
