require('dotenv').config(); //
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { typeDefs, resolvers } = require('./schema');

const PORT = process.env.PORT || 5110;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exchange-db';

async function startServer() {
  const app = express();

  // 모든 요청을 콘솔에 찍음
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');

  app.listen(PORT, () => {
    console.log(`GraphQL server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((err) => {
  console.error('Server start error:', err);
});