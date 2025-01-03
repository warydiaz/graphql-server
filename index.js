import { gql, ApolloServer } from 'apollo-server';
import { v1 as uuid } from 'uuid';

const persons = [
    { name: 'John Doe', phone: "1234", street: "Loreto", city: "Santiago", birthYear: 1978, id: "1" },
    { name: 'John Perez', phone: "5678", street: "Paseo de Gracia", city: "Barcelona", birthYear: 1979, id: "2" },
    { name: 'Raul Diaz', street: "Diagonal", city: "Barcelona", birthYear: 1980, id: "3" }
];

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
    }
`;

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if (!args.phone) return persons;
            const phone = args.phone === 'YES';
            return persons.filter(p => phone ? p.phone : !p.phone);
        }
    },

    Mutation: {
        addPerson: (root, args) => {
            const person = { ...args, id: uuid() };
            persons.push(person);
            return person;
        },
        editNumber: (root, args) => {
            const personIndex = persons.findIndex(p => p.name === args.name);

            if (personIndex === -1) return null;

            const person = persons[personIndex];
            const updatedPerson = { ...person, phone: args.phone };
            persons[personIndex] = updatedPerson;

            return updatedPerson;
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
