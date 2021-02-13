import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import Index from "./routes/Index";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        {/* <Route path="/" exact component={CreateRoom} /> */}
        <Route path="/room/:roomID" component={Room} />
        <Route path="/:roomID" component={Index} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
