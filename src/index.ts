import express from "express"
import dotenv from "dotenv"

dotenv.config({ path: ".env.development" })

const app = express()
const port = process.env.SERVER_PORT || 3000

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
