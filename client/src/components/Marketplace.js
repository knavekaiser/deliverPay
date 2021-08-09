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
  calculateDiscount,
  Minus_svg,
  Plus_svg,
  addToCart,
  Header,
  Footer,
  Tip,
} from "./Elements";
import { AddressForm } from "./Forms";
import { SiteContext } from "../SiteContext";
import { Link, Redirect } from "react-router-dom";
import { Modal, Confirm } from "./Modal";
import { Moment } from "react-moment";
import { MilestoneForm } from "./Account";
import queryString from "query-string";
import { toast } from "react-toastify";
require("./styles/marketplace.scss");

const Marketplace = ({ history, location, match }) => {
  const { userType } = useContext(SiteContext);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(
    queryString.parse(location.search).type || ""
  );
  const [perPage, setPerPage] = useState(
    queryString.parse(location.search).perPage || 20
  );
  const [page, setPage] = useState(
    queryString.parse(location.search).page || 1
  );
  const [search, setSearch] = useState(
    queryString.parse(location.search).q || ""
  );
  const [sort, setSort] = useState({
    column: queryString.parse(location.search).sort || "popularity",
    order: queryString.parse(location.search).order || "dsc",
  });
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [seller, setSeller] = useState(
    queryString.parse(location.search).seller
  );
  const [sellerDetail, setsellerDetail] = useState(null);
  useEffect(() => {
    fetch(`/api/getProducts${location.search}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setTotal(data.total);
          setProducts(data.products);
          if (data.seller) {
            setsellerDetail(data.seller);
          } else {
            setsellerDetail(null);
          }
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
    history.replace({
      pathname: history.location.pathname,
      search:
        "?" +
        new URLSearchParams({
          ...(seller && { seller }),
          q: search,
          page,
          perPage,
          sort: sort.column,
          order: sort.order,
          ...(type && { type }),
        }).toString(),
    });
  }, [perPage, page, search, sort, seller, type]);
  return (
    <div className="generic marketplace">
      <Header />
      {userType === "seller" && <Redirect to="/account/myShop/products" />}
      <div className="content">
        <div style={{ display: "none" }}>
          <X_svg />
        </div>
        <div className="benner">
          <h1>Delivery Pay Marketplace</h1>
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
          <section className="type">
            <label>Type:</label>
            <Combobox
              defaultValue={type}
              options={[
                { label: "All", value: "" },
                { label: "Product", value: "product" },
                { label: "Service", value: "service" },
                { label: "Other", value: "other" },
              ]}
              onChange={(e) => setType(e.value)}
            />
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
        {sellerDetail && (
          <div className="sellerDetail">
            Only showing products from{" "}
            <div className="profile">
              <img src={sellerDetail.profileImg || "/profile-user.jpg"} />
              <p className="name">
                {sellerDetail.firstName} {sellerDetail.lastName}
                <span className="contact">{sellerDetail.phone}</span>
              </p>
            </div>
            <button className="close" onClick={() => setSeller(null)}>
              <X_svg />
            </button>
          </div>
        )}
        <div className={`products ${products.length === 0 ? "empty" : ""}`}>
          {products.map((item) => (
            <Product key={item._id} data={item} />
          ))}
          {products.length === 0 && (
            <div className="placeholder">
              <img src="/open_box.png" />
              <p>No Product Found</p>
            </div>
          )}
        </div>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

const Product = ({ data }) => {
  const { setCart } = useContext(SiteContext);
  let finalPrice = calculatePrice({ product: data, gst: data.user?.gst });
  return (
    <div className="product">
      <Link to={`/marketplace/${data._id}`}>
        <div className={`thumb ${data.images[0] ? "" : "noThumb"}`}>
          <img src={data.images[0] || "/open_box.png"} />
        </div>
      </Link>
      <div className="detail">
        <h3>{data.name}</h3>
        <div className="price">
          <span className="symbol">₹</span>
          {finalPrice}{" "}
          {finalPrice !==
            calculatePrice({
              product: data,
              gst: data.user.gst,
              discount: false,
            }) && (
            <span className="originalPrice">
              {calculatePrice({
                product: data,
                gst: data.user?.gst,
                discount: false,
              })}
            </span>
          )}
        </div>
      </div>
      <div className="actions">
        <button
          onClick={() => {
            setCart((prev) => addToCart(prev, data));
          }}
        >
          Add to cart
        </button>
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
          setProduct(data.product);
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
      <div className="generic singleProduct">
        <Header />
        <div className="content">
          <Gallery images={product.images} />
          <div className="detail">
            <h1>{product.name}</h1>
            <p>{product.dscr}</p>
            <p>
              {product.type === "product" && (
                <>
                  Available: {product.available && product.available}{" "}
                  {product.available === 0 && <>Out of stock</>}
                  {product.available < 7 && product.available > 0 && (
                    <>Low stock</>
                  )}
                </>
              )}
              {product.type !== "product" && (
                <>
                  Availability:{" "}
                  {product.available ? "Available" : "Unavailable"}
                </>
              )}
            </p>
            <p className="price">
              <label>Price: </label> <span className="symbol">₹</span>
              {calculatePrice({ product, gst: product.user?.gst })}{" "}
              {calculatePrice({ product, gst: product.user?.gst }) !==
                calculatePrice({
                  product,
                  gst: product.user?.gst,
                  discount: false,
                }) && (
                <span className="originalPrice">
                  {calculatePrice({
                    product,
                    gst: product.user?.gst,
                    discount: false,
                  })}
                </span>
              )}
            </p>
            {
              //   product.user?.gst?.verified && (
              //   <p className="gst">
              //     Including {product.gst || product.user.gst.amount}% GST
              //   </p>
              // )
            }
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
                  setCart((prev) => addToCart(prev, product));
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
        <Footer />
      </div>
    );
  }
  return (
    <div className="generic singleProduct">
      <Header />
      loading
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
      <Footer />
    </div>
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
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/getCartDetail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          setCarts(data.carts);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not get cart detail. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [cart]);
  if (carts) {
    return (
      <div className="fullCart">
        <div className="head">
          <h1>Cart</h1>
        </div>
        <div className="allCarts">
          {carts.map(({ seller, products }) =>
            products?.length ? (
              <Shop
                key={seller._id}
                seller={seller}
                products={products}
                loading={loading}
              />
            ) : null
          )}
        </div>
        <Modal open={msg} className="msg">
          {msg}
        </Modal>
      </div>
    );
  }
  return (
    <div className="fullCart">
      <div className="head">
        <h1>Cart</h1>
      </div>
      <div className="allCarts">Cart is empty.</div>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </div>
  );
};

const Shop = ({ seller, products, loading }) => {
  const { user, setCart } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [deliveryDetail, setDeliveryDetail] = useState({
    name: user.firstName + " " + user.lastName,
    phone: user.phone,
  });
  const [addressForm, setAddressForm] = useState(false);
  const total = products.reduce(
    (a, c) =>
      +(
        a +
        calculatePrice({ product: c.product, gst: seller.gst }) * c.qty
      ).toFixed(2),
    0
  );
  const milestoneTimeout = useRef();
  const submitOrder = () => {
    fetch("/api/submitOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller: seller._id,
        products: products.map(({ product, qty }) => ({
          product: {
            ...product,
            gst: seller.gst?.verified ? product.gst || seller.gst?.amount : 0,
          },
          qty,
        })),
        deliveryDetail,
        total,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setCart((prev) =>
            prev.filter(
              ({ product }) => !data.products.some((_id) => _id === product._id)
            )
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Order successfully submitted.</h4>
                <Link to="/account/myShopping/orders">View All orders</Link>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not submit order. Please try again.</h4>
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
              <h4>Could not submit order. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <div className="shop">
        <div className="seller">
          <div className="profile">
            <img src={seller.profileImg || "/profile-user.jpg"} />
            <p className="name">
              {seller.firstName} {seller.lastName} •{" "}
              <span className="role">Seller</span>
              <span className="contact">{seller.phone}</span>
            </p>
          </div>
        </div>
        <div className="cart">
          <ul className="items">
            {products.map(({ product, qty }, i) => (
              <CartItem key={i} gst={seller.gst} product={product} qty={qty} />
            ))}
            <div className="total">
              <p>
                <label>Total</label>₹{total}
              </p>
              <span className="note">
                All tax and fee inclued.
                <Tip>
                  Seller specified GST TAX and 10% Delivery Pay Fee applies to
                  all orders.
                </Tip>
              </span>
            </div>
          </ul>
          <span className="devider" />
          <div className="deliveryDetail">
            <div className="head">
              <h3>Delivery Information</h3>
              <button onClick={() => setAddressForm(true)}>Edit</button>
            </div>
            <ul>
              {Object.entries(deliveryDetail).map(([key, value], i) => (
                <li key={i}>
                  <label>{key}</label>
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="actions">
          <button
            onClick={() =>
              Confirm({
                label: "Placing order",
                className: "submitOrder",
                question: (
                  <>
                    You sure want to submit this order to seller?
                    <span className="note">
                      Note: You will only be charged when the seller approves
                      your order. and you create a Milestone.
                    </span>
                  </>
                ),
                callback: submitOrder,
              })
            }
            className=""
          >
            Submit order to seller
          </button>
        </div>
        <Modal
          open={addressForm}
          head={true}
          label="Delivery Address"
          setOpen={setAddressForm}
          className="addAddress"
        >
          <AddressForm
            client={{
              name: deliveryDetail.name,
              phone: deliveryDetail.phone,
              address: deliveryDetail,
            }}
            onSuccess={(data) => {
              setDeliveryDetail((prev) => ({ ...prev, ...data.address }));
              setAddressForm(false);
            }}
            onCancel={() => setAddressForm(false)}
          />
        </Modal>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </div>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
    </>
  );
};

export const CartItem = ({ product, gst, qty }) => {
  const { setCart } = useContext(SiteContext);
  const price = calculatePrice({ product, gst: gst || product.user?.gst });
  return (
    <li className={`item ${!product.images.length && "noImg"}`}>
      <img src={product.images[0] || "/open_box.png"} />
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
      <div className="price">
        <span className="qty">
          {price} x {qty}
        </span>
        ₹{+(price * qty).toFixed(2)}
        {
          // product.gst && <span className="gst">+{product.gst}% GST</span>
        }
      </div>
    </li>
  );
};

export default Marketplace;
