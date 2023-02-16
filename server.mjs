import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'node-fetch'
import https from "https";

let tweets =[ {
  id: '1',
  text: 'hello this is first',
  userId: '2',
},
{
  id: '2',
  text: 'hello this is second',
  userId: '1',
}]

let users = [{
  id: "1",
  firstName: "Sanghoon",
  lastName: "Kim"
},
{
  id: "2",
  firstName: "Ethen",
  lastName: "Mark"
}
]
const typeDefs = `#graphql
  """사용자 객체"""
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }
  """트위터 객체"""
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }
  type Movie {
    id: Int!
    url:String!
    imdb_code: String!
    title: String!
    title_english:String!
    title_long:String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String!]!
    summary: String
    description: String!
    sysnopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }

  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id:ID!): Tweet
    movie(id:String): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id:ID!): Boolean!
  }
`
const resolvers = {
  Query: {
    allMovies: async () => {
      const response = await fetch('https://yts.torrentbay.to/api/v2/list_movies.json');
      const data = await response.json();
      return data.data.movies
    },
    movie: async (_, {id}) => {
      const response = await fetch(`https://yts.torrentbay.to/api/v2/movie_details.json?movie_id=${id}`)
      const data = await response.json()
      return data.data.movie
    },
    allUsers: () => {
      console.log('all users called');
      return users
    },
    tweet: (root, {id}) => {
      console.log(root, id);
      return tweets.find(tweet=>tweet.id === id)
    },
    allTweets: () => tweets,
  },
  Mutation: {
    postTweet(_, {text, userId}) {
      const dbUserId = users.find(user=> user.id === userId)
      if (dbUserId) {
        const newTweet = {
          id: tweets.length + 1,
          text,
        }
        tweets.push(newTweet)
        return newTweet
      } else {
        return false
      }
      
    },
    deleteTweet(_, {id}) {
      const tweet = tweets.find(tweet => tweet.id === id)
      if (!tweet) return false
      tweets= tweets.filter(tweet => tweet.id !== id)
      return true
    }
  },
  User: {
    fullName({firstName, lastName}) {
      return `${firstName} ${lastName}`
    }
  },
  Tweet: {
    author({userId}) {
      return users.find(user => user.id === userId)
    }
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

