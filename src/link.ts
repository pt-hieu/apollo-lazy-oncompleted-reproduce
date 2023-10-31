import { ApolloLink } from "@apollo/client";
import { Ref, addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema, graphql, print } from "graphql";
import { from, mergeMap } from "rxjs";

import schemaForMock from "./schema.gql";

const gql: typeof graphql = (ops) => {
  const { source, variableValues, operationName, contextValue } = ops;
  const result = graphql(ops);

  result.then((r) => {
    console.log(operationName, {
      query: source,
      variables: variableValues,
      result: r.data ?? r.errors,
      contextValue,
    });
  });

  return result;
};

const schemaWithMock: GraphQLSchema = addMocksToSchema({
  schema: makeExecutableSchema({ typeDefs: schemaForMock }),
  preserveResolvers: true,
  mocks: {
    Train: {
      id: "1",
      passengers: {
        totalCount: 0,
      },
    },

    Query: undefined,
  },
  resolvers(store) {
    return {
      Query: {
        node: (_: any, { id }: any) => {
          return {
            $ref: {
              key: id,
              typeName: "Train",
            },
          } as Ref;
        },
      },
    };
  },
});

// @ts-expect-error Apollo's Observable is different from rxjs
export const link = new ApolloLink((operation) => {
  return from([operation]).pipe(
    // delay(operation.variables?.delay ?? f.number.int({ min: 700, max: 1000 })),
    mergeMap(({ query, variables, operationName, getContext }) => {
      return from(
        gql({
          schema: schemaWithMock,
          source: print(query),
          variableValues: variables,
          rootValue: {},
          contextValue: getContext(),
          operationName,
        })
      );
    })
  );
});
