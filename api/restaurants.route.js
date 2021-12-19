import express from "express"
import RestaurantsCtrl from "./restaurants.controller.js"
import ReviewsCtrl from "./reviews.controller.js"

//access express router
const router = express.Router()

//add rote
router.route("/").get(RestaurantsCtrl.apiGetRestaurants)
router.route("/id/:id").get(RestaurantsCtrl.apiGetRestaurantsById)
router.route("/cuisines").get(RestaurantsCtrl.apiGetRestaurantsCuisines)

router.route("/review")
  .get(ReviewsCtrl.apiGetAllReviews)
  .post(ReviewsCtrl.apiPostReview)
  .put(ReviewsCtrl.apiUpdateReview)
  .delete(ReviewsCtrl.apiDeleteReview)

export default router