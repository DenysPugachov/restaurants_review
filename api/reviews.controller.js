import ReviewsDAO from "../dao/reviewsDAO.js"

export default class ReviewsController {

  static async apiGetAllReviews(req, res, next) {
    try {
      const reviewsCollection = await ReviewsDAO.getAllReviews()
      res.json(reviewsCollection)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiPostReview(req, res, next) {
    try {
      const restaurantId = req.body.restaurant_id
      const review = req.body.text
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id
      }
      const date = new Date()
      const reviewResponse = await ReviewsDAO.addReview(
        restaurantId,
        userInfo,
        review,
        date,
      )
      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id
      const text = req.body.text
      const userId = req.body.user_id
      const date = new Date()
      const reviewUpdateResponse = await ReviewsDAO.updateReview(
        reviewId,
        userId,
        text,
        date,
      )
      let { error } = reviewUpdateResponse
      if (error) {
        res.status(400).json({ error })
      }

      //if review was not updated
      if (reviewUpdateResponse.modifiedCount === 0) {
        throw new Error(
          "Unable to update review, user may not be an author of this review  "
        )
      }
      res.status(200).json({ status: "updated successfully" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.query.id
      const userId = req.body.user_id
      const reviewDeleteResponse = await ReviewsDAO.deleteReview(
        // simple authentication (reviewId === userId)
        reviewId,
        userId,
      )
      if (reviewDeleteResponse.deletedCount === 0) {
        throw new Error("No document with this id")
      }
      res.json({ status: "deleted successfully" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
}