import express from "express"
import dotenv from "dotenv"
import { graphqlHTTP } from "express-graphql"
const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql

dotenv.config({ path: ".env.development" })

const app = express()
const port = process.env.SERVER_PORT || 3000

const QueryRoot = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    hello: {
      type: GraphQLString,
      resolve: () => "Hellosdf world!",
    },
  }),
})

const schema = new GraphQLSchema({ query: QueryRoot })

app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
)

app.listen(port)
