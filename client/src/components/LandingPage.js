import { useContext } from "react";
import logo from "../logo.svg";
import { SiteContext } from "../SiteContext";
import illustration from "../landingPage_illustration.svg";
import { Link } from "react-router-dom";
require("../components/styles/landingPage.scss");

function LandingPage() {
  const { user } = useContext(SiteContext);
  return (
    <div className="landingPage">
      <header>
        <div className="innerWrapper">
          <div className="links">
            <Link to="/">
              <img className="logo" src={logo} alt="Skropay logo" />
            </Link>
            <Link to="#">For Business</Link>
            <Link to="#">About us</Link>
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
                <Link to="/u/join">Join Skropay</Link>
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
              <br /> Using Skropay
            </h1>
            <p>
              Skropay is a secure transaction platform that completely protects
              you from being scammed when you want to buy or sell with someone
              you don't know.
            </p>
            <div className="clas">
              <Link to="/account/home">I am a Seller</Link>
              <Link to="/account/home">I am a Buyer</Link>
            </div>
          </div>
          <img className="illustration" src={illustration} alt="illustration" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
