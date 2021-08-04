import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
} from "react";
import {
  X_svg,
  Combobox,
  Err_svg,
  Succ_svg,
  calculatePrice,
  SS,
  Minus_svg,
  Plus_svg,
} from "./Elements";
import { SiteContext } from "../SiteContext";
import { Link } from "react-router-dom";
import { Modal } from "./Modal";
import { Moment } from "react-moment";
import { MilestoneForm } from "./Account";
import queryString from "query-string";
import { toast } from "react-toastify";
require("./styles/marketplace.scss");

const Marketplace = ({ history, location, match }) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({
    column: "popularity",
    order: "dsc",
  });
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [seller, setSeller] = useState("");
  useEffect(() => {
    fetch(`/api/getProducts${location.search}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setTotal(data.total);
          setProducts(data.products);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not get products. Please try again.</h4>
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
              <h4>Could not get products. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [location.search]);
  useEffect(() => {
    history.push({
      pathname: history.location.pathname,
      search:
        "?" +
        new URLSearchParams({
          ...queryString.parse(location.search),
          q: search,
          page,
          perPage,
          sort: sort.column,
          order: sort.order,
        }).toString(),
    });
  }, [perPage, page, search, sort]);
  return (
    <div className="marketplace">
      <div style={{ display: "none" }}>
        <X_svg />
      </div>
      <div className="benner">
        <h1>Marketplace</h1>
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
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search for products"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X_svg />
            </button>
          )}
        </section>
        <section className="sort">
          <label>Sort by:</label>
          <Combobox
            defaultValue={0}
            options={[
              {
                label: "popularity",
                value: { column: "popularity", order: "dsc" },
              },
              {
                label: "Price high-low",
                value: { column: "price", order: "dsc" },
              },
              {
                label: "Price low-high",
                value: { column: "price", order: "asc" },
              },
            ]}
            onChange={(e) => setSort(e.value)}
          />
        </section>
      </div>
      <div className="products">
        {products.map((item) => (
          <Product key={item._id} data={item} />
        ))}
      </div>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

const Product = ({ data }) => {
  let discountPrice = calculatePrice(data);
  return (
    <div className="product">
      <Link to={`/account/marketplace/${data._id}`}>
        <div className={`thumb ${data.images[0] ? "" : "noThumb"}`}>
          <img src={data.images[0] || "/open_box.png"} />
        </div>
      </Link>
      <div className="detail">
        <h3>{data.name}</h3>
        <div className="price">
          <span className="symbol">₹</span> {discountPrice}{" "}
          {discountPrice !== data.price && (
            <span className="originalPrice">{data.price}</span>
          )}
        </div>
      </div>
      <div className="actions">
        <button>Add to cart</button>
      </div>
    </div>
  );
};

export const SingleProduct = ({ match }) => {
  const { setCart } = useContext(SiteContext);
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch(`/api/singleProduct?_id=${match.params._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          let discountPrice = data.product.price;
          if (data.product.discount?.amount) {
            const { type, amount } = data.product.discount;
            if (type === "flat") {
              discountPrice = data.product.price - amount;
            } else if (type === "percent") {
              discountPrice =
                data.product.price - (data.product.price / 100) * amount;
            }
          }
          setProduct({ ...data.product, discountPrice });
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Product does not exists.</h4>
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
              <h4>Could not get product. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, []);
  if (product) {
    return (
      <div className="singleProduct">
        <Gallery images={product.images} />
        <div className="detail">
          <h1>{product.name}</h1>
          <p>{product.dscr}</p>
          <p>
            Available: {product.available === 0 && <>Out of stock</>}
            {product.available > 0 && (
              <>
                {product.available}
                {product.available <= 5 && <span>Low Stock</span>}
              </>
            )}
          </p>
          <p className="price">
            <span className="symbol">₹</span> {product.discountPrice}{" "}
            {product.discountPrice !== product.price && (
              <span className="originalPrice">{product.price}</span>
            )}
          </p>
          <div className="seller">
            <label>Being sold by:</label>
            <div className="profile">
              <img src={product.user.profileImg || "/profile-user.jpg"} />
              <p className="name">
                {product.user.firstName} {product.user.lastName}{" "}
                <span className="contact">{product.user.phone}</span>
              </p>
            </div>
          </div>
          <div className="actions">
            <button
              onClick={() => {
                setCart((prev) => {
                  if (prev.some((item) => item.product._id === product._id)) {
                    return prev.map((item) => {
                      if (item.product._id === product._id) {
                        return {
                          ...item,
                          qty: item.qty + 1,
                        };
                      } else {
                        return item;
                      }
                    });
                  } else {
                    return [...prev, { product, qty: 1 }];
                  }
                });
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </div>
    );
  }
  return (
    <>
      loading
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

const Gallery = ({ images }) => {
  const [view, setView] = useState(images[0]);
  return (
    <div className="gallery">
      <ImageView img={view} />
      <div className="thumbs">
        {images.map((item, i) => (
          <img key={i} src={item} onClick={() => setView(item)} />
        ))}
        {images.length === 0 && <p>No image was provided by the seller.</p>}
      </div>
    </div>
  );
};

const ImageView = ({ img }) => {
  const [boundingBody, setBoundingBody] = useState(null);
  const [applyStyle, setApplyStyle] = useState(false);
  const [style, setStyle] = useState({});
  const container = useRef();
  useLayoutEffect(() => {
    setBoundingBody(container.current?.getBoundingClientRect());
  }, []);
  return (
    <div
      ref={container}
      className={`mainView ${!img ? "noImg" : ""}`}
      onMouseMove={(e) => {
        if (img) {
          const x =
            Math.abs(
              Math.round(
                (e.clientX - boundingBody.x) / (boundingBody.width / 100)
              )
            ) * 0.65;
          const y =
            Math.round(
              (e.clientY - boundingBody.y) / (boundingBody.height / 100)
            ) * 0.65;
          setStyle({
            transform: `scale(2) translateY(${Math.max(
              30 + -y,
              -30
            )}%) translateX(${Math.max(30 + -x, -30)}%)`,
          });
        }
      }}
      onMouseEnter={() => setApplyStyle(true)}
      onMouseLeave={() => setApplyStyle(false)}
    >
      <img
        className={applyStyle ? "scale" : ""}
        style={applyStyle ? style : {}}
        src={img || "/open_box.png"}
      />
    </div>
  );
};

export const Cart = () => {
  const { setCart, cart } = useContext(SiteContext);
  const [carts, setCarts] = useState(null);
  useEffect(() => {
    fetch("/api/getCartDetail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setCarts(data.carts);
        }
      });
  }, [cart]);
  if (carts) {
    return (
      <div className="fullCart">
        <h1>Cart</h1>
        <div className="allCarts">
          {carts.map(({ seller, products }) =>
            products?.length ? (
              <Shop
                key={seller._id}
                seller={seller}
                products={products}
                setCart={setCart}
              />
            ) : null
          )}
        </div>
      </div>
    );
  }
  return <>Loading</>;
};

const Shop = ({ seller, products, setCart }) => {
  const [milestoneForm, setMilestoneForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const total = products.reduce(
    (a, c) => a + calculatePrice(c.product) * c.qty,
    0
  );
  const milestoneTimeout = useRef();
  return (
    <div className="shop">
      <div className="seller">
        <div className="profile">
          <img src={seller.profileImg || "/profile-user.jpg"} />
          <p className="name">
            {seller.firstName} {seller.lastName}{" "}
            <span className="contact">{seller.phone}</span>
          </p>
        </div>
      </div>
      <ul className="products">
        {products.map(({ product, qty }, i) => {
          const price = calculatePrice(product);
          return (
            <li key={i} className="item">
              <img src={product.images[0]} />
              <div className="detail">
                <p className="name">{product.name}</p>
                <div className="qty">
                  QTY:{" "}
                  <div className="addRemove">
                    <button
                      onClick={() => {
                        setCart((prev) =>
                          prev
                            .map((item) => {
                              if (item.product._id === product._id) {
                                return {
                                  ...item,
                                  qty: item.qty - 1,
                                };
                              } else {
                                return item;
                              }
                            })
                            .filter((item) => item.qty > 0)
                        );
                      }}
                    >
                      <Minus_svg />
                    </button>
                    {qty}
                    <button
                      onClick={() => {
                        setCart((prev) =>
                          prev.map((item) => {
                            if (item.product._id === product._id) {
                              return {
                                ...item,
                                qty: item.qty + 1,
                              };
                            } else {
                              return item;
                            }
                          })
                        );
                      }}
                    >
                      <Plus_svg />
                    </button>
                  </div>
                </div>
              </div>
              <div className="price">₹{price * qty}</div>
            </li>
          );
        })}
      </ul>
      <h2 className="total">total: {total}</h2>
      <div className="actions">
        <button onClick={() => setMilestoneForm(true)} className="">
          Place order
        </button>
      </div>
      <Modal
        className="milestoneRequest"
        head={true}
        label="Create Milestone"
        open={milestoneForm}
        setOpen={setMilestoneForm}
      >
        <MilestoneForm
          definedAmount={total}
          userType="buyer"
          searchClient={seller}
          onSuccess={(milestone) => {
            if (milestone.milestone) {
              setMilestoneForm(false);
            }
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
          onSubmit={({ e, type, body }) => {
            setMilestoneForm(false);
            toast(
              <div className="toast">
                Milestone {type === "seller" ? "requested." : "created."}{" "}
                <button
                  className="undo"
                  onClick={() => {
                    milestoneTimeout.current = null;
                  }}
                >
                  Undo
                </button>
              </div>,
              {
                position: "bottom-center",
                autoClose: 30000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                onClose: () => {
                  milestoneTimeout.current?.();
                },
                draggable: true,
                progress: undefined,
              }
            );
            milestoneTimeout.current = () => {
              if (type === "seller") {
                fetch("/api/requestMilestone", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                })
                  .then((res) => res.json())
                  .then(({ message, milestone }) => {
                    if (milestone) {
                      setMsg(
                        <>
                          <button onClick={() => setMsg(null)}>Okay</button>
                          <div>
                            {milestone ? <Succ_svg /> : <Err_svg />}
                            {milestone && (
                              <h4 className="amount">₹{milestone?.amount}</h4>
                            )}
                            <h4>{message}</h4>
                          </div>
                          {milestone && (
                            <Link
                              to="/account/hold"
                              onClick={() => setMsg(null)}
                            >
                              Check your Delivery pay Hold
                            </Link>
                          )}
                        </>
                      );
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
                          <h4>
                            Could not create milestone. Make sure you're online.
                          </h4>
                        </div>
                      </>
                    );
                  });
              } else {
                fetch("/api/createMilestone", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                })
                  .then((res) => res.json())
                  .then((milestone) => {
                    setMsg(
                      <>
                        <button onClick={() => setMsg(null)}>Okay</button>
                        <div>
                          {milestone.milestone ? <Succ_svg /> : <Err_svg />}
                          {milestone.milestone && (
                            <h4 className="amount">
                              ₹{milestone.milestone?.amount}
                            </h4>
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
                  })
                  .catch((err) => {
                    console.log(err);
                    setMsg(
                      <>
                        <button onClick={() => setMsg(null)}>Okay</button>
                        <div>
                          <Err_svg />
                          <h4>
                            Could not create milestone. Make sure you're online.
                          </h4>
                        </div>
                      </>
                    );
                  });
              }
            };
          }}
        />
      </Modal>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

export default Marketplace;
