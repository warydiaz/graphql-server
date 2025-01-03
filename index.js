import { gql, ApolloServer } from 'apollo-server';

const persons = [
    { name: 'John Doe', phone: "1234", street: "Loreto", city: "Santiago", birthYear: 1978, id: "1" },
    { name: 'John Perez', phone: "5678", street: "Paseo de Gracia", city: "Barcelona", birthYear: 1979, id: "2" },
    { name: 'Raul Diaz', street: "Diagonal", city: "Barcelona", birthYear: 1980, id: "3" }
];

const typeDefs = gql`
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
    
    type Query {
        personCount: Int!
        allPersons: [Person!]!
        findPerson(name: String!): Person
    }
`;

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: () => persons,
        findPerson: (root, args) => {
            const { name } = args;
            return persons.find(p => p.name === name);
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
