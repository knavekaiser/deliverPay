import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
  lazy,
} from "react";
import {
  Succ_svg,
  Err_svg,
  Plus_svg,
  X_svg,
  Combobox,
  Pagination,
  Checkbox,
  calculateDiscount,
  calculatePrice,
  Actions,
  Chev_down_svg,
  User,
  Arrow_left_svg,
  Media,
  Img,
  Moment,
  moment,
  InputDateRange,
} from "../Elements";
import { Link, useHistory } from "react-router-dom";
import { SiteContext } from "../../SiteContext";
import { Modal, Confirm } from "../Modal";
import { toast } from "react-toastify";
const MilestoneForm = lazy(() =>
  import("../Forms").then((mod) => ({ default: mod.MilestoneForm }))
);

const Refunds = ({ history, location }) => {
  const { userType } = useContext(SiteContext);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState({
    column: "createdAt",
    order: "dsc",
  });
  const [dateRange, setDateRange] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batch, setBatch] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const startDate = moment({
      time: dateRange?.startDate,
      format: "YYYY-MM-DD",
    });
    const endDate = moment({
      time: new Date(dateRange?.endDate)?.setHours(24, 0, 0, 0),
      format: "YYYY-MM-DD",
    });
    fetch(
      `/api/getRefunds?${new URLSearchParams({
        user: userType,
        ...(search && { q: search }),
        page,
        perPage,
        sort: sort.column,
        order: sort.order,
        ...(dateRange && {
          dateFrom: startDate,
          dateTo: endDate,
        }),
        ...(status && { status }),
      })}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setRefunds(data.refunds);
          setTotal(data.total);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not get orders.</h4>
            </div>
          </>
        );
      });
  }, [search, page, perPage, dateRange, status]);
  useEffect(() => {
    if (selectAll) {
    } else {
      setBatch([]);
    }
  }, [selectAll]);
  useEffect(() => {
    if (batch.length === 0) {
      setSelectAll(false);
    }
  }, [batch]);
  return (
    <>
      <div className="benner">
        <p>My Refunds</p>
      </div>
      <div className="filters">
        <section>
          <label>Total:</label>
          {total}
        </section>
        <section>
          <label>Per Page:</label>
          <Combobox
            defaultValue={0}
            options={[
              { label: "20", value: 20 },
              { label: "30", value: 30 },
              { label: "50", value: 50 },
            ]}
            onChange={(e) => setPerPage(e.value)}
          />
        </section>
        <section className="search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            viewBox="0 0 23 23"
          >
            <path
              id="Icon_ionic-ios-search"
              data-name="Icon ionic-ios-search"
              d="M27.23,25.828l-6.4-6.455a9.116,9.116,0,1,0-1.384,1.4L25.8,27.188a.985.985,0,0,0,1.39.036A.99.99,0,0,0,27.23,25.828ZM13.67,20.852a7.2,7.2,0,1,1,5.091-2.108A7.155,7.155,0,0,1,13.67,20.852Z"
              transform="translate(-4.5 -4.493)"
              fill="#707070"
              opacity="0.74"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Customer"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X_svg />
            </button>
          )}
        </section>
        <section className="category">
          <label>Status:</label>
          <Combobox
            defaultValue={0}
            options={[
              { label: "All", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Product Sent", value: "productSent" },
              { label: "Product Recieved", value: "productRecieved" },
              { label: "Resolved", value: "resolved" },
            ]}
            onChange={(e) => setStatus(e.value)}
          />
        </section>
        <section className={`date`}>
          <InputDateRange
            dateRange={dateRange}
            onChange={(range) => setDateRange(range)}
          />
        </section>
      </div>
      {batch.length > 0 && (
        <div className="batchAction">
          <button onClick={() => console.log("batch delete")}>Delete</button>
        </div>
      )}
      <table className="table refunds">
        <thead>
          <tr>
            {
              //   <th className="checkContainer">
              //   <Checkbox
              //     value={selectAll}
              //     defaultValue={selectAll}
              //     onChange={(e) => setSelectAll(e)}
              //   />
              // </th>
            }
            <th className="date">Date</th>
            <th>Customer</th>
            <th>QTY</th>
            <th>Status</th>
            <th>Total Price</th>
            {
              // <th>Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          {refunds.map((refund) => (
            <SingleRefund
              key={refund._id}
              refund={refund}
              setRefunds={setRefunds}
              selectAll={selectAll}
              setBatch={setBatch}
              batch={batch}
            />
          ))}
          {refunds.length === 0 && (
            <tr className="placeholder">
              <td>No product yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        total={total}
        btns={5}
        currentPage={page}
        perPage={perPage}
        setPage={setPage}
      />
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
const SingleRefund = ({ refund, setRefunds, selectAll, setBatch, batch }) => {
  const history = useHistory();
  const { user } = useContext(SiteContext);
  const [selected, setSelected] = useState(selectAll || false);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState(false);
  useEffect(() => {
    setSelected(selectAll);
  }, [selectAll]);
  useEffect(() => {
    if (selected) {
      setBatch((prev) => [...prev, refund._id]);
    } else {
      setBatch((prev) => prev.filter((item) => item !== refund._id));
    }
  }, [selected]);
  return (
    <>
      <tr
        className={`refund ${selected ? "selected" : ""}`}
        onClick={() => history.push(`/account/myShop/refunds/${refund._id}`)}
      >
        {
          //   <td className="checkContainer">
          //   <Checkbox
          //     defaultValue={selected}
          //     value={selected}
          //     onChange={(e) => {
          //       setSelected(e);
          //     }}
          //   />
          // </td>
        }
        <td className="date">
          <Moment format="DD MMM YYYY, hh:mm a">{refund.createdAt}</Moment>
        </td>
        <td>
          <User user={refund.seller} />
        </td>
        <td>{refund.order?.products.reduce((a, c) => a + c.qty, 0)}</td>
        <td>{refund.status}</td>
        <td>₹{refund.order.total}</td>
        {
          //   <td>
          //   {batch.length === 0 && (
          //     <Actions icon={<Chev_down_svg />}>
          //       <Link to="#" className="edit" onClick={() => setEdit(true)}>
          //         Edit
          //       </Link>
          //       <Link
          //         to="#"
          //         className="delete"
          //         onClick={() =>
          //           Confirm({
          //             label: "Removing Product",
          //             question: "You sure want to delete this product?",
          //             callback: removeProduct,
          //           })
          //         }
          //       >
          //         Delete
          //       </Link>
          //     </Actions>
          //   )}
          // </td>
        }
      </tr>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
export const FullRefund = ({ history, match }) => {
  const { userType } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [refund, setRefund] = useState(null);
  const [order, setOrder] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState(false);
  const [refundTill, setRefundTill] = useState(false);
  const milestoneTimeout = useRef();
  // const updateOrder = async (newData) => {
  //   return fetch("/api/updateRefund", {
  //     method: "PATCH",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(newData),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.code === "ok") {
  //         return data.order;
  //       } else {
  //         setMsg(
  //           <>
  //             <button onClick={() => setMsg(null)}>Okay</button>
  //             <div>
  //               <Err_svg />
  //               <h4>Orders does not exist.</h4>
  //             </div>
  //           </>
  //         );
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       setMsg(
  //         <>
  //           <button onClick={() => setMsg(null)}>Okay</button>
  //           <div>
  //             <Err_svg />
  //             <h4>Could not update order. Make sure you're online.</h4>
  //           </div>
  //         </>
  //       );
  //     });
  // };
  const updateRefund = async (newData) => {
    return fetch("/api/updateRefund", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, _id: refund._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          return data.order;
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Refund request does not exist.</h4>
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
              <h4>Could not update refund. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const acceptRefund = async () => {
    fetch("/api/acceptRefund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: refund._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setRefund((prev) => ({ ...prev, status: "approved" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Refund request has been approved.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Refund request does not exist.</h4>
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
              <h4>Could not accept refund request. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const declineRefund = async () => {
    fetch("/api/declineRefund", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: refund._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setRefund((prev) => ({ ...prev, status: "declined" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Refund request has been declined.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Refund request does not exist.</h4>
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
              <h4>
                Could not decline refund request. Make sure you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    fetch(`/api/singleRefund?_id=${match.params._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder(data.refund.order);
          setRefund(data.refund);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Refund does not exist.</h4>
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
              <h4>Could not get Refund. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, []);
  useEffect(() => {
    if (order?.refundable) {
      let days = 0;
      switch (order.refundable) {
        case "Upto 24 Hours After Delivery":
          days = 1;
          break;
        case "Upto 7 Days After Delivery":
          days = 7;
          break;
        case "Upto 15 Days After Delivery":
          days = 15;
          break;
        default:
          return;
      }
      const refundTill = new Date(
        new Date().getTime() + 1000 * 60 * 60 * 24 * days
      );
      if (new Date() < refundTill) {
        setRefundTill(refundTill);
      } else {
        setRefundTill(null);
      }
    } else {
      setRefundTill(null);
    }
  }, [refund]);
  if (refund) {
    return (
      <>
        <div className="actions">
          <Link
            to={`/account/${
              userType === "seller" ? "myShop" : "myShopping"
            }/refunds`}
            className="back"
          >
            <Arrow_left_svg />
            Back
          </Link>
          {refund.status === "productSent" && (
            <button
              onClick={() =>
                Confirm({
                  label: "Refund Resolved",
                  question: "You sure want to mark this refund resolved?",
                  callback: () => {
                    updateRefund({ status: "productRecieved" }).then(
                      (refund) => {
                        setRefund((prev) => ({
                          ...prev,
                          status: "productRecieved",
                        }));
                      }
                    );
                  },
                })
              }
            >
              Mark as Recieved
            </button>
          )}
          {refund.status === "pending" && (
            <>
              <button
                onClick={() =>
                  Confirm({
                    label: "Accepting Refund",
                    question: "Do you accept this refund request?",
                    callback: acceptRefund,
                  })
                }
              >
                Accept
              </button>
              <button
                onClick={() =>
                  Confirm({
                    label: "Declining Refund",
                    question: "Do you decline this refund?",
                    callback: declineRefund,
                  })
                }
              >
                Decline
              </button>
            </>
          )}
        </div>
        <div className="singleOrder">
          <div className="summery">
            <h3>Summery</h3>
            <ul>
              <li className="devide">
                <label>Order</label>
                <span />
              </li>
              <li>
                <label>Seller</label>
                <User user={order.seller} />
              </li>
              <li>
                <label>Order ID</label>
                {order._id}
              </li>
              <li>
                <label>Status</label>
                {order.status}
              </li>
              <li>
                <label>Ordered at</label>
                <Moment format="DD MMM YYYY, hh:mma">{order.createdAt}</Moment>
              </li>
              <li>
                <label>Delivered at</label>
                <Moment format="DD MMM YYYY, hh:mm a">
                  {order.deliveredAt}
                </Moment>
              </li>
              <li>
                <label>Refundable</label>
                {order.refundable || "N/A"}
              </li>
              <li>
                <label>Proof of delivery</label>
                {order.files?.length > 0 ? (
                  <div className="thumbs">
                    <Media links={order.files} />
                  </div>
                ) : (
                  <>No files added.</>
                )}
              </li>
              {refundTill && (
                <li>
                  <label>Refund till</label>
                  <Moment format="DD MMM YYYY, hh:mm a">{refundTill}</Moment>
                </li>
              )}
              <li></li>
              <li className="devide">
                <label>Refund</label>
                <span />
              </li>
              <li>
                <label>Refund ID</label>
                {refund._id}
              </li>
              <li>
                <label>Status</label>
                {refund.status}
              </li>
              <li>
                <label>Submitted at</label>
                <Moment format="DD MMM YYYY, hh:mma">{refund.createdAt}</Moment>
              </li>
              <li>
                <label>Issue</label>
                {refund.issue}
              </li>
              <li>
                <label>Descrption</label>
                {refund.dscr}
              </li>
              <li>
                <label>Images</label>
                <div className="thumbs">
                  {refund.files.length ? (
                    <Media links={refund.files} />
                  ) : (
                    <>No Images has been provided.</>
                  )}
                </div>
              </li>
              <li></li>
              <li className="devide">
                <label>Delivery Address</label>
                <span />
              </li>
              <>
                {Object.entries(order.deliveryDetail).map(([key, value], i) =>
                  key === "deliveryTime" ? (
                    <li key={i}>
                      <label>Delivery date</label>
                      {order.deliveryDetail.deliveryTime ? (
                        <Moment format="DD MMM, YYYY hh:mma">
                          {order.deliveryDetail.deliveryTime}
                        </Moment>
                      ) : (
                        "N/A"
                      )}
                    </li>
                  ) : (
                    <li key={i}>
                      <label>{key}</label>
                      {value}
                    </li>
                  )
                )}
              </>
            </ul>
          </div>
          <div className="products">
            <h3>Products</h3>
            <ul>
              {order.products.map(({ product, qty }, i) => (
                <li key={i}>
                  <Img src={product.images[0] || "/open_box.png"} />
                  <div className="detail">
                    <p>{product.name}</p>
                    <p className="qty">QTY: {qty}</p>
                  </div>
                  <div className="price">
                    <span>
                      {calculatePrice({ product, gst: true })} x {qty}
                    </span>
                    ₹{calculatePrice({ product, gst: true }) * qty}
                  </div>
                </li>
              ))}
            </ul>
            <div className="total">
              <div className="data">
                <label>Total</label>₹
                {order.products.reduce(
                  (a, c) =>
                    a +
                    calculatePrice({ product: c.product, gst: true }) * c.qty,
                  0
                )}
              </div>
              <div className="data">
                <label>Shipping</label>
                {order.shipping || "N/A"}
              </div>
              <div className="data">
                <label>Grand Total</label>₹
                {order.products.reduce(
                  (a, c) =>
                    a +
                    calculatePrice({ product: c.product, gst: true }) * c.qty,
                  0
                ) + (+order.shipping || 0)}
              </div>
            </div>
          </div>
          <div className="milestones">
            <h3>
              Milestones
              {(refund.status === "approved" ||
                refund.status === "productSent" ||
                refund.status === "productRecieved") && (
                <button onClick={() => setMilestoneForm(true)}>
                  Create Milestone
                </button>
              )}
            </h3>
            {refund.status === "pending" && (
              <p>
                You can create milestones once you accept the refund request.
              </p>
            )}
            {refund.status === "declined" && (
              <p>This refund request has been declined.</p>
            )}
            {!(refund.status === "declined" || refund.status === "pending") && (
              <table cellSpacing={0} cellPadding={0}>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Descrption</td>
                    <td>Amount</td>
                    <td>Status</td>
                  </tr>
                </thead>
                <tbody>
                  {refund.milestones.map((milestone) => (
                    <tr
                      key={milestone._id}
                      onClick={() =>
                        history.push(`/account/hold?q=${milestone._id}`)
                      }
                    >
                      <td>
                        <Moment format="DD MMM YYYY, hh:mma">
                          {milestone.createdAt}
                        </Moment>
                      </td>
                      <td>{milestone.dscr}</td>
                      <td>₹{milestone.amount}</td>
                      <td>{milestone.status}</td>
                    </tr>
                  ))}
                  {refund.milestones.length === 0 && (
                    <tr className="placeholdert">
                      <td>Nothing yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <section className="terms">
            <h3>Return Policy Terms</h3>
            <ul>
              {order.terms?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
              {!order.terms?.length && (
                <li>No terms has been set by the seller yet.</li>
              )}
            </ul>
          </section>
        </div>
        <Modal
          head={true}
          label="Create Milestone"
          setOpen={setMilestoneForm}
          className="milestoneRequest"
          open={milestoneForm}
        >
          <MilestoneForm
            action="create"
            definedAmount={order.total}
            client={refund.seller}
            refund={refund._id}
            onSuccess={(milestone) => {
              setMilestoneForm(false);
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
              setRefund((prev) => ({
                ...prev,
                milestones: [...prev.milestones, milestone],
              }));
            }}
          />
        </Modal>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </>
    );
  }
  return <>Loading</>;
};

export default Refunds;
