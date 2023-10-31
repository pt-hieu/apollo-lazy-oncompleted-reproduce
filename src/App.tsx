import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { ApolloClient, InMemoryCache, gql, useLazyQuery } from "@apollo/client";
import { link } from "./link";

function App() {
  const [count, setCount] = useState(0);
  const [apolloClient] = useState(
    new ApolloClient({
      cache: new InMemoryCache({ typePolicies: {} }),
      connectToDevTools: true,
      link,
    })
  );

  const [execute] = useLazyQuery(
    gql`
      query Test($id: String!) {
        node(id: $id) {
          ... on Train {
            passengers {
              totalCount
            }
          }
        }
      }
    `,
    { client: apolloClient, variables: { id: "1" }, fetchPolicy: "no-cache" }
  );

  useEffect(() => {
    execute({
      onCompleted() {
        console.log("Hello world");
        alert("Hello world");
      },
    }).then((data) => {
      console.log("Hello from promise", data);
    });
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
