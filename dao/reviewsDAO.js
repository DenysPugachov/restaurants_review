import mongodb from "mongodb"

// convert string to mongoDB obj(A class representation of the BSON ObjectId type.)
const ObjectId = mongodb.ObjectId

//BUG: review exist from the start
let reviews // ref to reviews collection

export default class ReviewsDAO {

  static async injectDB(conn) {
    if (reviews) {
      console.log("undefined review")
      return
    }
    try {
      console.log("review exist!")
      //access review collection (if it's not exist => mongoDB create is automatically)
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews")
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`)
    }
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date,
        text: review,
        restaurant_id: ObjectId(restaurantId),// convert to mongoDB ojb id
      }
      //insert to new review to DB
      return await reviews.insertOne(reviewDoc)
    } catch (e) {
      console.error(`Unable to post review: ${e}`)
      return { error: e }
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        {
          //looking for the review were matched userId & reviewId
          user_id: userId,
          _id: ObjectId(reviewId)
        },
        {
          //update matched review
          $set: { text: text, date: date }
        }
      )
      return updateResponse
    } catch (e) {
      console.error(`Unable to update review: ${e}`)
      return { error: e }
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      const deleteResponse = await review.deleteOne({
        _id: ObjectId(reviewId),
        user_id: userId,
      })
      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete review ${e}`)
      return { error: e }
    }
  }
}
