import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  lazy,
} from "react";
import { SiteContext, ChatContext } from "../SiteContext";
import { Route, Switch, useHistory, Link, useLocation } from "react-router-dom";
import { Modal } from "./Modal.js";
import {
  Combobox,
  NumberInput,
  Err_svg,
  Succ_svg,
  X_svg,
  Plus_svg,
  Minus_svg,
  Footer,
  Actions,
  Cart_svg,
  calculatePrice,
  Img,
} from "./Elements";
import { AddressForm } from "./Forms";
import Hold from "./Hold.js";
import Transactions from "./Transactions";
import Wallet from "./Wallet";
import MyShop from "./MyShop";
import Support, { SingleTicket } from "./Support";
import Profile from "./Profile";
import Marketplace, { SingleProduct, Cart, CartItem } from "./Marketplace";
import Deals, { socket } from "./_Deals_old";
import MyShopping from "./myShopping";
import OrderManagement from "./OrderManagement";
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
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const QRCode = lazy(() => import("qrcode.react"));
const Moment = lazy(() => import("react-moment"));
require("./styles/account.scss");
require("./styles/generic.scss");

const Home = () => {
  const { userType, setUserType, cart } = useContext(SiteContext);
  const history = useHistory();
  const [value, setValue] = useState("");
  const [users, setUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState(null);
  const milestoneTimeout = useRef();
  const [step, setStep] = useState(3);
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
        <p>Connect with new buyers/sellers.</p>
        {
          // <p>Let us help you make the safest transaction</p>
        }
      </div>
      <div className="userType">
        <div className={`option buyer ${userType === "buyer" && "active"}`}>
          <Img src="/buyer.png" />
          <div className="btn" onClick={(e) => setUserType("buyer")}>
            <p>I am a Buyer </p>
            <div className="radial">
              {userType === "buyer" && <div className="fill" />}
            </div>
          </div>
        </div>
        <div className={`option seller ${userType === "seller" && "active"}`}>
          <Img src="/seller.png" />
          <div className="btn" onClick={(e) => setUserType("seller")}>
            <p>I am a Seller </p>
            <div className="radial">
              {userType === "seller" && <div className="fill" />}
            </div>
          </div>
        </div>
      </div>
      <div className="navigate">
        {step > 1 && (
          <button onClick={() => setStep((prev) => prev - 1)}>Previous</button>
        )}
        <button
          disabled={
            (step === 1 && !client) || (step === 2 && cart.length === 0)
          }
          onClick={() => setStep((prev) => prev + 1)}
          className="next"
        >
          Next
        </button>
      </div>
      {step === 1 && (
        <>
          <UserSearch setClient={setClient} setStep={setStep} />
          {recentPayments.length > 0 && userType && (
            <div className="recentPayments">
              <p className="label">
                Recent Payments
                <span className="note">
                  {userType === "buyer"
                    ? "Click to view all their products."
                    : "Click to request a milestone."}
                </span>
              </p>
              <ul className="payments">
                {recentPayments.map((user) => (
                  <li key={user._id}>
                    <Link
                      to={"#"}
                      onClick={() => {
                        setStep(2);
                        setClient(user);
                      }}
                    >
                      <Img src={user.profileImg} />
                      <p className="name">
                        {user.firstName + " " + user.lastName}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <Switch>
            <Route
              path="/account/home/product/:_id"
              component={SingleProduct}
            />
            <Marketplace />
          </Switch>
        </>
      )}
      {step === 3 && (
        <Route path="/account/home/deals/:_id?" component={Deals} />
      )}
      <Footer />
      <Route path={"/account/home/createMilestone"}>
        <Modal
          open={true}
          head={true}
          label="Create Milestone"
          setOpen={() => {
            history.push("/account/home");
            setClient(null);
          }}
          className="milestoneRequest"
        >
          <MilestoneForm
            action="create"
            client={client}
            onSuccess={(milestone) => {
              history.push("/account/home");
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4 className="amount">₹{milestone?.amount}</h4>
                    <h4>Milestone has been created</h4>
                  </div>
                  <Link to="/account/hold" onClick={() => setMsg(null)}>
                    Check your Delivery pay Hold
                  </Link>
                </>
              );
            }}
          />
        </Modal>
      </Route>
      <Route path={"/account/home/requestMilestone"}>
        <Modal
          open={true}
          head={true}
          label="Request Milestone"
          setOpen={() => {
            history.push("/account/home");
            setClient(null);
          }}
          className="milestoneRequest"
        >
          <MilestoneForm
            action="request"
            client={client}
            onSuccess={(milestone) => {
              history.push("/account/home");
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4 className="amount">₹{milestone?.amount}</h4>
                    <h4>Milestone has been requested</h4>
                  </div>
                  <Link to="/account/hold" onClick={() => setMsg(null)}>
                    Check your Delivery pay Hold
                  </Link>
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

const UserSearch = ({ setClient, setStep }) => {
  const { userType } = useContext(SiteContext);
  const history = useHistory();
  const [msg, setMsg] = useState(null);
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const formRef = useRef();
  const inviteUser = useCallback(() => {
    const phoneReg = new RegExp(/^(\+91|91|1|)(?=\d{10}$)/gi);
    if (phoneReg.test(value.toLowerCase())) {
      fetch(
        `/api/inviteUser?${new URLSearchParams({
          q: "+91" + value.replace(/^(\+91|91|1|)(?=\d{10}$)/g, ""),
          origin: window.location.origin,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.code === "ok") {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  {
                    // <h4>Invitation sent.</h4>
                  }
                  <h4>
                    An invitaion has been sent to{" "}
                    {"+91" + value.replace(/^(\+91|91|1|)(?=\d{10}$)/g, "")}.
                  </h4>
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
  const fetchUsers = () => {
    fetch(`/api/getUsers?q=${encodeURIComponent(value)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUsers(data);
        }
      });
    if (value === "") {
      setUsers([]);
    }
  };
  const documentClickHandler = (e) => {
    if (e.path.includes(formRef.current)) {
    } else {
      setShowUsers(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", documentClickHandler);
    return () => {
      document.removeEventListener("click", documentClickHandler);
    };
  }, []);
  useEffect(() => {
    if (value) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [value]);
  return (
    <div className="search">
      <p>Select existing contact / Add new contact / Invite new contact</p>
      <form onSubmit={(e) => e.preventDefault()} ref={formRef}>
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
            placeholder="Search with Phone Number or Delivery pay ID"
            onFocus={() => setShowUsers(true)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Link
            className={`sendReq ${
              users.length > 0 || !value ? "disabled" : ""
            }`}
            onClick={inviteUser}
            to="#"
          >
            Invite
          </Link>
        </section>
        {showUsers && users.length ? (
          <ul className="searchResult">
            {users.map((user, i) => (
              <Link
                key={i}
                onClick={() => {
                  setStep(2);
                  setClient(user);
                }}
                to={{
                  pathname:
                    userType === "seller"
                      ? "/account/home/createMilestone"
                      : `/account/home?seller=${user._id}`,
                }}
              >
                <li key={i}>
                  <div className="profile">
                    <Img src={user.profileImg} />
                    <p className="name">
                      {user.firstName + " " + user.lastName}
                      <span className="phone">{user.phone}</span>
                    </p>
                  </div>
                  <span className="sendReq">
                    {userType === "seller"
                      ? "Request milestone"
                      : "Show Products & Services"}
                  </span>
                </li>
              </Link>
            ))}
          </ul>
        ) : null}
      </form>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

function Account() {
  const { user, userType } = useContext(SiteContext);
  const { unread } = useContext(ChatContext);
  const location = useLocation();
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);
  return (
    <div
      className={`account ${
        location.pathname.startsWith("/account/deals/") ? "chatSection" : ""
      }`}
    >
      <header>
        <Link to="/">
          <Img className="logo" src="/logo_land.jpg" alt="Delivery pay logo" />
          <Img
            className="logo_small"
            src="/logo_sqr.jpg"
            alt="Delivery pay logo"
          />
        </Link>
        <div className="links">
          <Link to="/" className="home">
            Home
          </Link>
          {userType === "buyer" && <Link to="/marketplace">Browse</Link>}
        </div>
        <UserTypeSwitch />
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
              Open Chat
            </Link>
            {unread ? <span className="unred">{unread}</span> : null}
          </li>
          {userType === "buyer" && (
            <>
              {
                //   <li
                //   className={`${
                //     location.pathname.startsWith("/account/marketplace")
                //       ? "active"
                //       : undefined
                //   }`}
                // >
                //   <Link to="/account/marketplace">
                //     <div className="icon">
                //       <svg
                //         xmlns="http://www.w3.org/2000/svg"
                //         width="26.55"
                //         height="25.219"
                //         viewBox="0 0 26.55 25.219"
                //       >
                //         <path
                //           id="Path_1"
                //           data-name="Path 1"
                //           d="M-242.2-184.285h-13l26.55-10.786-4.252,25.219-5.531-10.637-2.127,4.68v-6.382l7.659-9.148h2.34"
                //           transform="translate(255.198 195.071)"
                //           fill="#fff"
                //         />
                //       </svg>
                //     </div>
                //     Browse
                //   </Link>
                // </li>
              }
              <li
                className={`${
                  location.pathname.startsWith("/account/myShopping")
                    ? "active"
                    : undefined
                }`}
              >
                <Link to="/account/myShopping/orders">
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
                  Open Order Ledger
                </Link>
              </li>
            </>
          )}
          {userType === "seller" && (
            <li
              className={`products ${
                location.pathname.startsWith("/account/myShop")
                  ? "active"
                  : undefined
              }`}
            >
              <Link to="/account/myShop/products">
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
                My Shop
              </Link>
            </li>
          )}
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
                    fill="#3b2ab4"
                    stroke="#3b2ab4"
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
          {
            //     <li
            //       className={`products ${
            //         location.pathname.startsWith("/account/orderManagement")
            //           ? "active"
            //           : undefined
            //       }`}
            //     >
            //       <Link to="/account/orderManagement">
            //         <div className="icon">
            //           <svg
            //             xmlns="http://www.w3.org/2000/svg"
            //             width="19.872"
            //             height="21.086"
            //             viewBox="0 0 19.872 21.086"
            //           >
            //             <g
            //               id="Group_4"
            //               data-name="Group 4"
            //               transform="translate(0 5.63)"
            //             >
            //               <g id="Path_288" data-name="Path 288" fill="none">
            //                 <path
            //                   d="M1,0H18.872a1,1,0,0,1,1,1V14.456a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0Z"
            //                   stroke="none"
            //                 />
            //                 <path
            //                   d="M 2 2.000001907348633 L 2 13.45590209960938 L 17.87188148498535 13.45590209960938 L 17.87188148498535 2.000001907348633 L 2 2.000001907348633 M 1 1.9073486328125e-06 L 18.87188148498535 1.9073486328125e-06 C 19.42416000366211 1.9073486328125e-06 19.87188148498535 0.4477119445800781 19.87188148498535 1.000001907348633 L 19.87188148498535 14.45590209960938 C 19.87188148498535 15.00819206237793 19.42416000366211 15.45590209960938 18.87188148498535 15.45590209960938 L 1 15.45590209960938 C 0.4477100372314453 15.45590209960938 0 15.00819206237793 0 14.45590209960938 L 0 1.000001907348633 C 0 0.4477119445800781 0.4477100372314453 1.9073486328125e-06 1 1.9073486328125e-06 Z"
            //                   stroke="none"
            //                   fill="#fff"
            //                 />
            //               </g>
            //               <g
            //                 id="Rectangle_3"
            //                 data-name="Rectangle 3"
            //                 transform="translate(0 8.832)"
            //                 fill="none"
            //                 stroke="#fff"
            //                 strokeWidth="2"
            //               >
            //                 <rect
            //                   width="19.872"
            //                   height="6.624"
            //                   rx="2"
            //                   stroke="none"
            //                 />
            //                 <rect
            //                   x="1"
            //                   y="1"
            //                   width="17.872"
            //                   height="4.624"
            //                   rx="1"
            //                   fill="none"
            //                 />
            //               </g>
            //             </g>
            //             <g
            //               id="Rectangle_1134"
            //               data-name="Rectangle 1134"
            //               transform="translate(4)"
            //               fill="none"
            //               stroke="#fff"
            //               strokeWidth="2"
            //             >
            //               <path
            //                 d="M2,0h8a2,2,0,0,1,2,2V7a0,0,0,0,1,0,0H0A0,0,0,0,1,0,7V2A2,2,0,0,1,2,0Z"
            //                 stroke="none"
            //               />
            //               <rect
            //                 x="1"
            //                 y="1"
            //                 width="10"
            //                 height="5"
            //                 rx="1"
            //                 fill="none"
            //               />
            //             </g>
            //           </svg>
            //         </div>
            //         Order Management
            //       </Link>
            //     </li>
            //   </>
            // )
          }
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
              Customer Care
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
                <Img src={user?.profileImg || "/profile-user.jpg"} />
              </div>
              Account
            </Link>
          </li>
        </ul>
        <main>
          <Switch>
            <Route path="/account/deals/:_id?" component={Deals} />
            <Route path="/account/wallet" component={Wallet} />
            <Route path="/account/hold" component={Hold} />
            {
              // <Route exact path="/account/marketplace" component={Marketplace} />
              // <Route path="/account/marketplace/:_id" component={SingleProduct} />
            }
            <Route path="/account/transactions" component={Transactions} />
            <Route path="/account/myShop" component={MyShop} />
            <Route path="/account/cart" component={Cart} />
            <Route path="/account/myShopping" component={MyShopping} />
            <Route
              path="/account/orderManagement"
              component={OrderManagement}
            />
            <Route
              path="/account/support/ticket/:_id"
              component={SingleTicket}
            />
            <Route path="/account/support" component={Support} />
            <Route path="/account/profile" component={Profile} />
            <Route path="/" component={Home} />
          </Switch>
        </main>
      </div>
      <ul className="mobileMenu">
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
            location.pathname.startsWith("/account/hold") ? "active" : undefined
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
            Hold
          </Link>
        </li>
        {userType === "seller" ? (
          <li
            className={`trans ${
              location.pathname.startsWith("/account/myShop")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/myShop/products">
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
              My Shop
            </Link>
          </li>
        ) : (
          <li
            className={`trans ${
              location.pathname.startsWith("/account/myShopping")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/myShopping/orders">
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
              My Orders
            </Link>
          </li>
        )}
        {
          //   <li
          //   className={`trans ${
          //     location.pathname.startsWith("/account/transactions")
          //       ? "active"
          //       : undefined
          //   }`}
          // >
          //   <Link to="/account/transactions">
          //     <div className="icon">
          //       <svg
          //         id="Group_283"
          //         data-name="Group 283"
          //         xmlns="http://www.w3.org/2000/svg"
          //         width="28.407"
          //         height="25.407"
          //         viewBox="0 0 28.407 25.407"
          //       >
          //         <g
          //           id="Path_4"
          //           data-name="Path 4"
          //           transform="translate(3)"
          //           fill="none"
          //         >
          //           <path
          //             d="M12.7,0A12.7,12.7,0,1,1,0,12.7,12.7,12.7,0,0,1,12.7,0Z"
          //             stroke="none"
          //           />
          //           <path
          //             d="M 12.70325660705566 1.999996185302734 C 9.844316482543945 1.999996185302734 7.156496047973633 3.113327026367188 5.134906768798828 5.134906768798828 C 3.113327026367188 7.156496047973633 1.999996185302734 9.844316482543945 1.999996185302734 12.70325660705566 C 1.999996185302734 15.56219673156738 3.113327026367188 18.2500171661377 5.134906768798828 20.2716064453125 C 7.156496047973633 22.29318618774414 9.844316482543945 23.40651702880859 12.70325660705566 23.40651702880859 C 15.56219673156738 23.40651702880859 18.2500171661377 22.29318618774414 20.2716064453125 20.2716064453125 C 22.29318618774414 18.2500171661377 23.40651702880859 15.56219673156738 23.40651702880859 12.70325660705566 C 23.40651702880859 9.844316482543945 22.29318618774414 7.156496047973633 20.2716064453125 5.134906768798828 C 18.2500171661377 3.113327026367188 15.56219673156738 1.999996185302734 12.70325660705566 1.999996185302734 M 12.70325660705566 -3.814697265625e-06 C 19.71906661987305 -3.814697265625e-06 25.40651702880859 5.687446594238281 25.40651702880859 12.70325660705566 C 25.40651702880859 19.71906661987305 19.71906661987305 25.40651702880859 12.70325660705566 25.40651702880859 C 5.687446594238281 25.40651702880859 -3.814697265625e-06 19.71906661987305 -3.814697265625e-06 12.70325660705566 C -3.814697265625e-06 5.687446594238281 5.687446594238281 -3.814697265625e-06 12.70325660705566 -3.814697265625e-06 Z"
          //             stroke="none"
          //             fill="#fff"
          //           />
          //         </g>
          //         <g
          //           id="Polygon_1"
          //           data-name="Polygon 1"
          //           transform="translate(6.001 12.353) rotate(-150)"
          //           fill="#fff"
          //         >
          //           <path
          //             d="M 4.929044723510742 3.619362831115723 L 2.000004529953003 3.619362831115723 L 3.464524507522583 1.666669487953186 L 4.929044723510742 3.619362831115723 Z"
          //             stroke="none"
          //           />
          //           <path
          //             d="M 3.464524507522583 2.86102294921875e-06 L 6.929044723510742 4.619362831115723 L 4.291534423828125e-06 4.619362831115723 L 3.464524507522583 2.86102294921875e-06 Z"
          //             stroke="none"
          //             fill="#fff"
          //           />
          //         </g>
          //         <g
          //           id="Rectangle_4"
          //           data-name="Rectangle 4"
          //           transform="translate(0 11.86) rotate(-22)"
          //           fill="#336cf9"
          //           stroke="#336cf9"
          //           strokeWidth="1"
          //         >
          //           <rect width="6.929" height="4.619" stroke="none" />
          //           <rect
          //             x="0.5"
          //             y="0.5"
          //             width="5.929"
          //             height="3.619"
          //             fill="none"
          //           />
          //         </g>
          //         <g
          //           id="Group_5"
          //           data-name="Group 5"
          //           transform="translate(15.704 4.888)"
          //         >
          //           <line
          //             id="Line_3"
          //             data-name="Line 3"
          //             y2="9.239"
          //             transform="translate(0 0)"
          //             fill="none"
          //             stroke="#fff"
          //             strokeWidth="2"
          //           />
          //           <line
          //             id="Line_4"
          //             data-name="Line 4"
          //             x2="6.929"
          //             y2="2.31"
          //             transform="translate(0 9.239)"
          //             fill="none"
          //             stroke="#fff"
          //             strokeWidth="2"
          //           />
          //         </g>
          //       </svg>
          //     </div>
          //     Transactions
          //   </Link>
          // </li>
        }
      </ul>
    </div>
  );
}
export const ProfileAvatar = () => {
  const { user, setUser, cart, setCart, userType } = useContext(SiteContext);
  const history = useHistory();
  const menuRef = useRef(null);
  const [menu, setMenu] = useState(false);
  const [invite, setInvite] = useState(false);
  const [noti, setNoti] = useState(false);
  const [unread, setUnread] = useState(false);
  const [showCart, setShowCart] = useState(false);
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
              notificationLastRead: data.user.notificationLastRead,
            }));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [noti]);
  useEffect(() => {
    const newNoti = user.notifications?.find((item) => {
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
        {
          // <UserTypeSwitch />
        }
        {userType === "buyer" && (
          <Actions
            className="cart"
            icon={
              <>
                <Cart_svg />
                {cart.length > 0 && (
                  <span className="itemCount">
                    {cart.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </>
            }
            clickable={true}
            wrapperClassName="popupCart"
          >
            {cart.map(({ product, qty }, i) => (
              <CartItem key={i} product={product} qty={qty} />
            ))}
            {cart.length > 0 && (
              <li className="actions">
                <Link to="/account/cart">View Cart</Link>
                {
                  // <Link to="/account/checkout">Place order</Link>
                }
              </li>
            )}
            {cart.length === 0 && <p className="placeholder">cart is empty</p>}
          </Actions>
        )}
        <Actions
          icon={
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
          }
          wrapperClassName="notiWrapper"
          onClick={() => setNoti(true)}
        >
          {[...user.notifications].reverse().map((item, i) => {
            return (
              <li key={i}>
                <Moment format="hh:mm">{item.createdAt}</Moment>
                <p className="title">{item.title}</p>
                <p className="body">{item.body}</p>
              </li>
            );
          })}
        </Actions>
        {
          //   <p className="name">
          //   {user?.firstName + " " + user?.lastName || user.phone}
          // </p>
        }
        <Actions
          wrapperClassName="menu"
          className="avatar"
          icon={
            <>
              <Img
                src={user?.profileImg || "/profile-user.jpg"}
                onClick={() => setMenu(!menu)}
              />
              {userType && <p className="userTypeTag">{userType}</p>}
            </>
          }
        >
          <p className="name">
            {user?.firstName + " " + user?.lastName || user.phone}
          </p>
          <UserTypeSwitch tip={true} />
          <Link className="link" to="/account">
            Dashboard
          </Link>
          <Link className="link trans" to="/account/transactions">
            Transactions
          </Link>
          <Link className="link settings" to="/account/profile">
            Settings
          </Link>
          <Link className="link" to="/aboutUs">
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
        </Actions>
      </div>
      <Modal
        className="invite"
        open={invite}
        onBackdropClick={() => setInvite(false)}
      >
        <div className="imgWrapper" onClick={() => setInvite(false)}>
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

const UserTypeSwitch = ({ tip }) => {
  const { userType, setUserType } = useContext(SiteContext);
  return (
    <div className="userTypeSwitch">
      <label>Browse as</label>
      <ul className="options">
        <li
          className={userType === "buyer" ? "active" : ""}
          onClick={() => setUserType("buyer")}
        >
          Buyer
        </li>
        <li
          className={userType === "seller" ? "active" : ""}
          onClick={() => setUserType("seller")}
        >
          Seller
        </li>
      </ul>
      {tip && (
        <>
          <div className="break" />
          {userType === "seller" ? (
            <p className="note">
              As a seller, you can manage your
              <br /> product listing, order, refunds and general shop settings.
            </p>
          ) : (
            <p className="note">
              As a buyer, you can manage your
              <br /> perchase orders, payments and deals.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export const MilestoneForm = ({
  action,
  client,
  onSuccess,
  definedAmount,
  order,
  refund,
  strict,
}) => {
  const { user, setUser, config } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  // const [type, setType] = useState("product");
  const [addressForm, setAddressForm] = useState(false);
  // const [products, setProducts] = useState([]);
  const [userDetail, setUserDetail] = useState({ ...user });
  const [clientDetail, setClientDetail] = useState({ ...client });
  // const [deliveryTime, setDeliveryTime] = useState(
  //   new Date().toISOString().substring(0, 16)
  // );
  const [dscr, setDscr] = useState("");
  const [amount, setAmount] = useState(definedAmount || "");
  const [fee, setFee] = useState(0);
  const [msg, setMsg] = useState(null);
  // const [productResult, setProductResult] = useState([]);
  // const [showSelectedProducts, setShowSelectedProducts] = useState(false);
  // const searchInput = useRef(null);
  const onTimeout = useRef();
  const requestMilestone = useCallback(() => {
    fetch("/api/requestMilestone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: client._id,
        amount,
        // products,
        dscr,
        order,
        refund,
        // deliveryDetail: {
        //   phone: client.phone,
        //   name: client.firstName + " " + client.lastName,
        //   ...client.address,
        //   timeOfDelivery: deliveryTime,
        // },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.milestone);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not request milestone. Try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not request milestone. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [
    clientDetail,
    userDetail,
    amount,
    dscr,
    // type,
    // deliveryTime,
  ]);
  const createMilestone = useCallback(() => {
    fetch("/api/createMilestone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller: { ...clientDetail },
        amount,
        dscr,
        order,
        refund,
        // deliveryDetail: {
        //   phone: client.phone,
        //   name: client.firstName + " " + client.lastName,
        //   ...client.address,
        //   timeOfDelivery: deliveryTime,
        // },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.({ ...data });
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Insufficient fund</h4>
                <Link to="/account/wallet">Add Money to your wallet now.</Link>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not create milestone. Try again</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
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
  }, [
    clientDetail,
    userDetail,
    amount,
    dscr,
    // type,
    // deliveryTime,
  ]);
  useEffect(() => {
    setFee(() => {
      return ((+amount / 100) * config.fee).fix();
    });
  }, [amount]);
  // useEffect(() => {
  //   if (search) {
  //     fetch(`/api/products?q=${search}&perPage=8`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.products) {
  //           setProductResult(data.products);
  //         }
  //       });
  //   }
  // }, [search]);
  // useEffect(() => {
  //   if (products.length === 0) {
  //     setShowSelectedProducts(false);
  //   }
  // }, [products]);
  return (
    <>
      <form
        className="milestonesForm"
        onSubmit={(e) => {
          setLoading(true);
          e.preventDefault();
          toast(
            <div className="toast">
              Milestone is being{" "}
              {action === "create" ? "created." : "requested."}{" "}
              <button
                className="undo"
                onClick={() => {
                  onTimeout.current = null;
                }}
              >
                Undo
              </button>
            </div>,
            {
              position: "bottom-center",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              onClose: () => {
                onTimeout.current?.();
                setLoading(false);
              },
              draggable: true,
              progress: undefined,
            }
          );
          if (action === "create") {
            onTimeout.current = createMilestone;
          } else {
            onTimeout.current = requestMilestone;
          }
        }}
      >
        <section className="transactionDetail">
          {
            // userType === "seller"
            //  && (
            //   <>
            //     <section className="products">
            //       <label>Products</label>
            //       <div className="count">
            //         <p className="totalProduct">
            //           {products.length} items selected.
            //         </p>
            //         {products.length > 0 && (
            //           <button
            //             type="button"
            //             className={showSelectedProducts ? "open" : undefined}
            //             onClick={() =>
            //               setShowSelectedProducts(!showSelectedProducts)
            //             }
            //           >
            //             <svg
            //               xmlns="http://www.w3.org/2000/svg"
            //               width="11.872"
            //               height="18"
            //               viewBox="0 0 11.872 18"
            //             >
            //               <path
            //                 id="Path_36"
            //                 data-name="Path 36"
            //                 d="M9,11.872,0,2.725,2.681,0,9,6.423,15.319,0,18,2.725Z"
            //                 transform="translate(11.872) rotate(90)"
            //                 fill="rgba(0, 0, 0, 0.5)"
            //               />
            //             </svg>
            //           </button>
            //         )}
            //       </div>
            //       {showSelectedProducts && (
            //         <ul>
            //           {products.map((product) => (
            //             <li key={product._id}>
            //               <Img src={product.images[0]} />
            //               <div className="productDetail">
            //                 <p className="name">{product.name}</p>
            //                 <p className="price">₹ {product.price}</p>
            //               </div>
            //               <button
            //                 type="button"
            //                 className="btn"
            //                 onClick={() =>
            //                   setProducts((prev) =>
            //                     prev.filter((item) => item._id !== product._id)
            //                   )
            //                 }
            //               >
            //                 <Minus_svg />
            //               </button>
            //             </li>
            //           ))}
            //         </ul>
            //       )}
            //     </section>
            //     <section className="productSearch">
            //       <label>Search products</label>
            //       <input
            //         ref={searchInput}
            //         type="text"
            //         value={search}
            //         onChange={(e) => setSearch(e.target.value)}
            //       />
            //       {search && productResult.length > 0 && (
            //         <ul className="productSearchList">
            //           {productResult.map((product) => (
            //             <li key={product._id}>
            //               <Img src={product.images[0]} />
            //               <div className="productDetail">
            //                 <p className="name">{product.name}</p>
            //                 <p className="price">₹ {product.price}</p>
            //               </div>
            //               {!products.some(
            //                 (item) => item._id === product._id
            //               ) ? (
            //                 <button
            //                   type="button"
            //                   className="btn"
            //                   onClick={() => {
            //                     setProducts((prev) => [...prev, product]);
            //                     searchInput.current.focus();
            //                   }}
            //                 >
            //                   <Plus_svg />
            //                 </button>
            //               ) : (
            //                 <p className="addedLabel">Added</p>
            //               )}
            //             </li>
            //           ))}
            //         </ul>
            //       )}
            //     </section>{" "}
            //   </>
            // )
          }
          <section className="amount">
            <label>Amount</label>
            <NumberInput
              readOnly={strict}
              min={10}
              defaultValue={definedAmount || 0}
              required={true}
              onChange={(e) => setAmount((+e.target.value).toString())}
            />
          </section>
          {amount && (
            <>
              {action === "create" && (
                <label className="receivable">
                  {client.firstName} {client.lastName} will recieve ₹
                  {(amount - fee).fix()}
                </label>
              )}
              {action === "request" && (
                <label className="receivable">
                  You will recieve ₹{(amount - fee).fix()}
                </label>
              )}
            </>
          )}
          <section>
            <label>Detail</label>
            <input
              value={dscr}
              required={true}
              onChange={(e) => setDscr(e.target.value)}
            />
          </section>
          <button type="submit">
            {action === "create" ? "Create Milestone" : "Request Milestone"}
          </button>
        </section>
        <section className="clientDetail">
          {action === "request" && (
            <>
              <Img src={client?.profileImg || "/profile-user.jpg"} />
              <label>Buyer Information</label>
              <div
                className="detail"
                onClick={() => {
                  // setAddressForm(true)
                }}
              >
                {
                  // <button type="button">+ Add/Edit Address</button>
                }
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
            </>
          )}
          {action === "request" ? null : (
            <div className="sellerInfo">
              <Img src={clientDetail?.profileImg || "/profile-user.jpg"} />
              <label>Seller Information</label>
              <div className="detail">
                <section className="profileDetail">
                  <p className="name">
                    {clientDetail?.firstName} {clientDetail?.lastName}
                  </p>
                  <p className="phone">{clientDetail?.phone}</p>
                  <p className="email">{clientDetail?.email}</p>
                </section>
              </div>
            </div>
          )}
          {
            //   <div className="deliveryTime">
            //   <p>Delivery Time</p>
            //   <input
            //     value={deliveryTime}
            //     type="datetime-local"
            //     onChange={(e) => setDeliveryTime(e.target.value)}
            //   />
            // </div>
          }
        </section>
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      {
        //   <Modal
        //   open={addressForm}
        //   head={true}
        //   label="Add/Edit Address"
        //   setOpen={setAddressForm}
        //   className="addAddress"
        // >
        //   <AddressForm
        //     client={client}
        //     // setClient={setClient}
        //     onSuccess={(data) => {
        //       console.log(data);
        //       // setClient((prev) => ({ ...prev, ...data }));
        //       setAddressForm(false);
        //     }}
        //     onCancel={() => setAddressForm(false)}
        //   />
        // </Modal>
      }
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
export default Account;
