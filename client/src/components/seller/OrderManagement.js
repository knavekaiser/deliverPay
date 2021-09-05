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
  NumberInput,
  Media,
  UploadFiles,
  FileInput,
  Img,
  Moment,
  moment,
  InputDateRange,
} from "../Elements";
import { Link, useHistory } from "react-router-dom";
import { SiteContext } from "../../SiteContext";
import { Modal, Confirm } from "../Modal";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
const MilestoneForm = lazy(() =>
  import("../Forms").then((mod) => ({ default: mod.MilestoneForm }))
);

const Orders = ({ categories }) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({
    column: "createdAt",
    order: "dsc",
  });
  const [dateRange, setDateRange] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batch, setBatch] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const startDate = moment({
      time: dateRange?.startDate,
      format: "YYYY-MM-DD",
    });
    const endDate = moment({
      time: dateRange?.endDate.setHours(24, 0, 0, 0),
      format: "YYYY-MM-DD",
    });
    fetch(
      `/api/getOrders?${new URLSearchParams({
        user: "seller",
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
          setOrders(data.orders);
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
  }, [status, search, page, perPage, dateRange]);
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
        <p>Order Management</p>
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
            placeholder="Search for Buyer"
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
              { label: "Cancelled", value: "cancelled" },
              { label: "Hold", value: "Hold" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
              { label: "Refunded", value: "refunded" },
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
      <table className="table orders">
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
            <th>Order</th>
            <th className="date">Date</th>
            {
              // <th>Buyer</th>
              // <th>QTY</th>
              // <th>Refundable</th>
              // <th>Milestone</th>
            }
            <th>Total Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <SingleOrder
              key={i}
              order={order}
              setOrders={setOrders}
              selectAll={selectAll}
              setBatch={setBatch}
              batch={batch}
            />
          ))}
          {orders.length === 0 && (
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
const SingleOrder = ({ order, setOrders, selectAll, setBatch, batch }) => {
  const actionsRef = useRef();
  const checkRef = useRef();
  const history = useHistory();
  const { user } = useContext(SiteContext);
  const [selected, setSelected] = useState(selectAll || false);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState(false);
  const cancelOrder = () => {
    fetch("/api/declineOrder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: order._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrders((prev) =>
            prev.map((item) => {
              if (item._id === order._id) {
                return {
                  ...item,
                  status: data.order?.status,
                };
              } else {
                return item;
              }
            })
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not cancel order. Please try again.</h4>
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
              <h4>Could not cancel order. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  const acceptOrder = () => {
    fetch("/api/acceptOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: order._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrders((prev) =>
            prev.map((item) => {
              if (item._id === order._id) {
                return {
                  ...item,
                  status: data.order?.status,
                };
              } else {
                return item;
              }
            })
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Orders does not exist.</h4>
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
              <h4>Could not accept order. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const requestCancellation = () => {
    fetch("/api/requestCancellation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: order._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrders((prev) =>
            prev.map((item) => {
              if (item._id === order._id) {
                return {
                  ...item,
                  status: data.order?.status,
                };
              } else {
                return item;
              }
            })
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not cancel order. Please try again.</h4>
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
              <h4>Could not cancel order. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    setSelected(selectAll);
  }, [selectAll]);
  useEffect(() => {
    if (selected) {
      setBatch((prev) => [...prev, order._id]);
    } else {
      setBatch((prev) => prev.filter((item) => item !== order._id));
    }
  }, [selected]);
  return (
    <>
      <tr
        className={`order ${selected ? "selected" : ""}`}
        onClick={(e) => {
          if (
            e.nativeEvent.path.includes(actionsRef.current) ||
            e.nativeEvent.path.includes(checkRef.current) ||
            batch.length > 0
          ) {
          } else {
            history.push(`/account/myShop/orders/${order._id}`);
          }
        }}
      >
        {
          //   <td className="checkContainer" ref={checkRef}>
          //   <Checkbox
          //     defaultValue={selected}
          //     value={selected}
          //     onChange={(e) => {
          //       setSelected(e);
          //     }}
          //   />
          // </td>
        }
        <td>{order._id}</td>
        <td className="date">
          <Moment format="DD MMM YYYY, hh:mm a">{order.createdAt}</Moment>
        </td>
        {
          //   <td className="user">
          //   <User user={order.buyer} />
          // </td>
          // <td>{order.products.reduce((a, c) => a + c.qty, 0)}</td>
          // <td>{order.refundable || "N/A"}</td>
          // <td>{order.milestones.length || "N/A"}</td>
        }
        <td>₹{order.total}</td>
        <td>{order.status}</td>
        <td ref={actionsRef}>
          {batch.length === 0 && (
            <Actions icon={<Chev_down_svg />}>
              <Link to={`/account/myShopping/orders/${order._id}`}>
                View Detail
              </Link>
              {order.status === "pending" && (
                <>
                  <Link
                    to="#"
                    onClick={(e) => {
                      Confirm({
                        label: "Accept Order",
                        question: "You sure want to accept this order?",
                        callback: acceptOrder,
                      });
                    }}
                  >
                    Accept order
                  </Link>
                  <Link
                    to="#"
                    onClick={(e) => {
                      Confirm({
                        label: "Order Cancellation",
                        question: "You sure want to cancel this order?",
                        callback: cancelOrder,
                      });
                    }}
                  >
                    Cancel order
                  </Link>
                </>
              )}
              {order.status === "approved" && (
                <Link
                  to="#"
                  onClick={(e) => {
                    Confirm({
                      label: "Order Cancellation",
                      question:
                        "You sure want to request cancellation for this order?",
                      callback: requestCancellation,
                    });
                  }}
                >
                  Request Cancellation
                </Link>
              )}
            </Actions>
          )}
        </td>
      </tr>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

export const FullOrder = ({ history, match }) => {
  const { user, userType } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [order, setOrder] = useState(null);
  const [shipping, setShipping] = useState(user.shopInfo?.shippingCost || 0);
  const [refundable, setRefundable] = useState(null);
  const [addTerm, setAddTerm] = useState("");
  const [milestoneForm, setMilestoneForm] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const milestoneTimeout = useRef();
  const acceptOrder = () => {
    fetch("/api/acceptOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: order._id,
        // products: order.products,
        // shippingCost: shipping,
        // refundable,
        // terms,
        // total,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder((prev) => ({ ...prev, status: "approved" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Order approved.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Orders does not exist.</h4>
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
              <h4>Could not accept order. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const declineOrder = () => {
    fetch("/api/declineOrder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: order._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder((prev) => ({ ...prev, status: "declined" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Order declined.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Orders does not exist.</h4>
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
              <h4>Could not decline order. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const markAsShipped = () => {
    fetch("/api/updateOrder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: order._id,
        status: "shipped",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder((prev) => ({ ...order, status: "shipped" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>
                  Order has been updated. Don't forget to upload proof of
                  shipping below.
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
                <h4>Order could not be updated. Try again.</h4>
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
              <h4>Order could not be updated. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const markAsDelivered = () => {
    fetch("/api/updateOrder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: order._id,
        status: "delivered",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder((prev) => ({ ...order, status: "delivered" }));
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>
                  Order has been updated. Don't forget to upload proof of
                  delivery below.
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
                <h4>Order could not be updated. Try again.</h4>
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
              <h4>Order could not be updated. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    fetch(`/api/singleOrder?_id=${match.params._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setOrder(data.order);
          setShipping(data.shippingCost);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Orders does not exist.</h4>
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
              <h4>Could not get order. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, []);
  if (order) {
    const productPrice = order.products.reduce(
      (a, c) =>
        (a + calculatePrice({ product: c.product, gst: true }) * c.qty).fix(),
      0
    );
    const couponCodeDiscount =
      (order.coupon?.type === "percent" &&
        Math.min(
          (productPrice / 100) * order.coupon.amount,
          order.coupon.maxDiscount
        )) ||
      (order.coupon?.type === "flat" && order.coupon?.amount) ||
      0;
    const fee = (
      ((productPrice - couponCodeDiscount + order.shippingCost) / 100) *
      order.fee
    ).fix();
    return (
      <>
        <div className="actions">
          <Link
            to={`/account/${
              userType === "seller" ? "myShop" : "myShopping"
            }/orders`}
            className="back"
          >
            <Arrow_left_svg />
            Back
          </Link>
          {order.status === "approved" && (
            <button
              onClick={() =>
                Confirm({
                  label: "Mark Order as Shipped",
                  question: "Did you ship the order?",
                  callback: markAsShipped,
                })
              }
            >
              Mark as Shipped
            </button>
          )}
          {order.status === "shipped" && (
            <button
              onClick={() =>
                Confirm({
                  label: "Mark Order as Delivered",
                  question: "Has the order been delivered?",
                  callback: markAsDelivered,
                })
              }
            >
              Mark as Delivered
            </button>
          )}
          {order.status === "pending" && (
            <>
              <button
                onClick={() => {
                  Confirm({
                    lable: "Accept Order",
                    question: <>You sure want to accept this order?</>,
                    callback: acceptOrder,
                  });
                }}
              >
                Accept
              </button>
              <button
                onClick={() =>
                  Confirm({
                    label: "Decline Order",
                    question: "You sure want to decline this order?",
                    callback: declineOrder,
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
            <h3>Order Summery</h3>
            <ul>
              <li>
                <label>Buyer</label>
                <User user={order.buyer} />
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
                <label>Submitted at</label>
                <Moment format="DD MMM YYYY, hh:mma">{order.createdAt}</Moment>
              </li>
              <li></li>
              <li className="devide">
                <label>Delivery Address</label>
                <span />
              </li>
              {Object.entries(order.deliveryDetail).map(([key, value], i) =>
                key === "deliveryWithin" ? (
                  <li key={i}>
                    <label>Delivery within</label>
                    {order.deliveryDetail.deliveryWithin} days
                  </li>
                ) : (
                  <li key={i}>
                    <label>{key}</label>
                    {value}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="products">
            <h3>Products</h3>
            <ul>
              {order.products.map(({ product, qty, available }, i) => (
                <li key={i}>
                  <Img src={product.images[0] || "/open_box.png"} />
                  <div className="detail">
                    <p>{product.name}</p>
                    <p className="qty">QTY: {qty}</p>
                    {order.status === "pending" && (
                      <p className="available">
                        Available: {available.toString()}
                      </p>
                    )}
                  </div>
                  <div className="price">
                    <span>
                      {calculatePrice({ product, gst: true })} x {qty}
                    </span>
                    ₹{(calculatePrice({ product, gst: true }) * qty).fix()}
                  </div>
                  {
                    //   order.status === "pending" && (
                    //   <div className="remove">
                    //     <button
                    //       onClick={() => {
                    //         setOrder((prev) => ({
                    //           ...prev,
                    //           products: prev.products.filter((cartProduct) => {
                    //             console.log(cartProduct, product);
                    //             return cartProduct.product._id !== product._id;
                    //           }),
                    //         }));
                    //       }}
                    //     >
                    //       <X_svg />
                    //     </button>
                    //   </div>
                    // )
                  }
                </li>
              ))}
            </ul>
            <div className="total">
              <div className="data">
                <label>Total</label>₹{productPrice}
              </div>
              {order.coupon && (
                <>
                  <div className="data">
                    <label>
                      Coupon Code {order.coupon.code}
                      <br />
                      Discount{" "}
                      {order.coupon.type === "percent" ? (
                        <>
                          {order.coupon.amount}% (Upto ₹
                          {order.coupon.maxDiscount})
                        </>
                      ) : (
                        <>flat</>
                      )}
                    </label>
                    <span>₹{couponCodeDiscount}</span>
                  </div>
                </>
              )}
              <div className="data">
                <label>Shipping</label>₹
                {
                  //   order.status === "pending" ? (
                  //   <NumberInput
                  //     value={shipping}
                  //     onChange={(e) => setShipping(e.target.value)}
                  //   />
                  // ) : (
                  //   <>{shipping || 0}</>
                  // )
                  order.shippingCost
                }
              </div>
              <hr />
              <div className="data">
                <label>Delivery Pay fee {order.fee}%</label>₹
                {(order.total - (order.total / (order.fee + 100)) * 100).fix()}
              </div>
              <hr />
              <div className="data">
                <label>Grand Total</label>₹{order.total.fix()}
              </div>
              <hr />
              <div className="data">
                <label>You'll recieve</label>₹
                {((order.total / (order.fee + 100)) * 100).fix()}
              </div>
            </div>
            {
              //   <div className="deliveryInfo">
              //   <section>
              //     <label>Delivery Time</label>
              //     {order.status === "pending" ? (
              //       <input
              //         type="datetime-local"
              //         value={deliveryTime}
              //         onChange={(e) => setDeliveryTime(e.target.value)}
              //       />
              //     ) : order.deliveryDetail?.deliveryTime ? (
              //       <Moment format="DD MMM YYYY hh:mma">
              //         order.deliveryDetail?.deliveryTime
              //       </Moment>
              //     ) : (
              //       <>N/A</>
              //     )}
              //   </section>
              //   <section>
              //     <label>Refundable</label>
              //     {order.status === "pending" ? (
              //       <Combobox
              //         required={true}
              //         defaultValue={0}
              //         onChange={(e) => setRefundable(e.value)}
              //         options={[
              //           { label: "No", value: null },
              //           {
              //             label: "Upto 24 Hours After Delivery",
              //             value: "Upto 24 Hours After Delivery",
              //           },
              //           {
              //             label: "Upto 7 Days After Delivery",
              //             value: "Upto 7 Days After Delivery",
              //           },
              //           {
              //             label: "Upto 15 Days After Delivery",
              //             value: "Upto 15 Days After Delivery",
              //           },
              //         ]}
              //       />
              //     ) : (
              //       <>{order.refundable || "N/A"}</>
              //     )}
              //   </section>
              // </div>
            }
          </div>
          <div className="milestones">
            <h3>
              Milestones
              {
                //   (order.status === "approved" ||
                //   order.status === "shipped" ||
                //   order.status === "delivered") && (
                //   <button onClick={() => setMilestoneForm(true)}>
                //     Request Milestone
                //   </button>
                // )
              }
            </h3>
            <p className="subtitle">Click to view milestone detail.</p>
            {
              // {order.status === "pending" ? (
              //   <p>Buyer can create milestones after you accept the order.</p>
              // ) : (
            }
            <table>
              <thead>
                <tr>
                  <td>Date</td>
                  <td>Descrption</td>
                  <td>Amount</td>
                  <td>Status</td>
                </tr>
              </thead>
              <tbody>
                {order.milestones.map((milestone) => (
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
                {order.milestones.length === 0 && (
                  <tr className="placeholdert">
                    <td>Nothing yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {
              // )}
            }
          </div>
          <div className="delivery">
            <h3>
              Proof of delivery
              {(order.status === "approved" || order.status === "shipped") && (
                <button onClick={() => setFileUpload(true)}>
                  Upload proof of delivery
                </button>
              )}
            </h3>
            {order.files?.length > 0 ? (
              <div className="thumbs">
                <Media links={order.files} />
              </div>
            ) : (
              <>No files added.</>
            )}
          </div>
          <section className="terms">
            <h3>Return Policy Terms</h3>
            <ul>
              {order.terms?.map((item, i) => (
                <li key={i}>
                  {item}{" "}
                  {
                    //   order.status === "pending" && (
                    //   <button
                    //     type="button"
                    //     onClick={() =>
                    //       setTerms((prev) => prev.filter((term) => term !== item))
                    //     }
                    //   >
                    //     <X_svg />
                    //   </button>
                    // )
                  }
                </li>
              ))}
              {
                //   order.status === "pending" && (
                //   <section className="addTerm">
                //     <TextareaAutosize
                //       value={addTerm}
                //       placeholder="Add auditional term"
                //       onChange={(e) => setAddTerm(e.target.value)}
                //     />
                //     <button
                //       type="button"
                //       onClick={() => {
                //         setTerms((prev) =>
                //           addTerm
                //             ? [
                //                 ...prev.filter((term) => term !== addTerm),
                //                 addTerm,
                //               ]
                //             : prev
                //         );
                //         setAddTerm("");
                //       }}
                //     >
                //       Add Term
                //     </button>
                //   </section>
                // )
              }
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
            action="request"
            definedAmount={order.total}
            client={order.buyer}
            order={order._id}
            onSuccess={(milestone) => {
              setMilestoneForm(false);
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
              setOrder((prev) => ({
                ...prev,
                milestones: [...prev.milestones, milestone],
              }));
            }}
          />
        </Modal>
        <Modal
          head={true}
          label="Upload proof of shipping & delivery"
          setOpen={setFileUpload}
          open={fileUpload}
          className="fileUpload"
        >
          <FileUploadForm
            order={order}
            onSuccess={(order) => {
              setFileUpload(false);
              setOrder((prev) => ({ ...prev, files: order.files }));
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
const FileUploadForm = ({ order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState(null);
  const submit = async () => {
    setLoading(true);
    const fileLinks = files.length ? await UploadFiles({ files, setMsg }) : [];
    fetch("/api/updateOrder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: order._id, files: fileLinks }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.order);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not upload files. Try again.</h4>
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
              <h4>Could not upload files. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          Confirm({
            title: "Upload Proof of Shipping & Delivery",
            question: (
              <>
                You sure want to upload these files?
                <span className="note">
                  Keep in mind these files can not be deleted later.
                </span>
              </>
            ),
            callback: submit,
          });
        }}
      >
        <section>
          <label>Upload Images of the products, shipment reciept etc.</label>
          <FileInput
            multiple={true}
            accept="image/*"
            required={true}
            onChange={(files) => setFiles(files)}
          />
        </section>
        <section className="btns">
          <button className="submit">Submit</button>
        </section>
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

export default Orders;
