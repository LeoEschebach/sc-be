const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

// Sample data
const objectives = [
  {
    title: "Become financially independent through my career",
    description:
      "It is not quite clear to me what kind of costs I will encounter later in my life. My education provides me the means to get a job that pays sufficiently so that I can handle even bigger expenses throughout my life.",
    decisionId: new ObjectId("6409d056bad5bc13ba316b51"),
    problemId: new ObjectId("64262636271b8e43385ac04b"),
  },
  {
    title:
      "Be satisfied with the work I end up doing applying knowledge I acquired during my education",
    description:
      "Once I have my education, I want to apply it at work. That work must be fulfilling. I don't want to drag myself through each work day!",
    decisionId: new ObjectId("6409d056bad5bc13ba316b51"),
    problemId: new ObjectId("64262636271b8e43385ac04b"),
  },
  {
    title:
      "Have a sufficient number of job opportunities even if the job markets get tough",
    description:
      "When the job market gets tough, those with the least qualifications are let go earlier than those with better ones. I want to be among the ones who are indispensable at my job.",
    decisionId: new ObjectId("6409d056bad5bc13ba316b51"),
    problemId: new ObjectId("64262636271b8e43385ac04b"),
  },
];

/**
 * Get list of objectives
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

  // syntaxHighlight(req);
  // const decisionId = req.query.decisionId;
  // console.log(`Get objectives for decisionId: ${decisionId}`);

  // Request all objectives from database
  const objectives = [];
  db.getDb()
    .db()
    .collection("objectives")
    .find(filterForDecisionId)
    .forEach((objectiveDoc) => {
      objectives.push(objectiveDoc);
    })
    .then((result) => {
      // Return objectives data retrieved from database
      console.log("Objectives retrieved from DB:");
      console.log(objectives);
      res.status(200).json(objectives);
    })
    .catch((err) => {
      // Encountered error retrieve objectives. Responding to caller with server objective error code
      console.log(err);
      res.status(500).json({ message: "An error occurred getting objectives" });
    });
});

/**
 * Get single objective
 *
 * @param id Id of objective to update
 */
router.get("/:id", (req, res, next) => {
  const objectiveId = req.params.id.toString();
  console.log(objectiveId);
  db.getDb()
    .db()
    .collection("objectives")
    .findOne({ _id: new ObjectId(req.params.id) })
    .then((objectiveDoc) => {
      // Return objective retrieved from database to caller
      res.status(200).json(objectiveDoc);
    })
    .catch((err) => {
      // Encountered error retrieve objectives. Responding to caller with server objective error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Add new objective to database. Requires user to be logged in
 *
 */
router.post("", (req, res, next) => {
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create objective in database
    console.log(req.body);
    const newObjective = {
      title: req.body.title,
      description: req.body.description,
      decisionId: new ObjectId(req.body.decisionId),
      problemId: new ObjectId(req.body.problemId),
      createdAt: new Date(),
    };
    console.log(newObjective);

    // Send request to database to get objective document created in database
    db.getDb()
      .db()
      .collection("objectives")
      .insertOne(newObjective)
      .then((result) => {
        // Successfully created objective in database. Respond to caller with success message and objective Id.
        console.log(result);
        res
          .status(201)
          .json({ message: "Objective added", objectiveId: result.insertedId });
      })
      .catch((err) => {
        // Encountered error creating a objective. Responding to caller with server objective error code.
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
      });
  }
});

/**
 * Edit existing objective. Requires logged in user
 *
 * @param id Id of objective to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update objective in database
  const updatedObjective = {
    title: req.body.title,
    description: req.body.description,
    decisionId: new ObjectId(req.body.decisionId),
    problemId: new ObjectId(req.body.problemId),
    updatedAt: new Date(),
  };

  // Send request to database to get objective document updated in database
  db.getDb()
    .db()
    .collection("objectives")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedObjective,
      }
    )
    .then((result) => {
      // Successfully updated objective in database. Respond to caller with success message and objective Id.
      res
        .status(200)
        .json({ message: "Objective updated", objectiveId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a objective. Responding to caller with server objective error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a objective. Requires logged in user.
 *
 * @param id Id of objective to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get objective document deleted from database
  db.getDb()
    .db()
    .collection("objectives")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted objective from database. Respond to caller with success message.
      res.status(200).json({ message: "Objective deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a objective. Responding to caller with server objective error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

module.exports = router;
