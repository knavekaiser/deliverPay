import { useContext, useState, useEffect, lazy, Suspense } from "react";
import { SiteContext, ChatProvider } from "./SiteContext";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter,
  Link,
  useHistory,
} from "react-router-dom";
import { Header, Footer } from "./components/Elements";
import { ToastContainer } from "react-toastify";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const Account = lazy(() => import("./components/Account"));

const Modal = lazy(() =>
  import("./components/Modal").then((mod) => ({
    default: mod.Modal,
  }))
);
const SingleProduct = lazy(() =>
  import("./components/Marketplace").then((mod) => ({
    default: mod.SingleProduct,
  }))
);
const Marketplace = lazy(() => import("./components/Marketplace"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const UserStart = lazy(() => import("./components/UserStart"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const CodeOfConduct = lazy(() => import("./components/codeOfConduct"));
const CopyrightPolicy = lazy(() => import("./components/copyrightPolicy"));
const FeesCharges = lazy(() => import("./components/feesCharges"));
const UserAgreement = lazy(() => import("./components/userAgreement"));
const HowItWorks = lazy(() => import("./components/howItWorks"));
const ContactUs = lazy(() => import("./components/contactUs"));
const RefundPolicy = lazy(() => import("./components/refundPolicy"));
const ShippingPolicy = lazy(() => import("./components/shippingPolicy"));
const WorkWithUs = lazy(() => import("./components/WorkWithUs"));
const Apply = lazy(() => import("./components/Apply"));

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
  const { siteLoading, setSiteLoading } = useContext(SiteContext);
  const [mobile, setMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();
    serviceWorkerRegistration.register();
    document.querySelector(".splash-screen")?.remove();
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<>Loading</>}>
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
        </Suspense>
        <ChatProvider>
          <Suspense fallback={<>Loading</>}>
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
              <Route
                path="/refundCancellationPolicy"
                component={RefundPolicy}
              />
              <Route
                path="/shippingDeliveryPolicy"
                component={ShippingPolicy}
              />
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
          </Suspense>
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
