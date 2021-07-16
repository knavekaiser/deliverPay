import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import { Modal } from "./Modal.js";
import {
  Combobox,
  NumberInput,
  Err_svg,
  Succ_svg,
  X_svg,
  Plus_svg,
  Minus_svg,
} from "./Elements";
import Hold from "./Hold.js";
import Transactions from "./Transactions";
import Wallet from "./Wallet";
import Products from "./Products";
import Support from "./Support";
import Profile from "./Profile";
import Deals from "./Deals";
import QRCode from "qrcode.react";
import { GoogleLogout } from "react-google-login";
import {
  EmailShareButton,
  FacebookShareButton,
  HatenaShareButton,
  InstapaperShareButton,
  LineShareButton,
  LinkedinShareButton,
  LivejournalShareButton,
  MailruShareButton,
  OKShareButton,
  PinterestShareButton,
  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  ViberShareButton,
  VKShareButton,
  WhatsappShareButton,
  WorkplaceShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  TwitterIcon,
  ViberIcon,
  VKIcon,
  WeiboIcon,
  WhatsappIcon,
  WorkplaceIcon,
} from "react-share";
import Moment from "react-moment";
require("./styles/account.scss");

const Home = () => {
  const history = useHistory();
  const [value, setValue] = useState("");
  const [userType, setUserType] = useState("");
  const [users, setUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState(null);
  const fetchUsers = useCallback(
    (e) => {
      setValue(e.target.value);
      fetch(`/api/getUsers?q=${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setUsers(data);
          }
        });
      if (e.target.value === "") {
        setUsers([]);
      }
    },
    [value]
  );
  const inviteUser = useCallback(() => {
    if (value.match(/^\+?[789]\d{9}$/)) {
      fetch(`/api/inviteUser?q=${value}origin=${window.location.origin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4>Invitation sent.</h4>
                </div>
              </>
            );
          } else {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Err_svg />
                  <h4>Invitation could not be sent. Please try again.</h4>
                </div>
              </>
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Invitation could not be sent. Make sure you're online.</h4>
              </div>
            </>
          );
        });
    } else {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Enter a valid phone number to send invitation.</h4>
          </div>
        </>
      );
    }
  }, [value]);
  useEffect(() => {
    fetch("/api/recentPayments")
      .then((res) => res.json())
      .then((data) => {
        setRecentPayments(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    if (history.location.pathname === "/account/home/pay" && !client) {
      history.push("/account/home");
    }
  }, []);
  return (
    <div className="homeContainer">
      <div className="benner">
        <h4>Start transactions with Delivery pay</h4>
        <p>Let us help you make the safest transaction</p>
      </div>
      <div className="userType">
        <div className={`option buyer ${userType === "buyer" && "active"}`}>
          <img src="/buyer.png" />
          <div className="btn" onClick={(e) => setUserType("buyer")}>
            <p>I am a Buyer </p>
            <div className="radial">
              {userType === "buyer" && <div className="fill" />}
            </div>
          </div>
        </div>
        <div className={`option seller ${userType === "seller" && "active"}`}>
          <img src="/seller.png" />
          <div className="btn" onClick={(e) => setUserType("seller")}>
            <p>I am a Seller </p>
            <div className="radial">
              {userType === "seller" && <div className="fill" />}
            </div>
          </div>
        </div>
      </div>
      {userType === "buyer" && (
        <div className="search">
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="search">Start buying with Delivery pay</label>
            <section>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17.9"
                height="17.9"
                viewBox="0 0 17.9 17.9"
              >
                <path
                  id="Path_208"
                  data-name="Path 208"
                  d="M17.9,16.324l-3.715-3.715a7.708,7.708,0,0,0,1.576-4.728A7.832,7.832,0,0,0,7.881,0,7.832,7.832,0,0,0,0,7.881a7.832,7.832,0,0,0,7.881,7.881,7.708,7.708,0,0,0,4.728-1.576L16.324,17.9ZM2.252,7.881A5.574,5.574,0,0,1,7.881,2.252a5.574,5.574,0,0,1,5.629,5.629,5.574,5.574,0,0,1-5.629,5.629A5.574,5.574,0,0,1,2.252,7.881Z"
                  transform="translate(0)"
                  fill="#b9b9b9"
                />
              </svg>
              <input
                label="search"
                required={true}
                placeholder="Search with Delivery pay ID or Phone Number"
                onBlur={() => {
                  setTimeout(() => setUsers([]), 500);
                }}
                onChange={fetchUsers}
              />
            </section>
            {users.length ? (
              <ul className="searchResult">
                {users.map((user, i) => (
                  <li key={i}>
                    <div className="profile">
                      <img src={user.profileImg} />
                      <p className="name">
                        {user.firstName + " " + user.lastName}
                        <span className="phone">{user.phone}</span>
                      </p>
                    </div>
                    <Link
                      className="sendReq"
                      to={{
                        pathname: "/account/home/pay",
                      }}
                      onClick={() => setClient(user)}
                    >
                      Create Milestone
                    </Link>
                  </li>
                ))}
                {users.length === 0 && (
                  <li>
                    <div className="profile">
                      <p className="name">{value}</p>
                    </div>
                    <Link className="sendReq" onClick={inviteUser} to="#">
                      Invite
                    </Link>
                  </li>
                )}
              </ul>
            ) : null}
            {value && users.length === 0 && (
              <ul className="searchResult">
                <li>
                  <div className="profile">
                    <img src="/profile-user.jpg" />
                    <p className="name">{value}</p>
                  </div>
                  <Link className="sendReq" onClick={inviteUser} to="#">
                    Invite
                  </Link>
                </li>
              </ul>
            )}
          </form>
        </div>
      )}
      {userType === "seller" && (
        <div className="search">
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="search">Start selling with Delivery pay</label>
            <section>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17.9"
                height="17.9"
                viewBox="0 0 17.9 17.9"
              >
                <path
                  id="Path_208"
                  data-name="Path 208"
                  d="M17.9,16.324l-3.715-3.715a7.708,7.708,0,0,0,1.576-4.728A7.832,7.832,0,0,0,7.881,0,7.832,7.832,0,0,0,0,7.881a7.832,7.832,0,0,0,7.881,7.881,7.708,7.708,0,0,0,4.728-1.576L16.324,17.9ZM2.252,7.881A5.574,5.574,0,0,1,7.881,2.252a5.574,5.574,0,0,1,5.629,5.629,5.574,5.574,0,0,1-5.629,5.629A5.574,5.574,0,0,1,2.252,7.881Z"
                  transform="translate(0)"
                  fill="#b9b9b9"
                />
              </svg>
              <input
                label="search"
                required={true}
                placeholder="Search with Delivery pay ID or Phone Number"
                onBlur={() => {
                  setTimeout(() => setUsers([]), 500);
                }}
                onChange={fetchUsers}
              />
            </section>
            {users.length ? (
              <ul className="searchResult">
                {users.map((user, i) => (
                  <li key={i}>
                    <div className="profile">
                      <img src={user.profileImg} />
                      <p className="name">
                        {user.firstName + " " + user.lastName}
                        <span className="phone">{user.phone}</span>
                      </p>
                    </div>
                    <Link
                      className="sendReq"
                      onClick={() => setClient(user)}
                      to={{
                        pathname: "/account/home/pay",
                      }}
                    >
                      {userType === "seller"
                        ? "Request milestone"
                        : "Create milestone"}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {value && users.length === 0 && (
              <ul className="searchResult">
                <li>
                  <div className="profile">
                    <img src="/profile-user.jpg" />
                    <p className="name">{value}</p>
                  </div>
                  <Link className="sendReq" onClick={inviteUser} to="#">
                    Invite
                  </Link>
                </li>
              </ul>
            )}
          </form>
        </div>
      )}
      {recentPayments.length > 0 && userType && (
        <div className="recentPayments">
          <p className="label">Recent Payments</p>
          <ul className="payments">
            {recentPayments.map((user) => (
              <li key={user._id}>
                <Link
                  to="/account/home/pay"
                  onClick={() => {
                    setClient(user);
                  }}
                >
                  <img src={user.profileImg} />
                  <p className="name">{user.firstName + " " + user.lastName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Route path="/account/home/pay">
        <Modal open={true} className="milestoneRequest">
          <div className="head">
            <p className="modalName">
              {userType === "seller" ? "Request Milestone" : "Create Milestone"}
            </p>
            <button
              onClick={() => {
                history.push("/account/home");
                setClient(null);
              }}
            >
              <X_svg />
            </button>
          </div>
          <MilestoneForm
            userType={userType}
            searchClient={client}
            onSuccess={(milestone) => {
              history.push("/account/home");
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    {milestone.milestone ? <Succ_svg /> : <Err_svg />}
                    {milestone.milestone && (
                      <h4 className="amount">₹{milestone.milestone?.amount}</h4>
                    )}
                    <h4>{milestone.message}</h4>
                  </div>
                  {milestone.milestone && (
                    <Link to="/account/hold" onClick={() => setMsg(null)}>
                      Check your Delivery pay Hold
                    </Link>
                  )}
                </>
              );
            }}
          />
        </Modal>
      </Route>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const AddressForm = ({ client, onSuccess, onCancel }) => {
  const [name, setName] = useState(
    client ? client.firstName + " " + client.lastName : ""
  );
  const [phone, setPhone] = useState(client?.phone || "");
  const [zip, setZip] = useState(client?.address?.zip || "");
  const [locality, setLocatily] = useState(client?.address?.locality || "");
  const [street, setStreet] = useState(client?.address?.street || "");
  const [city, setCity] = useState(client?.address?.city || "");
  const [state, setState] = useState(client?.address?.state || "");
  const [landmark, setLandmark] = useState(client?.address?.landmark || "");
  const [altPhone, setAltPhone] = useState(client?.address?.altPhone || "");
  return (
    <form
      className="addressForm"
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess?.({
          address: {
            name,
            phone,
            street,
            city,
            state,
            zip,
            locality,
            landmark,
          },
        });
      }}
    >
      <section>
        <label htmlFor="name">Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          name="name"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="phone">Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          name="phone"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="zip">PIN Code</label>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          type="number"
          name="zip"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="locality">Locality</label>
        <input
          value={locality}
          onChange={(e) => setLocatily(e.target.value)}
          type="text"
          name="locality"
          required={true}
        />
      </section>
      <section className="street">
        <label htmlFor="address">Address</label>
        <textarea
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          resiz="off"
          type="text"
          name="address"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="city">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          type="text"
          name="city"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="state">State</label>
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          type="text"
          name="state"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="landmark">Landmark (Optional)</label>
        <input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          type="text"
          name="landmark"
        />
      </section>
      <section>
        <label htmlFor="altPhone">Alternate Phone (Optional)</label>
        <input
          value={altPhone}
          onChange={(e) => setAltPhone(e.target.value)}
          type="tel"
          name="altPhone"
        />
      </section>
      <button className="save">Save</button>
      <button className="cancel" type="button" onClick={() => onCancel?.()}>
        Cancel
      </button>
      <section className="pBtm" />
    </form>
  );
};

function Account({ location }) {
  const { user } = useContext(SiteContext);
  return (
    <div className="account">
      <header>
        <Link to="/">
          <img className="logo" src="/logo_land.jpg" alt="Delivery pay logo" />
        </Link>
        <ProfileAvatar />
      </header>
      <div className="content">
        <ul className="sidebar">
          <li
            className={
              location.pathname === "/account" ||
              location.pathname.startsWith("/account/home")
                ? "active"
                : undefined
            }
          >
            <Link to="/account/home">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21.648"
                  height="21.513"
                  viewBox="0 0 21.648 21.513"
                >
                  <path
                    id="Path_287"
                    data-name="Path 287"
                    d="M21.387,10.488A1.079,1.079,0,0,0,21.3,8.979L11.626.289a1.185,1.185,0,0,0-1.576,0L.342,9.44A1.073,1.073,0,0,0,.3,10.95l.245.258A1.043,1.043,0,0,0,2,11.321l.724-.665v9.762A1.071,1.071,0,0,0,3.78,21.5H7.563A1.071,1.071,0,0,0,8.62,20.418V13.591h4.81v6.828a1.04,1.04,0,0,0,.269.761.987.987,0,0,0,.723.323H18.45a1.071,1.071,0,0,0,1.057-1.084V10.776l.449.4c.245.222.765.042,1.168-.4Z"
                    transform="translate(-0.008 0.011)"
                    fill="#fff"
                  />
                </svg>
              </div>
              Home
            </Link>
          </li>
          <li
            className={`deals ${
              location.pathname.startsWith("/account/deals")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/deals">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26.55"
                  height="25.219"
                  viewBox="0 0 26.55 25.219"
                >
                  <path
                    id="Path_1"
                    data-name="Path 1"
                    d="M-242.2-184.285h-13l26.55-10.786-4.252,25.219-5.531-10.637-2.127,4.68v-6.382l7.659-9.148h2.34"
                    transform="translate(255.198 195.071)"
                    fill="#fff"
                  />
                </svg>
              </div>
              Deals
            </Link>
          </li>
          <li
            className={
              location.pathname.startsWith("/account/wallet")
                ? "active"
                : undefined
            }
          >
            <Link to="/account/wallet">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20.886"
                  height="22.948"
                  viewBox="0 0 20.886 22.948"
                >
                  <g
                    id="Rectangle_2"
                    data-name="Rectangle 2"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <rect width="20.886" height="16.244" rx="2" stroke="none" />
                    <rect
                      x="1"
                      y="1"
                      width="18.886"
                      height="14.244"
                      rx="1"
                      fill="none"
                    />
                  </g>
                  <g
                    id="Rectangle_3"
                    data-name="Rectangle 3"
                    transform="translate(0 9.283)"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <rect width="20.886" height="6.962" rx="2" stroke="none" />
                    <rect
                      x="1"
                      y="1"
                      width="18.886"
                      height="4.962"
                      rx="1"
                      fill="none"
                    />
                  </g>
                  <path
                    id="Path_2"
                    data-name="Path 2"
                    d="M-180.174-182v7.923l4.1-4.653,3.932,4.653V-182Z"
                    transform="translate(186.6 197.025)"
                    fill="#fff"
                  />
                </svg>
              </div>
              Wallet
            </Link>
          </li>
          <li
            className={`hold ${
              location.pathname.startsWith("/account/hold")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/hold">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="27"
                  viewBox="0 0 22 27"
                >
                  <text
                    id="_3"
                    data-name="3"
                    transform="translate(14 14) rotate(180)"
                    fill="#fff"
                    fontSize="10"
                    fontFamily="Ebrima-Bold, Ebrima"
                    fontWeight="700"
                  >
                    <tspan x="0" y="0">
                      3
                    </tspan>
                  </text>
                  <g
                    id="Group_166"
                    data-name="Group 166"
                    transform="translate(-534.967 -611.816)"
                  >
                    <g
                      id="Rectangle_1132"
                      data-name="Rectangle 1132"
                      transform="translate(534.967 620.816)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <rect width="22" height="18" rx="4" stroke="none" />
                      <rect
                        x="1"
                        y="1"
                        width="20"
                        height="16"
                        rx="3"
                        fill="none"
                      />
                    </g>
                    <g
                      id="Rectangle_1133"
                      data-name="Rectangle 1133"
                      transform="translate(539.967 611.816)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path
                        d="M6.5,0h0A6.5,6.5,0,0,1,13,6.5V11a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V6.5A6.5,6.5,0,0,1,6.5,0Z"
                        stroke="none"
                      />
                      <path
                        d="M6.5,1h0A5.5,5.5,0,0,1,12,6.5V9.214a.786.786,0,0,1-.786.786H1.786A.786.786,0,0,1,1,9.214V6.5A5.5,5.5,0,0,1,6.5,1Z"
                        fill="none"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              Delivery pay Hold
            </Link>
          </li>
          <li
            className={`trans ${
              location.pathname.startsWith("/account/transactions")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/transactions">
              <div className="icon">
                <svg
                  id="Group_283"
                  data-name="Group 283"
                  xmlns="http://www.w3.org/2000/svg"
                  width="28.407"
                  height="25.407"
                  viewBox="0 0 28.407 25.407"
                >
                  <g
                    id="Path_4"
                    data-name="Path 4"
                    transform="translate(3)"
                    fill="none"
                  >
                    <path
                      d="M12.7,0A12.7,12.7,0,1,1,0,12.7,12.7,12.7,0,0,1,12.7,0Z"
                      stroke="none"
                    />
                    <path
                      d="M 12.70325660705566 1.999996185302734 C 9.844316482543945 1.999996185302734 7.156496047973633 3.113327026367188 5.134906768798828 5.134906768798828 C 3.113327026367188 7.156496047973633 1.999996185302734 9.844316482543945 1.999996185302734 12.70325660705566 C 1.999996185302734 15.56219673156738 3.113327026367188 18.2500171661377 5.134906768798828 20.2716064453125 C 7.156496047973633 22.29318618774414 9.844316482543945 23.40651702880859 12.70325660705566 23.40651702880859 C 15.56219673156738 23.40651702880859 18.2500171661377 22.29318618774414 20.2716064453125 20.2716064453125 C 22.29318618774414 18.2500171661377 23.40651702880859 15.56219673156738 23.40651702880859 12.70325660705566 C 23.40651702880859 9.844316482543945 22.29318618774414 7.156496047973633 20.2716064453125 5.134906768798828 C 18.2500171661377 3.113327026367188 15.56219673156738 1.999996185302734 12.70325660705566 1.999996185302734 M 12.70325660705566 -3.814697265625e-06 C 19.71906661987305 -3.814697265625e-06 25.40651702880859 5.687446594238281 25.40651702880859 12.70325660705566 C 25.40651702880859 19.71906661987305 19.71906661987305 25.40651702880859 12.70325660705566 25.40651702880859 C 5.687446594238281 25.40651702880859 -3.814697265625e-06 19.71906661987305 -3.814697265625e-06 12.70325660705566 C -3.814697265625e-06 5.687446594238281 5.687446594238281 -3.814697265625e-06 12.70325660705566 -3.814697265625e-06 Z"
                      stroke="none"
                      fill="#fff"
                    />
                  </g>
                  <g
                    id="Polygon_1"
                    data-name="Polygon 1"
                    transform="translate(6.001 12.353) rotate(-150)"
                    fill="#fff"
                  >
                    <path
                      d="M 4.929044723510742 3.619362831115723 L 2.000004529953003 3.619362831115723 L 3.464524507522583 1.666669487953186 L 4.929044723510742 3.619362831115723 Z"
                      stroke="none"
                    />
                    <path
                      d="M 3.464524507522583 2.86102294921875e-06 L 6.929044723510742 4.619362831115723 L 4.291534423828125e-06 4.619362831115723 L 3.464524507522583 2.86102294921875e-06 Z"
                      stroke="none"
                      fill="#fff"
                    />
                  </g>
                  <g
                    id="Rectangle_4"
                    data-name="Rectangle 4"
                    transform="translate(0 11.86) rotate(-22)"
                    fill="#336cf9"
                    stroke="#336cf9"
                    strokeWidth="1"
                  >
                    <rect width="6.929" height="4.619" stroke="none" />
                    <rect
                      x="0.5"
                      y="0.5"
                      width="5.929"
                      height="3.619"
                      fill="none"
                    />
                  </g>
                  <g
                    id="Group_5"
                    data-name="Group 5"
                    transform="translate(15.704 4.888)"
                  >
                    <line
                      id="Line_3"
                      data-name="Line 3"
                      y2="9.239"
                      transform="translate(0 0)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <line
                      id="Line_4"
                      data-name="Line 4"
                      x2="6.929"
                      y2="2.31"
                      transform="translate(0 9.239)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>
              Delivery pay Transactions
            </Link>
          </li>
          <li
            className={`products ${
              location.pathname.startsWith("/account/products")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/products">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19.872"
                  height="21.086"
                  viewBox="0 0 19.872 21.086"
                >
                  <g
                    id="Group_4"
                    data-name="Group 4"
                    transform="translate(0 5.63)"
                  >
                    <g id="Path_288" data-name="Path 288" fill="none">
                      <path
                        d="M1,0H18.872a1,1,0,0,1,1,1V14.456a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0Z"
                        stroke="none"
                      />
                      <path
                        d="M 2 2.000001907348633 L 2 13.45590209960938 L 17.87188148498535 13.45590209960938 L 17.87188148498535 2.000001907348633 L 2 2.000001907348633 M 1 1.9073486328125e-06 L 18.87188148498535 1.9073486328125e-06 C 19.42416000366211 1.9073486328125e-06 19.87188148498535 0.4477119445800781 19.87188148498535 1.000001907348633 L 19.87188148498535 14.45590209960938 C 19.87188148498535 15.00819206237793 19.42416000366211 15.45590209960938 18.87188148498535 15.45590209960938 L 1 15.45590209960938 C 0.4477100372314453 15.45590209960938 0 15.00819206237793 0 14.45590209960938 L 0 1.000001907348633 C 0 0.4477119445800781 0.4477100372314453 1.9073486328125e-06 1 1.9073486328125e-06 Z"
                        stroke="none"
                        fill="#fff"
                      />
                    </g>
                    <g
                      id="Rectangle_3"
                      data-name="Rectangle 3"
                      transform="translate(0 8.832)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <rect
                        width="19.872"
                        height="6.624"
                        rx="2"
                        stroke="none"
                      />
                      <rect
                        x="1"
                        y="1"
                        width="17.872"
                        height="4.624"
                        rx="1"
                        fill="none"
                      />
                    </g>
                  </g>
                  <g
                    id="Rectangle_1134"
                    data-name="Rectangle 1134"
                    transform="translate(4)"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <path
                      d="M2,0h8a2,2,0,0,1,2,2V7a0,0,0,0,1,0,0H0A0,0,0,0,1,0,7V2A2,2,0,0,1,2,0Z"
                      stroke="none"
                    />
                    <rect
                      x="1"
                      y="1"
                      width="10"
                      height="5"
                      rx="1"
                      fill="none"
                    />
                  </g>
                </svg>
              </div>
              Products
            </Link>
          </li>
          <li
            className={`support ${
              location.pathname.startsWith("/account/support")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/support">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19.872"
                  height="21.086"
                  viewBox="0 0 19.872 21.086"
                >
                  <g
                    id="Group_4"
                    data-name="Group 4"
                    transform="translate(0 5.63)"
                  >
                    <g id="Path_288" data-name="Path 288" fill="none">
                      <path
                        d="M1,0H18.872a1,1,0,0,1,1,1V14.456a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0Z"
                        stroke="none"
                      />
                      <path
                        d="M 2 2.000001907348633 L 2 13.45590209960938 L 17.87188148498535 13.45590209960938 L 17.87188148498535 2.000001907348633 L 2 2.000001907348633 M 1 1.9073486328125e-06 L 18.87188148498535 1.9073486328125e-06 C 19.42416000366211 1.9073486328125e-06 19.87188148498535 0.4477119445800781 19.87188148498535 1.000001907348633 L 19.87188148498535 14.45590209960938 C 19.87188148498535 15.00819206237793 19.42416000366211 15.45590209960938 18.87188148498535 15.45590209960938 L 1 15.45590209960938 C 0.4477100372314453 15.45590209960938 0 15.00819206237793 0 14.45590209960938 L 0 1.000001907348633 C 0 0.4477119445800781 0.4477100372314453 1.9073486328125e-06 1 1.9073486328125e-06 Z"
                        stroke="none"
                        fill="#fff"
                      />
                    </g>
                    <g
                      id="Rectangle_3"
                      data-name="Rectangle 3"
                      transform="translate(0 8.832)"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <rect
                        width="19.872"
                        height="6.624"
                        rx="2"
                        stroke="none"
                      />
                      <rect
                        x="1"
                        y="1"
                        width="17.872"
                        height="4.624"
                        rx="1"
                        fill="none"
                      />
                    </g>
                  </g>
                  <g
                    id="Rectangle_1134"
                    data-name="Rectangle 1134"
                    transform="translate(4)"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <path
                      d="M2,0h8a2,2,0,0,1,2,2V7a0,0,0,0,1,0,0H0A0,0,0,0,1,0,7V2A2,2,0,0,1,2,0Z"
                      stroke="none"
                    />
                    <rect
                      x="1"
                      y="1"
                      width="10"
                      height="5"
                      rx="1"
                      fill="none"
                    />
                  </g>
                </svg>
              </div>
              Customer Support
            </Link>
          </li>
          <li
            className={
              location.pathname.startsWith("/account/profile")
                ? "active"
                : undefined
            }
          >
            <Link to="/account/profile">
              <div className="icon acc">
                <img src={user?.profileImg} />
              </div>
              Account
            </Link>
          </li>
        </ul>
        <main>
          <Switch>
            <Route path="/account/deals/:phone?" component={Deals} />
            <Route path="/account/wallet" component={Wallet} />
            <Route path="/account/hold" component={Hold} />
            <Route path="/account/transactions" component={Transactions} />
            <Route path="/account/products" component={Products} />
            <Route path="/account/support" component={Support} />
            <Route path="/account/profile" component={Profile} />
            <Route path="/" component={Home} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
const ProfileAvatar = () => {
  const { user, setUser } = useContext(SiteContext);
  const history = useHistory();
  const menuRef = useRef(null);
  const [menu, setMenu] = useState(false);
  const [invite, setInvite] = useState(false);
  const [noti, setNoti] = useState(false);
  const [unread, setUnread] = useState(false);
  const [msg, setMsg] = useState(null);
  const logout = (e) => {
    console.log(e);
  };
  // <GoogleLogout
  // clientId="978249749020-kjq65au1n373ur5oap7n4ebo2fq1jdhq.apps.googleusercontent.com"
  // buttonText="Logout"
  // onLogoutSuccess={logout}
  // >
  // test
  // </GoogleLogout>
  useEffect(() => {
    if (noti) {
      fetch("/api/editUserProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationLastRead: new Date(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser((prev) => ({
              ...prev,
              notificationLastRead: user.notificationLastRead,
            }));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [noti]);
  useEffect(() => {
    const newNoti = user.notifications.find((item) => {
      return new Date(item.createdAt) > new Date(user.notificationLastRead);
    });
    if (newNoti) {
      setUnread(true);
    }
    if (noti) {
      setUnread(false);
    }
  }, [noti, user]);
  const referLink = `${window.location.origin}/u/join?referer=${user._id}`;
  return (
    <>
      <div className="profile">
        <button
          className={`bell ${unread ? "unread" : ""}`}
          onClick={() => setNoti(true)}
        >
          <svg
            id="bell"
            xmlns="http://www.w3.org/2000/svg"
            width="15.918"
            height="16"
            viewBox="0 0 15.918 16"
          >
            <path
              id="Path_1"
              data-name="Path 1"
              d="M15,14H10a2,2,0,0,1-4,0H1a.961.961,0,0,1-.9-.7,1.068,1.068,0,0,1,.3-1.1A4.026,4.026,0,0,0,2,9V6A6,6,0,0,1,14,6V9a4.026,4.026,0,0,0,1.6,3.2.947.947,0,0,1,.3,1.1A.961.961,0,0,1,15,14Z"
              transform="translate(-0.063)"
              fill="#fff"
              fillRule="evenodd"
            />
          </svg>
        </button>
        <p className="name">
          {user?.firstName + " " + user?.lastName || user.phone}
        </p>
        <img
          src={user?.profileImg}
          className="avatar"
          onClick={() => setMenu(!menu)}
        />
        {menu && (
          <div className="menu" ref={menuRef}>
            <Link className="aboutUs" to="/aboutUs">
              More about us
            </Link>
            <div className="referral">
              <button
                onClick={() => {
                  setInvite(true);
                }}
              >
                Invite now
              </button>
              <p>Refer and earn flat ₹50/- cashback to your wallet</p>
            </div>
            <button
              className="logout"
              onClick={() => {
                fetch("/api/logout")
                  .then((res) => res.json())
                  .then((data) => {
                    setUser(null);
                    history.push("/");
                  })
                  .catch((err) => {
                    console.log(err);
                    setMsg(
                      <>
                        <button onClick={() => setMsg(null)}>Okay</button>
                        <div>
                          <Err_svg />
                          <h4>Could not logout.</h4>
                        </div>
                      </>
                    );
                  });
              }}
            >
              Logout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="31.702"
                height="31.702"
                viewBox="0 0 31.702 31.702"
              >
                <path
                  id="Path_1758"
                  data-name="Path 1758"
                  d="M15.487,25.174l2.483,2.483,8.806-8.806L17.97,10.045l-2.483,2.483,4.544,4.562H3v3.522H20.031ZM31.18,3H6.522A3.521,3.521,0,0,0,3,6.522v7.045H6.522V6.522H31.18V31.18H6.522V24.135H3V31.18A3.521,3.521,0,0,0,6.522,34.7H31.18A3.533,3.533,0,0,0,34.7,31.18V6.522A3.533,3.533,0,0,0,31.18,3Z"
                  transform="translate(-3 -3)"
                  fill="#fc0660"
                />
              </svg>
            </button>
          </div>
        )}
        {noti && (
          <ul className="notiWrapper">
            {user.notifications.reverse().map((item, i) => {
              return (
                <li key={i}>
                  <Moment format="hh:mm">{item.createdAt}</Moment>
                  <p className="title">{item.title}</p>
                  <p className="body">{item.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {menu ||
        (noti && (
          <div
            className="backdrop"
            onClick={() => {
              setMenu(false);
              setNoti(false);
            }}
          />
        ))}
      <Modal
        className="invite"
        open={invite}
        onBackdropClick={() => setInvite(false)}
      >
        <div className="imgWrapper">
          <QRCode value={referLink} size={250} renderAs="svg" />
        </div>
        <div className="shareBtns">
          <EmailShareButton url={referLink}>
            <EmailIcon />
          </EmailShareButton>
          <FacebookShareButton url={referLink}>
            <FacebookIcon />
          </FacebookShareButton>
          <HatenaShareButton url={referLink}>
            <HatenaIcon />
          </HatenaShareButton>
          <InstapaperShareButton url={referLink}>
            <InstapaperIcon />
          </InstapaperShareButton>
          <LineShareButton url={referLink}>
            <LineIcon />
          </LineShareButton>
          <LinkedinShareButton url={referLink}>
            <LinkedinIcon />
          </LinkedinShareButton>
          <LivejournalShareButton url={referLink}>
            <LivejournalIcon />
          </LivejournalShareButton>
          <MailruShareButton url={referLink}>
            <MailruIcon />
          </MailruShareButton>
          <OKShareButton url={referLink}>
            <OKIcon />
          </OKShareButton>
          <PinterestShareButton url={referLink}>
            <PinterestIcon />
          </PinterestShareButton>
          <PocketShareButton url={referLink}>
            <PocketIcon />
          </PocketShareButton>
          <RedditShareButton url={referLink}>
            <RedditIcon />
          </RedditShareButton>
          <TelegramShareButton url={referLink}>
            <TelegramIcon />
          </TelegramShareButton>
          <TumblrShareButton url={referLink}>
            <TumblrIcon />
          </TumblrShareButton>
          <TwitterShareButton url={referLink}>
            <TwitterIcon />
          </TwitterShareButton>
          <ViberShareButton url={referLink}>
            <ViberIcon />
          </ViberShareButton>
          <VKShareButton url={referLink}>
            <VKIcon />
          </VKShareButton>
          <WhatsappShareButton url={referLink}>
            <WhatsappIcon />
          </WhatsappShareButton>
          <WorkplaceShareButton url={referLink}>
            <WorkplaceIcon />
          </WorkplaceShareButton>
        </div>
      </Modal>
    </>
  );
};

export const MilestoneForm = ({ userType, searchClient, onSuccess }) => {
  const { user, setUser } = useContext(SiteContext);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("product");
  const [addressForm, setAddressForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [client, setClient] = useState({
    ...(userType === "seller" ? searchClient : user),
  });
  const [deliveryTime, setDeliveryTime] = useState(
    new Date().toISOString().substring(0, 16)
  );
  const [dscr, setDscr] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState(null);
  const [productResult, setProductResult] = useState([]);
  const [showSelectedProducts, setShowSelectedProducts] = useState(false);
  const searchInput = useRef(null);
  const sellerSubmit = useCallback(
    (e) => {
      e.preventDefault();
      fetch("/api/requestMilestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_id: client._id,
          amount,
          products,
          dscr,
          deliveryDetail: {
            phone: client.phone,
            name: client.firstName + " " + client.lastName,
            ...client.address,
            timeOfDelivery: deliveryTime,
          },
        }),
      })
        .then((res) => res.json())
        .then(({ message, milestone }) => {
          if (milestone) {
            onSuccess?.({ message, milestone });
          } else {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Err_svg />
                  <h4>Could not create milestone.</h4>
                </div>
              </>
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not create milestone. Make sure you're online.</h4>
              </div>
            </>
          );
        });
    },
    [client, searchClient, amount, dscr, type, deliveryTime]
  );
  const buyerSubmit = useCallback(
    (e) => {
      e.preventDefault();
      fetch("/api/createMilestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller: { ...searchClient },
          amount,
          dscr,
          deliveryDetail: {
            phone: client.phone,
            name: client.firstName + " " + client.lastName,
            ...client.address,
            timeOfDelivery: deliveryTime,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          onSuccess?.(data);
        })
        .catch((err) => {
          console.log(err);
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not create milestone. Make sure you're online.</h4>
              </div>
            </>
          );
        });
    },
    [client, searchClient, amount, dscr, type, deliveryTime]
  );
  useEffect(() => {
    if (search) {
      fetch(`/api/products?q=${search}&perPage=8`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setProductResult(data.products);
          }
        });
    }
  }, [search]);
  useEffect(() => {
    if (products.length === 0) {
      setShowSelectedProducts(false);
    }
  }, [products]);
  // <section>
  // <label>Type of Transaction</label>
  // <Combobox
  // defaultValue={0}
  // options={[
  //   {
  //     label: "Product",
  //     value: "product",
  //   },
  //   {
  //     label: "Service",
  //     value: "service",
  //   },
  // ]}
  // onChange={(e) => {
  //   setType(e.value);
  // }}
  // />
  // </section>
  return (
    <>
      <form
        className="milestonesForm"
        onSubmit={userType === "seller" ? sellerSubmit : buyerSubmit}
      >
        <section className="transactionDetail">
          {userType === "seller" && (
            <>
              <section className="products">
                <label>Products</label>
                <div className="count">
                  <p className="totalProduct">
                    {products.length} items selected.
                  </p>
                  {products.length > 0 && (
                    <button
                      type="button"
                      className={showSelectedProducts ? "open" : undefined}
                      onClick={() =>
                        setShowSelectedProducts(!showSelectedProducts)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11.872"
                        height="18"
                        viewBox="0 0 11.872 18"
                      >
                        <path
                          id="Path_36"
                          data-name="Path 36"
                          d="M9,11.872,0,2.725,2.681,0,9,6.423,15.319,0,18,2.725Z"
                          transform="translate(11.872) rotate(90)"
                          fill="rgba(0, 0, 0, 0.5)"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {showSelectedProducts && (
                  <ul>
                    {products.map((product) => (
                      <li key={product._id}>
                        <img src={product.images[0]} />
                        <div className="productDetail">
                          <p className="name">{product.name}</p>
                          <p className="price">₹ {product.price}</p>
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            setProducts((prev) =>
                              prev.filter((item) => item._id !== product._id)
                            )
                          }
                        >
                          <Minus_svg />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="productSearch">
                <label>Search products</label>
                <input
                  ref={searchInput}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && productResult.length > 0 && (
                  <ul className="productSearchList">
                    {productResult.map((product) => (
                      <li key={product._id}>
                        <img src={product.images[0]} />
                        <div className="productDetail">
                          <p className="name">{product.name}</p>
                          <p className="price">₹ {product.price}</p>
                        </div>
                        {!products.some((item) => item._id === product._id) ? (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              setProducts((prev) => [...prev, product]);
                              searchInput.current.focus();
                            }}
                          >
                            <Plus_svg />
                          </button>
                        ) : (
                          <p className="addedLabel">Added</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>{" "}
            </>
          )}
          <section className="amount">
            <label>Amount</label>
            <NumberInput
              min={10}
              defaultValue={0}
              required={true}
              onChange={(e) => setAmount((+e.target.value).toString())}
            />
          </section>
          <section>
            <label>Detail</label>
            <input
              value={dscr}
              required={true}
              onChange={(e) => setDscr(e.target.value)}
            />
          </section>
          <button type="submit">
            {userType === "seller" ? "Request Milestone" : "Create Milestone"}
          </button>
        </section>
        <section className="clientDetail">
          <img src={client?.profileImg} />
          <label>Delivery Address</label>
          <div className="detail" onClick={() => setAddressForm(true)}>
            <button type="button">+ Add/Edit Address</button>
            <section className="profileDetail">
              <p className="name">
                {client?.firstName + " " + client?.lastName}
              </p>
              <p className="phone">{client?.phone}</p>
              <p className="email">{client?.email}</p>
            </section>
            {client?.address?.street && (
              <section className="address">
                <p className="street">
                  {client.address?.street}, {client.address?.city},{" "}
                  {client.address?.zip}
                </p>
              </section>
            )}
          </div>
          {userType === "seller" ? null : (
            <div className="sellerInfo">
              <img src={searchClient?.profileImg} />
              <label>Seller Information</label>
              <div className="detail">
                <section className="profileDetail">
                  <p className="name">
                    {searchClient?.firstName + " " + searchClient?.lastName}
                  </p>
                  <p className="phone">{searchClient?.phone}</p>
                  <p className="email">{searchClient?.email}</p>
                </section>
              </div>
            </div>
          )}
          <div className="deliveryTime">
            <p>Delivery Time</p>
            <input
              value={deliveryTime}
              type="datetime-local"
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>
        </section>
      </form>
      <Modal open={addressForm} className="addAddress">
        <div className="head">
          <p className="modalName">Add/Edit Address</p>
          <button
            onClick={() => {
              setAddressForm(false);
            }}
          >
            <X_svg />
          </button>
        </div>
        <AddressForm
          client={client}
          setClient={setClient}
          onSuccess={(data) => {
            setClient((prev) => ({ ...prev, ...data }));
            setAddressForm(false);
          }}
          onCancel={() => setAddressForm(false)}
        />
      </Modal>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
export default Account;
