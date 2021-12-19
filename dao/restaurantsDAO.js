import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId

let restaurantsCollection // ref to DB

export default class RestaurantsDAO {
  //connect to DB
  static async injectDB(conn) {
    if (restaurantsCollection) {
      return
    }
    try {
      // fill the data form DB
      restaurantsCollection = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants")
    } catch (e) {
      console.error(`Unable to connect in restaurantsDAO ${e}`)
    }
  }

  // get all list of restaurants in DB
  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {

    let query
    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } }
      } else if ("cuisine" in filters) {
        query = { "cuisine": { $eq: filters["cuisine"] } }
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } }
      }
    }

    let cursor// requested list of  filtered restaurants

    try {
      // find all restaurants with the query
      cursor = await restaurantsCollection.find(query)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }

    const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page)

    try {
      const restaurantsList = await displayCursor.toArray()
      const totalNumRestaurants = await restaurantsCollection.countDocuments(query)
      return { restaurantsList, totalNumRestaurants }
    } catch (e) {
      console.error(`Unable to convert cursor to array or problem counting documents, ${e}`)
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }
  }

  static async getRestaurantsById(id) {
    try {
      //MongoDB aggregation pipeline helps match deferent collection together
      const pipeline = [
        {
          $match: {
            _id: new ObjectId(id),//id of restaurant
          },
        },
        {
          // lookup (search) in reviews matches with restaurant id
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",//id => $$id
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],//find all the reviews that match that restaurant_id
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews", // set all result as "reviews" (of particular restaurant_id)
          },
        },
        {
          //add field off reviews to results
          $addFields: {
            reviews: "$reviews",
          },
        },
      ]
      return await restaurantsCollection.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getRestaurantsById: ${e}`)
      throw e
    }
  }

  static async getCuisines() {
    let cuisines = []
    try {
      // get all deferent cuisines value
      cuisines = await restaurantsCollection.distinct("cuisine")
      return cuisines
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`)
      return cuisines
    }
  }
}
