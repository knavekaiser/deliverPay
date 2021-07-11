import { useContext } from "react";
import { SiteContext } from "./SiteContext";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter,
  useHistory,
} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import UserStart from "./components/UserStart";
import "./App.scss";
import Account from "./components/Account";

function ProtectedRoute({ children, path, component }) {
  const { user, setUser } = useContext(SiteContext);
  const history = useHistory();
  if (!user) {
    return (
      <Redirect
        to={{
          pathname: "/u/login",
          state: { from: history.location.pathname },
        }}
      />
    );
  }
  return (
    <>
      <Route path={path} component={component}>
        {children}
      </Route>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/u" component={UserStart} />
          <ProtectedRoute path="/account" component={Account} />
          <Route path="/">
            <h1>404</h1>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
