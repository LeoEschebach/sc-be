const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

/**
 * Get list of competences
 */
router.get("/", (req, res, next) => {
  // Assess filter in URL
  console.log("GET /");
  const decisionId = req.query.decisionId;
  console.log(`Query parameter decisionId: ${decisionId}`);
  let filterForDecisionId = {};
  if (decisionId) {
    // Compose filter for decision id
    filterForDecisionId = { decisionId: decisionId };
  }
  console.log(" filter: " + JSON.stringify(filterForDecisionId));

  // Request all competences from database
  console.log("Get competences");
  const competences = [];
  db.getDb()
    .db()
    .collection("competences")
    .find(filterForDecisionId)
    .forEach((competenceDoc) => {
      competences.push(competenceDoc);
    })
    .then((result) => {
      // Return competences data retrieved from database
      console.log(competences);
      res.status(200).json(competences);
    })
    .catch((err) => {
      // Encountered error retrieve competences. Responding to caller with server competence error code
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Get single competence
 *
 * @param id Id of competence to update
 */
router.get("/:id", (req, res, next) => {
  const competenceId = req.params.id.toString();
  console.log(competenceId);
  db.getDb()
    .db()
    .collection("competences")
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((competenceDoc) => {
      // Return competence retrieved from database to caller
      res.status(200).json(competenceDoc);
    })
    .catch((err) => {
      // Encountered error retrieve competences. Responding to caller with server competence error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Add new competence to database. Requires user to be logged in.
 *
 */
router.post("", (req, res, next) => {
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create competence in database
    console.log(req.body);
    const newcompetence = {
      title: req.body.title,
      description: req.body.description,
      decisionId: req.body.decisionId,
      createdAt: new Date(),
    };
    console.log(newcompetence);

    // Send request to database to get competence document created in database
    db.getDb()
      .db()
      .collection("competences")
      .insertOne(newcompetence)
      .then((result) => {
        // Successfully created competence in database. Respond to caller with success message and competence Id.
        console.log(result);
        res.status(201).json({
          message: "Competence added",
          competenceId: result.insertedId,
        });
      })
      .catch((err) => {
        // Encountered error creating a competence. Responding to caller with server competence error code.
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
      });
  }
});

/**
 * Edit existing competence. Requires logged in user
 *
 * @param id Id of competence to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update competence in database
  const updatedCompetence = {
    title: req.body.title,
    description: req.body.description,
    updatedAt: new Date(),
  };

  // Send request to database to get competence document updated in database
  db.getDb()
    .db()
    .collection("competences")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedCompetence,
      }
    )
    .then((result) => {
      // Successfully updated competence in database. Respond to caller with success message and competence Id.
      res
        .status(200)
        .json({ message: "Competence updated", competenceId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a competence. Responding to caller with server competence error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a competence. Requires logged in user.
 *
 * @param id Id of competence to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get competence document deleted from database
  db.getDb()
    .db()
    .collection("competences")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted competence from database. Respond to caller with success message.
      res.status(200).json({ message: "Competence deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a competence. Responding to caller with server competence error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

module.exports = router;
