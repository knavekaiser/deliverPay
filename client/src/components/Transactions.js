import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Err_svg } from "./Elements";
import { Modal } from "./Modal";
import Moment from "react-moment";

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
              <img
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
              <img src={user.profileImg || "/profile-user.jpg"} />
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
