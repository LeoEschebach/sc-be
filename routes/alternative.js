const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

/**
 * Get list of alternatives
 */
router.get("/", (req, res, next) => {
  // Assess filter in URL
  console.log("GET /");
  const decisionId = req.query.decisionId;
  console.log(`Query parameter decisionId: ${decisionId}`);
  let filterForDecisionId = {};
  if (decisionId) {
    // Compose filter for decision id
    filterForDecisionId = { decisionId: new ObjectId(decisionId) };
  }
  console.log(" filter: " + JSON.stringify(filterForDecisionId));

  // // Filter alternative
  // const alternativeId = req.query.alternativeId;
  // console.log(`Query parameter alternativeId: ${alternativeId}`);
  // let filterForAlternativeId = {};
  // if (alternativeId) {
  //   // Compose filter for alternative id
  //   filterForAlternativeId = { alternativeId: [alternativeId] };
  // }
  // console.log(" filter: " + JSON.stringify(filterForAlternativeId));

  // Request all alternatives from database
  console.log("Get alternatives");
  const alternatives = [];
  db.getDb()
    .db()
    .collection("alternatives")
    .find(filterForDecisionId)
    .forEach((alternativeDoc) => {
      alternatives.push(alternativeDoc);
    })
    .then((result) => {
      // Return alternatives data retrieved from database
      console.log(alternatives);
      res.status(200).json(alternatives);
    })
    .catch((err) => {
      // Encountered error retrieve alternatives. Responding to caller with server alternative error code
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Get single alternative
 *
 * @param id Id of alternative to update
 */
router.get("/:id", (req, res, next) => {
  const alternativeId = req.params.id.toString();
  console.log(alternativeId);
  db.getDb()
    .db()
    .collection("alternatives")
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((alternativeDoc) => {
      // Return alternative retrieved from database to caller
      res.status(200).json(alternativeDoc);
    })
    .catch((err) => {
      // Encountered error retrieve alternatives. Responding to caller with server alternative error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Add new alternative to database. Requires user to be logged in.
 *
 */
router.post("", (req, res, next) => {
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create alternative in database
    console.log(req.body);
    const newAlternative = {
      title: req.body.title,
      description: req.body.description,
      decisionId: new ObjectId(req.body.decisionId),
      consequences: req.body.consequences,
      createdAt: new Date(),
    };

    // Send request to database to get alternative document created in database
    console.log("Request to create alternative in DB");
    console.log(newAlternative);
    db.getDb()
      .db()
      .collection("alternatives")
      .insertOne(newAlternative)
      .then((result) => {
        // Successfully created alternative in database. Respond to caller with success message and alternative Id.
        console.log(`Created alternative in DB: ${JSON.stringify(result)}`);
        res.status(201).json({
          message: "Alternative added",
          alternativeId: result.insertedId,
        });
      })
      .catch((err) => {
        // Encountered error creating a alternative. Responding to caller with server alternative error code.
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
      });
  }
});

/**
 * Edit existing alternative. Requires logged in user
 *
 * @param id Id of alternative to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update alternative in database
  const updatedAlternative = {
    title: req.body.title,
    description: req.body.description,
    consequences: req.body.consequences,
    decisionId: new ObjectId(req.body.decisionId),
    updatedAt: new Date(),
  };

  // Send request to database to get alternative document updated in database
  console.log("Request to update alternative in DB: " + req.params.id);
  console.log(updatedAlternative);
  db.getDb()
    .db()
    .collection("alternatives")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedAlternative,
      }
    )
    .then((result) => {
      // Successfully updated alternative in database. Respond to caller with success message and alternative Id.
      console.log(`Updated alternative in DB: ${JSON.stringify(result)}`);
      res
        .status(200)
        .json({ message: "Alternative updated", alternativeId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a alternative. Responding to caller with server alternative error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a alternative. Requires logged in user.
 *
 * @param id Id of alternative to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get alternative document deleted from database
  db.getDb()
    .db()
    .collection("alternatives")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted alternative from database. Respond to caller with success message.
      res.status(200).json({ message: "Alternative deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a alternative. Responding to caller with server alternative error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

module.exports = router;
