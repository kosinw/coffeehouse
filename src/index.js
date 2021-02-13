import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import GlobalStyles from "./GlobalStyles";
import { Helmet, HelmetProvider } from "react-helmet-async";

ReactDOM.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <title>Coffeehouse</title>
        <meta charset="utf-8" />
        <meta name="description" content="" />
      </Helmet>

      <GlobalStyles />
      <App />
    </HelmetProvider>
  </React.StrictMode>,
  document.getElementById('root')
);