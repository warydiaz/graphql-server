import {
  gql,
  ApolloServer,
  UserInputError,
  AuthenticationError,
} from "apollo-server";
import "./db.js";
import Person from "./models/person.js";
import User from "./models/user.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    birthYear: Int!
    age: Int
    id: ID!
  }

  type User {
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
      birthYear: Int!
    ): Person

    editNumber(name: String!, phone: String!): Person

    createUser(username: String!): User

    login(username: String!, password: String!): Token

    addAsFriend(name: String!): User
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }
`;

const savePersonData = async (person) => {
  try {
    await person.save();
  } catch (error) {
    throw new UserInputError(error.message, {
      invalidArgs: person,
    });
  }
};

const resolvers = {
  Query: {
    personCount: async () => await Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) return await Person.find({});
      return await Person.find({ phone: { $exists: args.phone === "YES" } });
    },
    findPerson: async (root, args) => {
      return await Person.findOne({ name: args.name });
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },

  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context;

      if (!currentUser) throw new AuthenticationError("not authenticated");

      const person = new Person({ ...args });
      await savePersonData(person);

      currentUser.friends = currentUser.friends.concat(person);
      await savePersonData(currentUser);

      return person;
    },

    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name });

      if (!person) return null;

      person.phone = args.phone;

      await savePersonData(person);

      return person;
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username });

      try {
        await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return user;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      console.log(user);

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },

    addAsFriend: async (root, args, context) => {
      const { currentUser } = context;

      const person = await Person.findOne({ name: args.name });
      if (!currentUser || !person) throw new UserInputError("not found");

      const alreadyFriend = (person) =>
        !currentUser.friends.map((f) => f._id).includes(person._id);

      if (alreadyFriend(person)) {
        currentUser.friends = currentUser.friends.concat(person);
        savePersonData(currentUser);
      }

      return person;
    },
  },

  Person: {
    age: (root) => new Date().getFullYear() - root.birthYear,
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id).populate(
        "friends"
      );
      return { currentUser };
    }
  },
});
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
