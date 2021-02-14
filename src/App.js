import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "routes/CreateRoom";
import Room from "routes/Room";
import YTPlayer from "components/MainSidebar/YTPlayer";
import { ProvideVideoBot } from "hooks/video-bot";
import { ProvideSocket } from "hooks/socket";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID">
          <ProvideSocket>
            <ProvideVideoBot>
              <YTPlayer />
              <Room />
            </ProvideVideoBot>
          </ProvideSocket>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
