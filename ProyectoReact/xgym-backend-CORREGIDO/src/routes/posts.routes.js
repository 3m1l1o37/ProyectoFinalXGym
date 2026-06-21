

const { Router } = require("express");
const ctrl = require("../controllers/posts.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { validatePost } = require("../middlewares/validate.middleware");

const router = Router();

router.get("/", verifyToken, ctrl.getAll);
router.get("/:id", verifyToken, ctrl.getById);
router.post("/", verifyToken, validatePost, ctrl.create);
router.delete("/:id", verifyToken, ctrl.remove);
router.post("/:id/like", verifyToken, ctrl.toggleLike);
router.get("/:id/comments", verifyToken, ctrl.getComments);
router.post("/:id/comments", verifyToken, ctrl.addComment);

module.exports = router;
