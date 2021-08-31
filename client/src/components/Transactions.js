import { useEffect, useState, useContext, lazy, useRef } from "react";
import { useHistory, Link, Route } from "react-router-dom";
import { SiteContext } from "../SiteContext";
import { UserSearch } from "./Account";
import { Err_svg, Img, Moment, Succ_svg } from "./Elements";
import { Modal } from "./Modal";
const MilestoneForm = lazy(() =>
  import("./Forms").then((mod) => ({ default: mod.MilestoneForm }))
);

export const StartTransaction = () => {
  const { userType } = useContext(SiteContext);
  const history = useHistory();
  const [value, setValue] = useState("");
  const [users, setUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState(null);
  const milestoneTimeout = useRef();
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
      <UserSearch setClient={setClient} />
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
                target={userType === "buyer" ? "_blank" : ""}
                // to={`/account/marketplace?seller=${user._id}`}
                to={
                  userType === "buyer"
                    ? `/marketplace?seller=${user._id}`
                    : "/account/home/requestMilestone"
                }
                onClick={() => {
                  setClient(user);
                }}
              >
                <Img src={user.profileImg} />
                <p className="name">{user.firstName + " " + user.lastName}</p>
              </Link>
            </li>
          ))}
          {recentPayments.length === 0 && <p>Nothing for now</p>}
        </ul>
      </div>
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

const Transactions = ({ history, location, match }) => {
  const [transactions, setTransactions] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch("/api/transactions?type=P2PTransaction")
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setTransactions(data);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not get transactions.</h4>
            </div>
          </>
        );
      });
  }, []);
  return (
    <div className="transactionContainer">
      <p className="benner">Completed Delivery pay Hold Transactions</p>
      <ul className="transactions">
        {transactions.map((transaction) => (
          <SingleTransaction key={transaction._id} transaction={transaction} />
        ))}
        {transactions.length === 0 && (
          <p className="placeholder">No transaction yet.</p>
        )}
      </ul>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const SingleTransaction = ({ transaction }) => {
  const { user } = useContext(SiteContext);
  return (
    <li className={`transaction ${transaction.amount > 0 ? "in" : "out"}`}>
      <div className={`transactionDetail`}>
        <div className="profile">
          {transaction.client ? (
            <>
              <Img
                src={transaction.client._id?.profileImg || "/profile-user.jpg"}
              />
              <p className="name">
                {transaction.client.firstName +
                  " " +
                  transaction.client.lastName}
              </p>
            </>
          ) : (
            <>
              <Img src={user.profileImg || "/profile-user.jpg"} />
              <p className="name">{user.firstName + " " + user.lastName}</p>
            </>
          )}
        </div>
      </div>
      <ul>
        <li>
          <p>Role</p>-
          <p className="role">{transaction.amount > 0 ? "Seller" : "Buyer"}</p>
        </li>
        <li>
          <p>Product detail</p>-<p>{transaction.dscr || "-"}</p>
        </li>
        <li>
          <p>Transaction ID</p>-<p>{transaction._id}</p>
        </li>
      </ul>
      <ul className="amountDate">
        <li>
          <p>Amount</p>-<p className="amount">₹{transaction.amount.fix()}</p>
        </li>
        <li>
          <p>Hold Date</p>-
          <p>
            <Moment format="MMM DD, YYYY, hh:mm a">
              {transaction.createdAt}
            </Moment>
          </p>
        </li>
        <li>
          <p>Released Date</p>-
          <p>
            <Moment format="MMM DD, YYYY, hh:mm a">
              {transaction.milestoneId?.releaseDate || "--"}
            </Moment>
          </p>
        </li>
      </ul>
      <ul className="statusMethod">
        <li>
          <p>Status</p>-
          <p className="status">{transaction.milestoneId?.status || "--"}</p>
        </li>
        <li>
          <p>Released to</p>-<p>{transaction.amount < 0 ? "Seller" : "--"}</p>
        </li>
        <li>
          <p>Verification Method</p>-
          <p>{transaction.milestoneId?.verification || "--"}</p>
        </li>
      </ul>
    </li>
  );
};

export default Transactions;
