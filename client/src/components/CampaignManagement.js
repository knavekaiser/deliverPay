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
} from "./Elements";
import { Link, useHistory } from "react-router-dom";
import { SiteContext } from "../SiteContext";
import { Modal, Confirm } from "./Modal";
import TextareaAutosize from "react-textarea-autosize";
import { MilestoneForm } from "./Account";
import { toast } from "react-toastify";

const Coupons = ({ categories }) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({
    column: "createdAt",
    coupon: "dsc",
  });
  const [coupons, setCoupons] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batch, setBatch] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch(
      `/api/getCoupons?${new URLSearchParams({
        ...(search && { q: search }),
        page,
        perPage,
        sort: sort.column,
        order: sort.order,
        ...(status && { status }),
      })}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setCoupons(data.coupons);
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
              <h4>Could not get coupons.</h4>
            </div>
          </>
        );
      });
  }, [status, search, page, perPage]);
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
              { label: "Pending", value: "draft" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            onChange={(e) => setStatus(e.value)}
          />
        </section>
      </div>
      {batch.length > 0 && (
        <div className="batchAction">
          <button onClick={() => console.log("batch delete")}>Delete</button>
        </div>
      )}
      <table className="table coupons">
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
            <th>Title</th>
            <th>Status</th>
            <th>Code</th>
            <th>Discount</th>
            <th>Threshold</th>
            <th>Validity</th>
            <th>Accept</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon, i) => (
            <SingleCoupon
              key={i}
              coupon={coupon}
              setCoupons={setCoupons}
              selectAll={selectAll}
              setBatch={setBatch}
              batch={batch}
            />
          ))}
          {coupons.length === 0 && (
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
const SingleCoupon = ({ coupon, setCoupons, selectAll, setBatch, batch }) => {
  const actionsRef = useRef();
  const checkRef = useRef();
  const history = useHistory();
  const { user } = useContext(SiteContext);
  const [selected, setSelected] = useState(selectAll || false);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState(false);
  const [couponDetail, setCouponDetail] = useState(false);
  const declineCoupon = (_id) => {
    fetch("/api/declineCoupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setCoupons((prev) =>
            prev.map((item) => {
              if (item._id === _id) {
                return {
                  ...item,
                  accept: false,
                };
              }
              return item;
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>
                  Coupon code declined. Buyers can no longer apply this coupon
                  code on your shop.
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
                <h4>Could not decline Coupon code. please try again.</h4>
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
              <h4>Could not decline Coupon code. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const acceptCoupon = (_id) => {
    fetch("/api/acceptCoupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setCoupons((prev) =>
            prev.map((item) => {
              if (item._id === _id) {
                return {
                  ...item,
                  accept: true,
                };
              }
              return item;
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>
                  Coupon code accepted. Now Buyers can apply this coupon code on
                  your shop.
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
                <h4>Could not accept Coupon code. please try again.</h4>
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
              <h4>Could not accept Coupon code. Make sure you're online.</h4>
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
      setBatch((prev) => [...prev, coupon._id]);
    } else {
      setBatch((prev) => prev.filter((item) => item !== coupon._id));
    }
  }, [selected]);
  return (
    <>
      <tr
        className={`coupon ${selected ? "selected" : ""}`}
        onClick={(e) => {
          if (
            e.nativeEvent.path.includes(actionsRef.current) ||
            e.nativeEvent.path.includes(checkRef.current) ||
            batch.length > 0
          ) {
          } else {
            setCouponDetail(true);
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
        <td className="date">
          <Moment format="DD MMM YY">{coupon.createdAt}</Moment>
        </td>
        <td>{coupon.title}</td>
        <td>{coupon.status}</td>
        <td>{coupon.code}</td>
        <td className="discount">
          {coupon.type === "percent" ? (
            <>
              {coupon.amount}%<span>Up to ₹{coupon.maxDiscount}</span>
            </>
          ) : (
            <>₹{coupon.amount}</>
          )}
        </td>
        <td>₹{coupon.threshold}</td>
        <td>
          <Moment format="DD MMM YY">{coupon.date?.from}</Moment>-
          <Moment format="DD MMM YY">{coupon.date?.to}</Moment>
        </td>
        <td>{coupon.accept ? "Yes" : "No"}</td>
        <td ref={actionsRef}>
          {batch.length === 0 && (
            <Actions icon={<Chev_down_svg />}>
              <button onClick={() => setCouponDetail(coupon)}>
                View Detail
              </button>
              {coupon.accept && (
                <button
                  onClick={() =>
                    Confirm({
                      label: "Accepting Coupon code",
                      question:
                        "You sure want to take part in this campaign and accept this coupon code?",
                      callback: () => declineCoupon(coupon._id),
                    })
                  }
                >
                  Decline
                </button>
              )}
              {new Date(coupon.date?.to) >=
                new Date(moment({ time: new Date(), format: "YYYY-MM-DD" })) &&
                !coupon.accept && (
                  <button
                    onClick={() =>
                      Confirm({
                        label: "Accepting Coupon code",
                        question:
                          "You sure want to take part in this campaign and accept this coupon code?",
                        callback: () => acceptCoupon(coupon._id),
                      })
                    }
                  >
                    Accept
                  </button>
                )}
            </Actions>
          )}
        </td>
      </tr>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
      <Modal
        open={couponDetail}
        head={true}
        label="Coupon Detail"
        setOpen={setCouponDetail}
        className="couponDetail"
      >
        <div className="content">
          <section>
            <label>Campaign Title</label>
            <p>{couponDetail?.title}</p>
          </section>
          <section>
            <label>Campaign Description</label>
            <p>{couponDetail?.dscr}</p>
          </section>
          <section>
            <label>Coupon Code</label>
            <p>{couponDetail?.code}</p>
          </section>
          <section>
            <label>Coupon code status</label>
            <p>{couponDetail?.status}</p>
          </section>
          <section>
            <label>Discount</label>
            <p>
              {couponDetail?.type === "percent" ? (
                <>
                  {couponDetail?.amount}% up to ₹{couponDetail.maxDiscount}
                </>
              ) : (
                <>₹{couponDetail?.amount}</>
              )}
            </p>
          </section>
          <section>
            <label>Validity</label>
            <p>
              <Moment format="DD MMM YY">{couponDetail.date?.from}</Moment>-
              <Moment format="DD MMM YY">{couponDetail.date?.to}</Moment>
            </p>
          </section>
          <section>
            <label>Accept</label>
            <p>{couponDetail.accept ? "Yes" : "No"}</p>
          </section>
        </div>
      </Modal>
    </>
  );
};

export default Coupons;
