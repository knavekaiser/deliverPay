import { useContext, useEffect } from "react";
import { SiteContext } from "../SiteContext";
import { Link } from "react-router-dom";
import { Footer } from "./Elements";
require("./styles/landingPage.scss");

function LandingPage({ history }) {
  const { user, setUser, setUserType } = useContext(SiteContext);
  useEffect(() => {
    fetch("/api/authUser")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);
  return (
    <div className="landingPage">
      <header>
        <div className="innerWrapper">
          <div className="links">
            <Link className="logoLink" to="/">
              <img
                className="logo"
                src="/logo_land.jpg"
                alt="Delivery pay logo"
              />
            </Link>
            <Link
              to={user ? "/account/home" : "/u/join"}
              onClick={() => setUserType("seller")}
            >
              I am a Seller
            </Link>
            <Link
              to={user ? "/account/home" : "/u/join"}
              onClick={() => setUserType("buyer")}
            >
              I am a Buyer
            </Link>
          </div>
          <div className="path">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="345"
              height="185.296"
              viewBox="0 0 401.991 185.296"
              className="path"
            >
              <path
                id="Path_1938"
                data-name="Path 1938"
                d="M-73.783,185.675s177.855-12.2,269.307-64.419S328.208.379,328.208.379H-73.783"
                transform="translate(73.783 -0.379)"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="clas">
            {user ? (
              <Link to="/account/home">Dashboard</Link>
            ) : (
              <>
                <Link to="/u/login">Login</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="content">
        <div className="innerWrapper">
          <div className="text">
            <h1>
              Never Pay Without
              <br /> Using Delivery pay
            </h1>
            <p>
              Delivery pay is a secure transaction platform that completely
              protects you from being scammed when you want to buy or sell with
              someone you don't know.
            </p>
            <div className="clas">
              {
                //   <Link to="/marketplace" target="_blank">
                //   Delivery Pay Marketplace
                // </Link>
              }
            </div>
          </div>
          <img
            className="illustration"
            src="/landingPage_illustration.png"
            alt="illustration"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
