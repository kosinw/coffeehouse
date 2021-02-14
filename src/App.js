import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import YTPlayer from "./YTPlayer";
import { ProvideVideoBot } from "./hooks/video-bot";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID">
          <ProvideVideoBot>
            <YTPlayer />
            <Room />
          </ProvideVideoBot>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
