const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

/**
 * Get list of consequences
 */
router.get("/", (req, res, next) => {
  // Assess filter in URL
  console.log("Consequences GET /");
  const decisionId = req.query.decisionId;
  console.log(`Query parameter decisionId: ${decisionId}`);
  let filterForDecisionId = {};
  if (decisionId) {
    // Compose filter for decision id
    filterForDecisionId = { decisionId: new ObjectId(decisionId) };
  }
  console.log(" filter: " + JSON.stringify(filterForDecisionId));

  // Request all consequences from database
  console.log("Get consequences");
  const consequences = [];
  db.getDb()
    .db()
    .collection("consequences")
    .find(filterForDecisionId)
    .forEach((consequenceDoc) => {
      consequences.push(consequenceDoc);
    })
    .then((result) => {
      // Return consequences data retrieved from database
      console.log(consequences);
      res.status(200).json(consequences);
    })
    .catch((err) => {
      // Encountered error retrieve consequences. Responding to caller with server consequence error code
      console.log(err);
      res.status(500).json({ message: `An error occurred. ${err}` });
    });
});

/**
 * Get single consequence
 *
 * @param id Id of consequence to update
 */
router.get("/:id", (req, res, next) => {
  console.log("Consequences GET /<id>");
  const consequenceId = req.params.id.toString();
  console.log(consequenceId);
  db.getDb()
    .db()
    .collection("consequences")
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((consequenceDoc) => {
      // Return consequence retrieved from database to caller
      res.status(200).json(consequenceDoc);
    })
    .catch((err) => {
      // Encountered error retrieve consequences. Responding to caller with server consequence error code.
      console.log(err);
      res.status(500).json({ message: `An error occurred. ${err}` });
    });
});

/**
 * Add new consequence to database. Requires user to be logged in.
 *
 */
router.post("", (req, res, next) => {
  console.log("Consequences POST /");
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create consequence in database
    console.log(req.body);
    const newconsequence = {
      decisionId: new ObjectId(req.body.decisionId),
      description: req.body.description,
      altId: new ObjectId(req.body.altId),
      objId: new ObjectId(req.body.objId),
      createdAt: new Date(),
    };

    // Send request to database to get consequence document created in database
    console.log("Request to create new consequence:");
    console.log(newconsequence);
    db.getDb()
      .db()
      .collection("consequences")
      .insertOne(newconsequence)
      .then((result) => {
        // Successfully created consequence in database. Respond to caller with success message and consequence Id.
        console.log(`Created consequence in DB: ${JSON.stringify(result)}`);
        res.status(201).json({
          message: "Consequence added",
          consequenceId: result.insertedId,
        });
      })
      .catch((err) => {
        // Encountered error creating a consequence. Responding to caller with server consequence error code.
        console.log(err);
        res.status(500).json({ message: `An error occurred. ${err}` });
      });
  }
});

/**
 * Edit existing consequence. Requires logged in user
 *
 * @param id Id of consequence to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update consequence in database
  console.log("Consequences PATCH /<id>");
  const updatedConsequence = {
    _id: new ObjectId(req.body._id),
    decisionId: new ObjectId(req.body.decisionId),
    description: req.body.description,
    altId: new ObjectId(req.body.altId),
    objId: new ObjectId(req.body.objId),
    updatedAt: new Date(),
  };

  // Send request to database to get consequence document updated in database
  console.log("Request to update consequence in DB: " + req.params.id);
  console.log(updatedConsequence);
  db.getDb()
    .db()
    .collection("consequences")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedConsequence,
      }
    )
    .then((result) => {
      // Successfully updated consequence in database. Respond to caller with success message and consequence Id.
      console.log(`Updated consequence in DB: ${JSON.stringify(result)}`);
      res
        .status(200)
        .json({ message: "Consequence updated", consequenceId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a consequence. Responding to caller with server consequence error code.
      console.log(err);
      res.status(500).json({ message: `An error occurred. ${err}` });
    });
});

/**
 * Delete a consequence. Requires logged in user.
 *
 * @param id Id of consequence to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get consequence document deleted from database
  console.log("Consequences DELETE /<id>");
  db.getDb()
    .db()
    .collection("consequences")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted consequence from database. Respond to caller with success message.
      res.status(200).json({ message: "Consequence deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a consequence. Responding to caller with server consequence error code.
      console.log(err);
      res.status(500).json({ message: `An error occurred. ${err}` });
    });
});

module.exports = router;
