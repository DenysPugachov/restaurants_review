import express from "express"

//access express router
const router = express.Router()

//add rote
router.route("/").get((req, res) => res.send("Hello world!"))

export default router