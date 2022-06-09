import express from "express"
import dotenv from "dotenv"
import { graphqlHTTP } from "express-graphql"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
} from "graphql"
import { Client } from "pg"
import joinMonster from "join-monster"
import cors from "cors"

dotenv.config({ path: ".env.development" })

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

client.connect()

const app = express()
const port = process.env.SERVER_PORT || 3000

const userAccount: any = new GraphQLObjectType({
  name: "userAccount",
  fields: () => ({
    id: { type: GraphQLInt },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    age: { type: GraphQLInt },
  }),
  extensions: {
    joinMonster: {
      sqlTable: "useraccount",
      uniqueKey: "id",
    },
  },
})

userAccount._typeConfig = {
  sqlTable: "useraccount",
  uniqueKey: "id",
}

const post: any = new GraphQLObjectType({
  name: "post",
  fields: () => ({
    id: { type: GraphQLInt },
    body: { type: GraphQLString },
  }),
  extensions: {
    joinMonster: {
      sqlTable: "post",
      uniqueKey: "id",
    },
  },
})

post._typeConfig = {
  sqlTable: "post",
  uniqueKey: "id",
}

// GraphQL Schema
const QueryRoot = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    hello: {
      type: GraphQLString,
      resolve: () => "Hello world!",
    },
    userAccount: {
      type: new GraphQLList(userAccount),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, (sql: any) => {
          return client.query(sql)
        })
      },
    },
    post: {
      type: new GraphQLList(post),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, (sql: any) => {
          return client.query(sql)
        })
      },
    },
  }),
})

const MutationRoot = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createUserAccount: {
      type: userAccount,
      args: {
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await client.query(
              "INSERT INTO useraccount (first_name, last_name, age) VALUES ($1, $2, $3) RETURNING *",
              [args.first_name, args.last_name, args.age]
            )
          ).rows[0]
        } catch (err) {
          throw new Error("Failed to insert new user account")
        }
      },
    },
  }),
})

const schema = new GraphQLSchema({ query: QueryRoot, mutation: MutationRoot })

app.use(cors())

// Create express server
app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
)

app.listen(port)
