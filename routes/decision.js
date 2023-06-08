const Router = require("express").Router;
const mongodb = require("mongodb");

const db = require("../db");

const Decimal128 = mongodb.Decimal128;
const ObjectId = mongodb.ObjectId;

const router = Router();

const decisions = [
  {
    _id: "fasdlk1j",
    title: "Going to college or not?",
    description:
      "Not sure whether I should go to college or rather start working right away",
    status: "Not started",
  },
  {
    _id: "fasdlk1j2",
    title: "Means for getting around",
    description:
      "I could try to buy a car, but then I would have to shell out the cash and also pay ongoing cost. Might be better to use a bike instead.",
    status: "Started",
  },
  {
    _id: "ertert3",
    title: "Buying a house",
    description: "Should we buy a house or stay in an appartment?",
    status: "Completed",
  },
];

/**
 * Get list of decisions
 */
router.get("/", (req, res, next) => {
  const queryPage = req.query.page;
  const pageSize = 1;
  // let resultProducts = [...products];
  // if (queryPage) {
  //   resultProducts = products.slice(
  //     (queryPage - 1) * pageSize,
  //     queryPage * pageSize
  //   );
  // }
  const queryParameter = req.query.term;
  console.log(`Query parameter: ${JSON.stringify(req.query, 0, 2)}`);

  // res.status(200).json(decisions);

  const decisions = [];
  db.getDb()
    .db()
    .collection("decisions")
    .find()
    // .sort({price: -1})
    // .skip((queryPage - 1) * pageSize)
    // .limit(pageSize)
    .forEach((decisionDoc) => {
      // decisionDoc.price = decisionDoc.price.toString();
      decisions.push(decisionDoc);
    })
    .then((result) => {
      res.status(200).json(decisions);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Get single decision
 *
 * @param id Id of decision to get
 */
router.get("/:id", (req, res, next) => {
  // syntaxHighlight(JSON.stringify(req));
  const decisionId = req.params.id.toString();
  console.log(decisionId);

  // Get decision object from db
  db.getDb()
    .db()
    .collection("decisions")
    .findOne({ _id: new ObjectId(decisionId) })
    .then((decisionDoc) => {
      // Check whether we got the decision document
      if (decisionDoc != null) {
        // Got the decision document. Turn it into a JSON and return it.
        res.status(200).json(decisionDoc);
      } else {
        // Could not find the decision object
        res.status(400).json({
          message: "Decision with id " + decisionId + " couldn't be found",
        });
      }
      console.log(decisionDoc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Add new decision. Requires logged in user.
 */
router.post("", (req, res, next) => {
  console.log(req.body);

  const newDecision = {
    title: req.body.title,
    description: req.body.description,
    userId: req.body.userId,
    status: req.body.status,
    createdAt: new Date(),
  };
  console.log(newDecision);

  db.getDb()
    .db()
    .collection("decisions")
    .insertOne(newDecision)
    .then((result) => {
      console.log(result);
      res
        .status(201)
        .json({ message: "Decision added", decisionId: result.insertedId });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Edit existing decision. Requires logged in user.
 */
router.patch("/:id", (req, res, next) => {
  const updatedDecision = {
    title: req.body.title,
    description: req.body.description,
    userId: req.body.userId,
    status: req.body.status,
    updatedAt: new Date(),
  };
  console.log(`Updated decision: ${JSON.stringify(updatedDecision, null, 2)}`);
  db.getDb()
    .db()
    .collection("decisions")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: updatedDecision,
      }
    )
    .then((result) => {
      res
        .status(200)
        .json({ message: "Decision updated", decisionId: req.params.id });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

/**
 * Delete a decision. Requires logged in user.
 */
router.delete("/:id", (req, res, next) => {
  db.getDb()
    .db()
    .collection("decisions")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      res.status(200).json({ message: "Decision deleted" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "An error occurred." });
    });
});

function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

module.exports = router;
