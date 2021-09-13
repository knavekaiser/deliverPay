import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { SiteContext, ChatContext, socket } from "../SiteContext";
import { Route, Switch, useHistory, Link, useLocation } from "react-router-dom";
import { Modal } from "./Modal.js";
import {
  Err_svg,
  Succ_svg,
  Footer,
  Actions,
  Cart_svg,
  Seller_cart_svg,
  Img,
  Moment,
  Chev_down_svg,
  User,
  LS,
  ShareButtons,
} from "./Elements";
import { CartItem } from "./Marketplace";
require("./styles/marketplace.scss");
require("./styles/account.scss");

const MilestoneForm = lazy(() =>
  import("./Forms").then((mod) => ({ default: mod.MilestoneForm }))
);

const MyShopping = lazy(() => import("./myShopping"));
const Cart = lazy(() =>
  import("./Marketplace").then((mod) => ({ default: mod.Cart }))
);
const SellerCart = lazy(() =>
  import("./Marketplace").then((mod) => ({ default: mod.SellerCart }))
);

const StartTransaction = lazy(() =>
  import("./Transactions").then((mod) => ({ default: mod.StartTransaction }))
);
const Transactions = lazy(() => import("./Transactions"));

const Support = lazy(() => import("./Support"));

const QRCode = lazy(() => import("qrcode.react"));
const Profile = lazy(() => import("./Profile"));
const Hold = lazy(() => import("./Hold"));
const Wallet = lazy(() => import("./Wallet"));
const MyShop = lazy(() => import("./seller/MyShop"));
const Deals = lazy(() => import("./Deals"));
require("./styles/account.scss");
require("./styles/generic.scss");

const Home = () => {
  const { user, userType, setUserType } = useContext(SiteContext);
  const history = useHistory();
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch("/api/recentPayments")
      .then((res) => res.json())
      .then((data) => {
        setRecentPayments(data);
      })
      .catch((err) => {
        console.log(err);
      });
    fetch(
      `/api/getOrders?${new URLSearchParams({
        user: "buyer",
        perPage: 5,
      })}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setRecentOrders(data.orders);
        }
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
      {userType && (
        <>
          <UserSearch setClient={setClient} />
          <div className="recentPayments">
            <p className="label">
              Recently Contacted
              <span className="note">
                {userType === "buyer"
                  ? "Click to start chatting."
                  : "Click to create an order."}
              </span>
            </p>
            <ul className="payments">
              {recentPayments.map((client) => (
                <li key={client._id}>
                  <Link
                    target={userType === "seller" ? "_blank" : ""}
                    to={
                      userType === "buyer"
                        ? `/account/deals/${client._id}`
                        : `/marketplace?${new URLSearchParams({
                            seller: user._id,
                            buyer: client._id,
                          }).toString()}`
                    }
                    onClick={() => {
                      setClient(client);
                      LS.set("buyer", client._id);
                    }}
                  >
                    <Img src={client.profileImg} />
                    <p className="name">
                      {client.firstName + " " + client.lastName}
                    </p>
                  </Link>
                </li>
              ))}
              {recentPayments.length === 0 && <p>Nothing for now.</p>}
            </ul>
          </div>
          <div className="recentOrders">
            <p className="label">
              Recent Orders
              <span className="note">Click to view order details.</span>
            </p>
            <ul className="orders">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${
                    order.status === "pending" ? "pending" : "current"
                  }/${order._id}`}
                >
                  <li>
                    <ul>
                      <li>
                        <label>Seller</label>
                        <p>
                          {order.seller.firstName + " " + order.seller.lastName}
                        </p>
                      </li>
                      <li>
                        <label>QTY</label>
                        <p>{order.products.length}</p>
                      </li>
                      <li>
                        <label>Total</label>
                        <h3>₹{order.total}</h3>
                      </li>
                    </ul>
                  </li>
                </Link>
              ))}
              {recentOrders.length === 0 && <p>Nothing for now.</p>}
            </ul>
          </div>
        </>
      )}
      <Footer />
      <Route path={"/account/home/createMilestone"}>
        <Modal
          open={true && client}
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
          open={true && client}
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

export const UserSearch = ({ setClient }) => {
  const { userType, user } = useContext(SiteContext);
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
    if (value?.length >= 4) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [value]);
  return (
    <div className="search">
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
            onChange={(e) => {
              setValue(e.target.value);
              setShowUsers(true);
            }}
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
            {users.map((client, i) => (
              <Link
                key={i}
                target="_blank"
                onClick={() => {
                  setClient(client);
                  LS.set("buyer", client._id);
                }}
                to={{
                  pathname:
                    userType === "seller"
                      ? `/marketplace?${new URLSearchParams({
                          seller: user._id,
                          buyer: client._id,
                        }).toString()}`
                      : `/marketplace?seller=${client._id}`,
                }}
              >
                <li key={i}>
                  <User user={client} />
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
          <Accordion
            className={`${
              location.pathname.startsWith("/account/transaction")
                ? "active"
                : ""
            }`}
            location={location}
            label={
              <>
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
                      <rect
                        width="20.886"
                        height="16.244"
                        rx="2"
                        stroke="none"
                      />
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
                      <rect
                        width="20.886"
                        height="6.962"
                        rx="2"
                        stroke="none"
                      />
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
                <p className="label">Start Transaction</p>
              </>
            }
            link="/account/transaction"
            path="/account/transaction/new"
          >
            <li
              className={
                location.pathname.startsWith("/account/transaction/new")
                  ? "active"
                  : undefined
              }
            >
              <Link to="/account/transaction/new">Start New</Link>
            </li>
            <li
              className={
                location.pathname.startsWith("/account/transaction/history")
                  ? "active"
                  : undefined
              }
            >
              <Link to="/account/transaction/history">Transaction History</Link>
            </li>
          </Accordion>
          {userType === "buyer" && (
            <Accordion
              className={`${
                location.pathname.startsWith("/account/orders") ? "active" : ""
              }`}
              location={location}
              label={
                <>
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
                        <rect
                          width="20.886"
                          height="16.244"
                          rx="2"
                          stroke="none"
                        />
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
                        <rect
                          width="20.886"
                          height="6.962"
                          rx="2"
                          stroke="none"
                        />
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
                  <p className="label">My Orders</p>
                </>
              }
              link="/account/orders"
              path="/account/orders/current"
            >
              <li
                className={
                  location.pathname.startsWith("/account/orders/current")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/orders/current">Current Order</Link>
              </li>
              <li
                className={
                  location.pathname.startsWith("/account/orders/pending")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/orders/pending">Pending Order</Link>
              </li>
              <li
                className={
                  location.pathname.startsWith("/account/orders/history")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/orders/history">Order History</Link>
              </li>
              <li
                className={
                  location.pathname.startsWith("/account/orders/dispute")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/orders/dispute">Dispute Resolution</Link>
              </li>
              {
                //   <li
                //   className={
                //     location.pathname.startsWith("/account/orders/track")
                //       ? "active"
                //       : undefined
                //   }
                // >
                //   <Link to="/account/orders/track">Track Order</Link>
                // </li>
              }
            </Accordion>
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
              Milestones
            </Link>
          </li>
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
              My Chat
            </Link>
            {unread ? <span className="unred">{unread}</span> : null}
          </li>
          <Accordion
            className={`profile ${
              location.pathname.startsWith("/account/profile") ? "active" : ""
            }`}
            location={location}
            label={
              <>
                <div className="icon acc">
                  <Img src={user?.profileImg || "/profile-user.jpg"} />
                </div>
                <p className="label">Account</p>
              </>
            }
            link="/account/profile"
            path="/account/profile/wallet"
          >
            <>
              <li
                className={
                  location.pathname.startsWith("/account/profile/wallet")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/profile/wallet">Wallet</Link>
              </li>
              <li
                className={
                  location.pathname.startsWith("/account/profile/edit")
                    ? "active"
                    : undefined
                }
              >
                <Link to="/account/profile/edit">Edit Profile</Link>
              </li>
            </>
          </Accordion>
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
        </ul>
        <main>
          <Suspense fallback={<>Loading</>}>
            <Switch>
              <Route path="/account/deals/:_id?" component={Deals} />
              <Route
                path="/account/transaction/history"
                component={Transactions}
              />
              <Route path="/account/transaction" component={StartTransaction} />
              <Route path="/account/orders" component={MyShopping} />
              <Route path="/account/wallet" component={Wallet} />
              <Route path="/account/hold" component={Hold} />
              <Route path="/account/transactions" component={Transactions} />
              <Route path="/account/myShop" component={MyShop} />
              <Route path="/account/cart" component={Cart} />
              <Route path="/account/sellerCart" component={SellerCart} />
              {
                //   <Route
                //   path="/account/orderManagement"
                //   component={OrderManagement}
                // />
              }
              <Route path="/account/support" component={Support} />
              <Route path="/account/profile/edit" component={Profile} />
              <Route path="/account/profile/kyc" component={Profile} />
              <Route path="/account/profile/wallet" component={Wallet} />
              <Route path="/account/profile/customerCare" component={Profile} />
              <Route path="/" component={Home} />
            </Switch>
          </Suspense>
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
              location.pathname.startsWith("/account/orders")
                ? "active"
                : undefined
            }`}
          >
            <Link to="/account/orders/current">
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
  const { user, setUser, cart, sellerCart, userType, setUserType } = useContext(
    SiteContext
  );
  const history = useHistory();
  const [menu, setMenu] = useState(false);
  const [invite, setInvite] = useState(false);
  const [noti, setNoti] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [msg, setMsg] = useState(null);
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
  }, [noti, user]);
  const referLink = `${window.location.origin}/u/join?referer=${user._id}`;
  return (
    <>
      <div className="profile">
        {userType === "buyer" ? (
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
        ) : (
          <Actions
            className="cart"
            icon={
              <>
                <Seller_cart_svg />
                {sellerCart.length > 0 && (
                  <span className="itemCount">
                    {sellerCart.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </>
            }
            clickable={true}
            wrapperClassName="popupCart"
          >
            {sellerCart.map(({ product, qty }, i) => (
              <CartItem key={i} product={product} qty={qty} />
            ))}
            {sellerCart.length > 0 && (
              <li className="actions">
                <Link to="/account/sellerCart">View Order</Link>
              </li>
            )}
            {sellerCart.length === 0 && (
              <p className="placeholder">cart is empty</p>
            )}
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
              <li
                key={i}
                onClick={() => {
                  if (item.link) {
                    if (item.link.includes("/myShop/")) {
                      setUserType("seller");
                    }
                    if (item.link.includes("/account/orders")) {
                      setUserType("buyer");
                    }
                    history.push({
                      pathname: item.link,
                      target: "_blank",
                    });
                  }
                }}
              >
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
                  LS.remove(["userType", "buyer", "localSellerCart"]);
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
        <ShareButtons url={referLink} />
      </Modal>
    </>
  );
};
const Accordion = ({ label, className, location, link, path, children }) => {
  return (
    <li
      className={`accordion ${className || ""} ${
        location.pathname.startsWith(link) && "open"
      }`}
    >
      <Link to={path}>{label}</Link>
      {location.pathname.startsWith(link) && (
        <ul>
          <li>
            <Chev_down_svg />
          </li>
          {children}
        </ul>
      )}
    </li>
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

export default Account;
