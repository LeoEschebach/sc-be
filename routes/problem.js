const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const ObjectId = mongodb.ObjectId;

const router = Router();

// Sample data
const problems = [
  {
    _id: "fasdlk1j",
    title: "I don't have a solid education",
    description:
      "Getting a solid education requires quite some grit and motivation, which I haven't had.",
    decisionId: "6403673a8c5176832399da89",
  },
  {
    _id: "fasdlk1j2",
    title: "Going to college is usually quite expensive",
    description:
      "Is it worth it to invest funds into a college education or into something else. You hear so many stories about student loan problems.",
    decisionId: "6403673a8c5176832399da89",
  },
  {
    _id: "ertert3",
    title: "Getting a lower salary with a lower education throughout career",
    description:
      "Not having a solid education might just have side effects throughout my career. Initial salary might be lower compared to the one I'd get if I had a more solid education. During layoff rounts I might be among the first ones to be let go. Etc.",
    decisionId: "6403673a8c5176832399da89",
  },
];

/**
 * Get list of problems
 */
router.get("/", (req, res, next) => {
  console.log("GET /");

  // Assess filter in URL
  const decisionId = req.query.decisionId;
  // console.log(`Query parameter: ${JSON.stringify(req.query, 0, 2)}`);
  console.log(`Query parameter decisionId: ${decisionId}`);
  let filterForDecisionId = {};
  if (decisionId) {
    // Compose filter for decision id
    filterForDecisionId = { decisionId: decisionId };
  }
  console.log(" filter: " + JSON.stringify(filterForDecisionId));

  // Request all problems from database
  const problems = [];
  db.getDb()
    .db()
    .collection("problems")
    .find(filterForDecisionId)
    .forEach((problemDoc) => {
      problems.push(problemDoc);
    })
    .then((result) => {
      // .then((result) => {
      // Return problems data retrieved from database
      console.log("Problems retrieved from DB:");
      console.log(problems);
      res.status(200).json(problems);
    })
    .catch((err) => {
      // Encountered error retrieve problems. Responding to caller with server problem error code
      console.log(err);
      res.status(500).json({ message: "An error occurred getting problems" });
    });
});

/**
 * Retrieve problem from database
 *
 * @param {*} problemId Id of problem to be retrieved
 */
const getProblem = async (problemId) => {
  let problem;
  db.getDb()
    .db()
    .collection("problems")
    .findOne({ _id: new ObjectId(problemId) })
    .then((problemDoc) => {
      // Return problem retrieved from database to caller
      console.log("In getProblem then(): " + problemDoc.toString());
      return problem;
    })
    .catch((err) => {
      // Encountered error retrieve problems. Responding to caller with server problem error code.
      console.log(err);
      throw new Error(`Trouble retrieve problem with id $problemId`);
    });
};

/**
 * Get single problem
 *
 * @param id Id of problem to update
 */
router.get("/:id", (req, res, next) => {
  const problemId = req.params.id.toString();
  console.log(problemId);
  getProblem(problemId)
    .then((problemDoc) => {
      // Return problem retrieved from database to caller
      console.log("In then(): " + problemDoc);

      res.status(200).json(problemDoc);
    })
    .catch((err) => {
      // Encountered error retrieve problems. Responding to caller with server problem error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });

  // db.getDb()
  //   .db()
  //   .collection("problems")
  //   .findOne({ _id: new ObjectId(req.params.id) })
  //   .then((problemDoc) => {
  //     // Return problem retrieved from database to caller
  //     res.status(200).json(problemDoc);
  //   })
  //   .catch((err) => {
  //     // Encountered error retrieve problems. Responding to caller with server problem error code.
  //     console.log(err);
  //     res.status(500).json({ message: "An error occurred." });
  //   });
});

/**
 * Add new problem to database. Requires user to be logged in
 *
 */
router.post("", (req, res, next) => {
  // Ensure that fields are proper
  if (!req.body.decisionId) {
    res.status(400).json({ message: "decisionId not provided" });
  } else {
    // Creating object to be used to create problem in database
    console.log(req.body);
    const newProblem = {
      title: req.body.title,
      description: req.body.description,
      decisionId: new ObjectId(req.body.decisionId),
      createdAt: new Date(),
    };

    // Send request to database to get problem document created in database
    console.log("Request to create problem in DB");
    console.log(newProblem);
    db.getDb()
      .db()
      .collection("problems")
      .insertOne(newProblem)
      .then((result) => {
        // Successfully created problem in database. Respond to caller with success message and problem Id.
        console.log(result);
        res
          .status(201)
          .json({ message: "Problem added", problemId: result.insertedId });
      })
      .catch((err) => {
        // Encountered error creating a problem. Responding to caller with server problem error code.
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
      });
  }
});

/**
 * Edit existing problem. Requires logged in user
 *
 * @param id Id of problem to update
 */
router.patch("/:id", (req, res, next) => {
  // Creating object to be used to update problem in database
  const updatedProblem = {
    title: req.body.title,
    description: req.body.description,
    decisionId: new ObjectId(req.body.decisionId),
    updatedAt: new Date(),
  };

  // Send request to database to get problem document updated in database
  console.log("Request to update problem in DB: " + req.params.id);
  console.log(updatedProblem);
  db.getDb()
    .db()
    .collection("problems")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedProblem,
      }
    )
    .then((result) => {
      // Successfully updated problem in database. Respond to caller with success message and problem Id.
      res
        .status(200)
        .json({ message: "Problem updated", problemId: req.params.id });
    })
    .catch((err) => {
      // Encountered error to update a problem. Responding to caller with server problem error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a problem. Requires logged in user.
 *
 * @param id Id of problem to delete
 */
router.delete("/:id", (req, res, next) => {
  // Send request to database to get problem document deleted from database
  db.getDb()
    .db()
    .collection("problems")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      // Successfully deleted problem from database. Respond to caller with success message.
      res.status(200).json({ message: "Problem deleted" });
    })
    .catch((err) => {
      // Encountered error to delete a problem. Responding to caller with server problem error code.
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

module.exports = router;
