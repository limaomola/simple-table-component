/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

 import React, { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import queryString from 'query-string';
//import GenericEmikatTable from "./components/GenericEmikatTable"; // -> Lazy
import * as CSISHelpers from './logic/CSISHelpers'
import * as EMIKATHelpers from './logic/EMIKATHelpers'
import GlobalErrorBoundary from './components/GlobalErrorBoundary';


import logo from './logo.svg';
import './App.css';


/**
 * A functional component is just a plain JavaScript function which accepts props as an argument and returns a React element. 
 */
function App(props) {

  // Code Spiltting test
  // https://reactjs.org/docs/code-splitting.html
  const GenericEmikatTable = React.lazy(() => import('./components/GenericEmikatTable.js'));

  // useState returns an array with 2 elements, and we’re using **ES6 destructuring** to assign names to them
  const [applicationState, setApplicationState] = useState({ url: 'https://jsonplaceholder.typicode.com/users', users: [], isFetching: false });
  /**
   * You might be wondering: why is useState not named createState instead?
   * “Create” wouldn’t be quite accurate because the state is only created the first time our component renders. 
   * During the next renders, useState gives us the current state. Otherwise it wouldn’t be “state” at all! 
   * There’s also a reason why Hook names always start with use.
   * 
   * 
   */


  // You can think of effects as a combination of componentDidMount() and componentDidUpdate() of class-based components.
  // In this case, I want it to run just once, so I pass both a function and an empty array. 
  // The array argument tells the Hook to apply the effect (i.e., run the function) only if the state variables listed in the array are changed.


  /**
   * The Effect Hook lets you perform side effects in function components. 
   * Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of side effects. 
   * If you’re familiar with React class lifecycle methods, you can think of useEffect Hook as componentDidMount, componentDidUpdate, and componentWillUnmount combined.
   */
  useEffect(() => {
    // Effect callbacks are synchronous to prevent race conditions. Put the async function inside!
    let ignore = false;
    console.log('url changed:' + applicationState.url);

    const fetchData = async () => {
      try {

        // functional update form 
        setApplicationState((state) => ({ ...state, isFetching: true }));
        const response = await EMIKATHelpers.fetchUsers(applicationState.url);
        /*response.catch((error) => {
          console.error('error caught in promise', error);
          setData((d) => ({ ...d, users: [], isFetching: false }));
        });*/

        // the functional update form (here implemented as arrow function) of setState lets us specify how the state needs to change without referencing the current state.
        // The function will receive the previous value, and return an updated value. We call it 'd' instead of data.
        // Therefore we don't need data and users in the list of dependencies but just data.url :o

        if (!ignore) {
          //console.log(JSON.stringify(response));
          setApplicationState((state) => ({ ...state, users: response.data, isFetching: false }));
        } else {
          console.log('status change during async call, ignoring');
        }
      } catch (error) {
        console.error('error caught in fetchData', error);
        setApplicationState((state) => ({ ...state, users: [], isFetching: false }));
      }
    };

    fetchData();

    return function cleanup() {
      console.log('cleanup data fetching');
      ignore = true;
    };

  }, [applicationState.url]);

  useEffect(() => {
    console.log('location changed:' + JSON.stringify(props.location));
    if (props.location && props.location.search) {
      const values = queryString.parse(props.location.search)
      if (/*values.id && values.id !== null && */values.url && values.url !== null) {
        setApplicationState((state) => ({ ...state, url: values.url, isFetching: false }));
      }
    }
  }, [props.location]);

  /**
   * Handles the onChange event in the url input field ...
   * @param {string} value 
   */
  function handleChange(value) {
    setApplicationState({ ...applicationState, url: value });
  }

  return (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  Edit <code>src/App.js</code> and save to reload.
        </p>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
        </a>
              </header>
              { /* React ...props syntax:
      ...data instead of data={data.users}, 
      https://www.robinwieruch.de/react-pass-props-to-component/#react-props-syntax-spread-rest*/ }

              <input value={applicationState.url} onChange={e => handleChange(e.target.value)} />
              <GlobalErrorBoundary>
                <Suspense fallback={<h2>Product list is loading...</h2>}>
                  {/* 
                    Spread operator. We could have used data.isFetching, etc.
                    For pros/cons see https://codeburst.io/react-anti-pattern-jsx-spread-attributes-59d1dd53677f
                  */}
                  <GenericEmikatTable {...applicationState} />
                </Suspense>
              </GlobalErrorBoundary>
            </div>
            

  );
}

/**
 * Steps for loading tabular data from EMIKAT API 
 * 1) get **EMIKAT credentials** from CSIS API -> requires authenticated user loggin in CSIS
 * 2) get `$emikat_id` from study group node -> requires study id obtained from query param or seamless.js iFrame communication
 * 3) get **Data Package** from study group node and extract emikat **resources**
 *    - filter by **EU-GL step** obtained from query param or seamless.js iFrame communication
 *    - `taxonomy_term--service_type` from tags with value 'EMIKAT' (?)
 *    - refence type with value `EMIKAT:table`? from references array?
 */
export default App;
