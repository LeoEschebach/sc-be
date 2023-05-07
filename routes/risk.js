const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

// Sample data
const risks = [
  {
    title: "I'll learn something that I end up not needing",
    description:
      "Frequently, people learn things that they end up never using. That appears to be a waste of funds, energy and time.",
    impact: 2,
    probability: 3,
    rpn: 6,
  },
  {
    title:
      "I might not have enough money to make it through the education program",
    description:
      "If the education program lasts longer than expected, I might run out of funds.",
    impact: 2,
    probability: 3,
    rpn: 6,
  },
  {
    title:
      "I might learn something that I end up not liking enough to do as a career",
    description:
      "Before starting the education program I don't really know much about how what I learn ends up being used in a career. So, applying my acquired knowledge at work might be something that I don't like.",
    impact: 2,
    probability: 3,
    rpn: 6,
  },
];

/**
 * Get list of risks
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

  // Request all risks from database
  const risks = [];
  db.getDb()
    .db()
    .collection("risks")
    .find(filterForDecisionId)
    .forEach((riskDoc) => {
      risks.push(riskDoc);
    })
    .then((result) => {
      // Return risks data retrieved from database
      console.log(risks);
      res.status(200).json(risks);
    })
    .catch((err) => {
      // Encountered error retrieve risks. Responding to caller with server risk error code
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Get single risk
 *
 * @param id Id of risk to update
 */
router.get("/:id", (req, res, next) => {
  const riskId = req.params.id.toString();
  console.log(riskId);
  db.getDb()
    .db()
    .collection("risks")
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((riskDoc) => {
      // Return risk retrieved from database to caller
      res.status(200).json(riskDoc);
    })
    .catch((err) => {
      // Encountered error retrieve risks. Responding to caller with server risk error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Add new risk to database. Requires user to be logged in.
 *
 */
router.post("", (req, res, next) => {
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create risk in database
    console.log(req.body);
    const newRisk = {
      title: req.body.title,
      description: req.body.description,
      impact: req.body.impact,
      probability: req.body.probability,
      decisionId: new ObjectId(req.body.decisionId),
      createdAt: new Date(),
    };
    console.log(newRisk);

    // Send request to database to get risk document created in database
    db.getDb()
      .db()
      .collection("risks")
      .insertOne(newRisk)
      .then((result) => {
        // Successfully created risk in database. Respond to caller with success message and risk Id.
        console.log(result);
        res
          .status(201)
          .json({ message: "Risk added", riskId: result.insertedId });
      })
      .catch((err) => {
        // Encountered error creating a risk. Responding to caller with server risk error code.
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
      });
  }
});

/**
 * Edit existing risk. Requires logged in user
 *
 * @param id Id of risk to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update risk in database
  const updatedRisk = {
    title: req.body.title,
    description: req.body.description,
    impact: req.body.impact,
    probability: req.body.probability,
    decisionId: new ObjectId(req.body.decisionId),
    updatedAt: new Date(),
  };

  // Send request to database to get risk document updated in database
  db.getDb()
    .db()
    .collection("risks")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedRisk,
      }
    )
    .then((result) => {
      // Successfully updated risk in database. Respond to caller with success message and risk Id.
      res.status(200).json({ message: "Risk updated", riskId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a risk. Responding to caller with server risk error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a risk. Requires logged in user.
 *
 * @param id Id of risk to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get risk document deleted from database
  db.getDb()
    .db()
    .collection("risks")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted risk from database. Respond to caller with success message.
      res.status(200).json({ message: "Risk deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a risk. Responding to caller with server risk error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

module.exports = router;
