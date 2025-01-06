import { gql, ApolloServer } from 'apollo-server';
import './db.js';
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
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }`;

    const resolvers = {
        Query: {
            personCount: async () => await Person.collection.countDocuments(),
            allPersons: async (root, args) => {

                if (!args.phone) return await Person.find({});

                return await Person.find({ phone: { $exists: args.phone === 'YES' } });
            },
            findPerson: async (root, args) => {
                const name = args.name;
                return await Person.findOne({
                    name: name
                });
            }
        },
    
        Mutation: {
            addPerson: async (root, args) => {
                const person = new Person({ ...args });
                return await person.save();
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
    };
    

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
