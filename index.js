import { gql, ApolloServer } from 'apollo-server';
import './db';
import Person from './models/person.js';



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

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
            birthYear: Int!
        ): Person

        editNumber(
            name: String!
            phone: String!
        ): Person
    }
    
    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person!]!
        findPerson(name: String!): Person
    }`;

const resolvers = {
    Query: {
        personCount: () => Person.collection.countDocuments(),
        allPersons: (root, args) => {
            return Person.find({});
        },
        findPerson: (root, args) => {
            const name = args.name;
            return Person.findOne({
                name: name
            })
        },

        Mutation: {
            addPerson: (root, args) => {
                const person = new Person({ ...args });
                return person.save();
            },
            editNumber: async (root, args) => {
                const person = await Person.findOne({ name: args.name });
                person.phone = args.phone;
                return person.save();
            }
        },

        Person: {
            age: (root) => new Date().getFullYear() - root.birthYear,
            address: (root) => {
                return {
                    street: root.street,
                    city: root.city
                };
            }
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
