import { useContext, useState } from "react";
import { SiteContext } from "./SiteContext";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter,
  Link,
  useHistory,
} from "react-router-dom";
import { Modal } from "./components/Modal";
import LandingPage from "./components/LandingPage";
import UserStart from "./components/UserStart";
import Account from "./components/Account";
import JobApplication from "./components/JobApplication";

function ProtectedRoute({ children, path, component }) {
  const { user } = useContext(SiteContext);
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
  const [mobile, setMobile] = useState(window.innerWidth <= 480);
  return (
    <div className="App">
      <BrowserRouter>
        <Modal open={mobile} className="mobileApp">
          <button onClick={() => setMobile(false)}>
            I don't like better things.
          </button>
          <div className="wrapper">
            <Link to="#">
              <img src="/logo_big.jpg" />
            </Link>
            <p>Download our mobile app for a better experience.</p>
          </div>
        </Modal>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/u" component={UserStart} />
          <ProtectedRoute path="/account" component={Account} />
          <Route path="/JobApplication" key="job" component={JobApplication} />
          <Route path="/">
            <h1>404</h1>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
