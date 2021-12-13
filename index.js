import app from "./server.js";
import mongodb from "mongodb"
import dotenv from "dotenv"
import RestaurantsDAO from "./dao/restaurantsDAO.js"
import ReviewsDAO from "./dao/reviewsDAO.js";

dotenv.config()
const MongoClient = mongodb.MongoClient

const port = process.env.PORT || 8000


// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD,
// )

MongoClient.connect(
  process.env.RESTREVIEWS_DB_URI,
  {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true
  }
).catch(err => {
  console.error(err.stack)
  process.exit(1)
}).then(async client => {
  //get initial ref to ref collection in DB
  await RestaurantsDAO.injectDB(client)
  await ReviewsDAO.injectDB(client)
  //start server
  app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}/api/v1/restaurants`)
  })
})

  // end 30:00
