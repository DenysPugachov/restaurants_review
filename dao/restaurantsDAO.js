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
      // find add restar with query
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
}
