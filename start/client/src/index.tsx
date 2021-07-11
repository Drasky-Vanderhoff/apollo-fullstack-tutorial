import {
    gql,
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    ApolloProvider,
    HttpLink
} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import Pages from './pages';
import injectStyles from './styles';

const cache = new InMemoryCache();
const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    link: new HttpLink({
        uri: 'http://localhost:4000/graphql',
        headers: {
            authorization: localStorage.getItem('token'),
        },
    }),
    cache
});

cache.writeQuery({
    cartItems: [],
    isLoggedIn: !!localStorage.getItem('token'),
});

client.query({
    query: gql `
        query GetLaunch {
            launch(id: 56){
                id
                mission {
                    name
                }
            }
        }
    `
}).then( ({data}) => console.log(data));

injectStyles();

ReactDOM.render(
    <ApolloProvider client={client}>
        <Pages />
    </ApolloProvider>,
    document.getElementById('root')
)