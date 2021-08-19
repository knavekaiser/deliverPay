import { useContext, useState, useEffect } from "react";
import { SiteContext, ChatProvider } from "./SiteContext";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter,
  Link,
  useHistory,
} from "react-router-dom";
import { Modal } from "./components/Modal";
import { Header, Footer } from "./components/Elements";
import LandingPage from "./components/LandingPage";
import UserStart from "./components/UserStart";
import Account from "./components/Account";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import CodeOfConduct from "./components/codeOfConduct";
import CopyrightPolicy from "./components/copyrightPolicy";
import FeesCharges from "./components/feesCharges";
import UserAgreement from "./components/userAgreement";
import HowItWorks from "./components/howItWorks";
import ContactUs from "./components/contactUs";
import RefundPolicy from "./components/refundPolicy";
import ShippingPolicy from "./components/shippingPolicy";
import Marketplace, { SingleProduct } from "./components/Marketplace";
import WorkWithUs from "./components/WorkWithUs";
import Apply from "./components/Apply";
import { ToastContainer } from "react-toastify";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

Number.prototype.fix = function (p) {
  return +this.toFixed(p || 2);
};

function ProtectedRoute({ component, ...restOfProps }) {
  const { user } = useContext(SiteContext);
  const history = useHistory();
  if (!user) {
    return (
      <Redirect
        to={{
          pathname: "/u/login",
          state: { from: history.location.pathname + history.location.search },
        }}
      />
    );
  }
  return (
    <>
      <Route component={component} {...restOfProps} />
    </>
  );
}

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

function App() {
  const [mobile, setMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();
    serviceWorkerRegistration.register();
  }, []);
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
        <ChatProvider>
          <Switch>
            <Route path="/" exact component={LandingPage} />
            <Route path="/u" component={UserStart} />
            <ProtectedRoute path="/account" component={Account} />
            <Route path="/aboutUs" component={AboutUs} />
            <Route path="/marketplace/:_id" component={SingleProduct} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/privacyPolicy" component={PrivacyPolicy} />
            <Route path="/codeOfConduct" component={CodeOfConduct} />
            <Route path="/copyrightPolicy" component={CopyrightPolicy} />
            <Route path="/fees&Charges" component={FeesCharges} />
            <Route path="/terms" component={UserAgreement} />
            <Route path="/howItWorks" component={HowItWorks} />
            <Route path="/contactUs" component={ContactUs} />
            <Route path="/refundCancellationPolicy" component={RefundPolicy} />
            <Route path="/shippingDeliveryPolicy" component={ShippingPolicy} />
            <Route path="/employment-opportunities" component={WorkWithUs} />
            <Route path="/apply" component={Apply} />
            <Route path="/">
              <div className="generic">
                <Header />
                <div className="fourFour">
                  <h1>404</h1>
                </div>
                <Footer />
              </div>
            </Route>
          </Switch>
        </ChatProvider>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
