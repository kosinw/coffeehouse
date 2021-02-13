import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import GlobalStyles from "./GlobalStyles";
import { Helmet } from "react-helmet";

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <title>Coffeehouse</title>
      <meta charset="utf-8" />
      <meta name="description" content="" />
    </Helmet>

    <GlobalStyles />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);