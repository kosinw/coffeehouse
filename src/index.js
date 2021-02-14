import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import GlobalStyles from "./GlobalStyles";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ProvideAuth } from "hooks/firebase";
import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  fonts: {
    body: "Inter",
    heading: "Inter"
  }
})


ReactDOM.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <title>Coffeehouse</title>
        <meta charset="utf-8" />
        <meta name="description" content="" />
      </Helmet>

      <GlobalStyles />
      <ChakraProvider>
        <ProvideAuth>
          <App />
        </ProvideAuth>
      </ChakraProvider>
    </HelmetProvider>
  </React.StrictMode>,
  document.getElementById('root')
);