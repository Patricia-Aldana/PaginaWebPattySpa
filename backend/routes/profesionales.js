const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profesionalController");
const authMW = require("../middlewares/auth");

router.get("/", ctrl.list);
router.get("/:id", ctrl.getProfile);
router.put("/me", authMW, ctrl.updateProfile);

module.exports = router;
