import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
  lazy,
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
  Cart_svg,
  Img,
  Moment,
  useOnScreen,
  Arrow_left_svg,
} from "./Elements";
import { AddressForm } from "./Forms";
import { SiteContext, ChatContext, socket } from "../SiteContext";
import { Link, Redirect } from "react-router-dom";
import { Modal, Confirm } from "./Modal";
import { MilestoneForm } from "./Account";
import { Chat } from "./Deals";
import queryString from "query-string";
import { toast } from "react-toastify";

require("./styles/marketplace.scss");

const Marketplace = ({ history, location, match }) => {
  const { userType } = useContext(SiteContext);
  const [loadingRef, loadingVisible] = useOnScreen({ rootMargin: "100px" });
  const sortOptions = useRef([
    {
      label: "Newest first",
      value: { column: "createdAt", order: "dsc" },
    },
    {
      label: "Oldest first",
      value: { column: "createdAt", order: "asc" },
    },
    {
      label: "Price high-low",
      value: { column: "price", order: "dsc" },
    },
    {
      label: "Price low-high",
      value: { column: "price", order: "asc" },
    },
  ]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(
    queryString.parse(location.search).type || ""
  );
  const [perPage, setPerPage] = useState(
    queryString.parse(location.search).perPage || 20
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(
    queryString.parse(location.search).q || ""
  );
  const [sort, setSort] = useState({
    column: queryString.parse(location.search).sort || "createdAt",
    order: queryString.parse(location.search).order || "dsc",
  });
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [category, setCategory] = useState("");
  const [seller, setSeller] = useState(
    queryString.parse(location.search).seller
  );
  const [sellerDetail, setSellerDetail] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const loadMore = () => {
    setLoadingMore(true);
    fetch(`/api/getProducts${location.search}&page=${page + 1}`)
      .then((res) => res.json())
      .then((data) => {
        setLoadingMore(false);
        if (data.code === "ok") {
          if (data.products.length) {
            setProducts((prev) => [...prev, ...data.products]);
            setPage((prev) => prev + 1);
          } else {
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
        setLoadingMore(false);
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
  };
  useEffect(() => {
    fetch(`/api/getProducts${location.search}&page=${1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setTotal(data.total);
          setProducts(data.products);
          if (data.seller) {
            setSellerDetail(data.seller);
            if (data.categories) {
              setCategories(data.categories);
            }
          } else {
            setSellerDetail(null);
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
          ...(search.length >= 4 && { q: search }),
          perPage,
          sort: sort.column,
          order: sort.order,
          ...(type && { type }),
          ...(category && { category }),
        }).toString(),
    });
  }, [page, search, sort, seller, type, category]);
  useEffect(() => {
    if (loadingVisible && total > products.length) {
      loadMore();
    }
  }, [loadingVisible]);
  useEffect(() => {}, []);
  return (
    <div className={`generic marketplace ${chatOpen ? "chatOpen" : ""}`}>
      <Header />
      {userType === "seller" && <Redirect to="/account/myShop/products" />}
      <div style={{ display: "none" }}>
        <X_svg />
      </div>
      <div className="benner">
        <h1>Delivery Pay Marketplace</h1>
      </div>
      <div className="content">
        <div className="mainContent">
          {sellerDetail && (
            <div className="sellerDetail">
              {sellerDetail.profileImg && (
                <Img className="logo" src={"/profile-user.jpg"} />
              )}
              <p>
                {seller.shopInfo?.shopName ||
                  sellerDetail.firstName + " " + sellerDetail.lastName}
              </p>
            </div>
          )}
          <div className="filters">
            <section className="categories">
              <label>Category</label>
              <Combobox
                defaultValue={0}
                options={[
                  { label: "All", value: "" },
                  ...categories.map((item) => ({ label: item, value: item })),
                ]}
                onChange={(e) => {
                  setCategory(e.value);
                }}
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
                placeholder="Search for products or services"
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
                defaultValue={sortOptions.current.find(
                  (item) =>
                    item.value.column === sort.column &&
                    item.value.order === sort.order
                )}
                options={sortOptions.current}
                onChange={(e) => setSort(e.value)}
              />
            </section>
          </div>
          <div className={`products ${products.length === 0 ? "empty" : ""}`}>
            {products.map((item) => (
              <Product key={item._id} data={item} />
            ))}
            {total > products.length && (
              <div className="placeholder">Loading</div>
            )}
            {products.length === 0 && (
              <div className="placeholder">
                <Img src="/open_box.png" />
                <p>No Product Found</p>
              </div>
            )}
          </div>
        </div>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </div>
      <div ref={loadingRef} />
      {sellerDetail && (
        <MiniChat client={sellerDetail} onToggle={setChatOpen} />
      )}
      <Footer />
    </div>
  );
};

const MiniChat = ({ client, onToggle }) => {
  const { user } = useContext(SiteContext);
  const { contacts, setContacts } = useContext(ChatContext);
  const [open, setOpen] = useState(false);
  const [userCard, setUserCard] = useState(null);
  const [chat, setChat] = useState(null);
  useEffect(() => {
    const clientChat = contacts.find(
      (contact) => contact.client._id === client._id
    );
    if (clientChat) {
      setUserCard({
        ...clientChat.client,
        status: clientChat.userBlock ? "blocked" : "",
      });
      setChat(clientChat.messages);
      socket.emit("initiateChat", {
        client_id: client._id,
        ...(clientChat.messages === undefined && { newChat: true }),
      });
    }
  }, [client, contacts]);
  useEffect(() => {
    onToggle?.(open);
  }, [open]);
  if (!open) {
    return (
      <button className="chatBtn" onClick={() => setOpen(true)}>
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
      </button>
    );
  }
  return (
    <div className="chatWrapper">
      <button className="closeChat" onClick={() => setOpen(false)}>
        <Arrow_left_svg />
      </button>
      <Chat
        chat={chat}
        setContacts={setContacts}
        userCard={userCard}
        setUserCard={setUserCard}
        user={user}
        setChat={setChat}
      />
    </div>
  );
};

const Product = ({ data }) => {
  const { user, userType, setCart } = useContext(SiteContext);
  let finalPrice = calculatePrice({ product: data, gst: data.user?.gst });
  return (
    <div className="product">
      <Link to={`/marketplace/${data._id}`}>
        <div className={`thumb ${data.images[0] ? "" : "noThumb"}`}>
          <Img src={data.images[0] || "/open_box.png"} />
        </div>
      </Link>
      <div className="detail">
        <h3>{data.name}</h3>
        <p className="dscr">{data.dscr}</p>
        <div className="price">
          <span className="symbol">₹ </span>
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
        {userType === "buyer" && data?.user._id === user?._id && (
          <p className="note">Can't buy product from self.</p>
        )}
        <button
          disabled={!data.available || data?.user._id === user?._id}
          onClick={() => {
            setCart((prev) => addToCart(prev, data));
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export const SingleProduct = ({ match }) => {
  const { user, setCart, userType } = useContext(SiteContext);
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
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
      <div className={`generic singleProduct ${chatOpen ? "chatOpen" : ""}`}>
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
              <Link to={`/marketplace?seller=${product.user?._id}`}>
                <div className="profile">
                  <Img src={product.user.profileImg || "/profile-user.jpg"} />
                  <p className="name">
                    {product.user.firstName} {product.user.lastName}{" "}
                    <span className="contact">{product.user.phone}</span>
                  </p>
                </div>
              </Link>
            </div>
            <div className="actions">
              <button
                disabled={
                  !product.available ||
                  userType === "seller" ||
                  product.user?._id === user?._id
                }
                onClick={() => {
                  setCart((prev) => addToCart(prev, product));
                }}
              >
                Add to Cart
              </button>
              {userType === "seller" && product?.user._id !== user?._id && (
                <p className="note">
                  Switch to buyer profile to buy this product.
                </p>
              )}
              {userType === "buyer" && product?.user._id === user?._id && (
                <p className="note">Can't buy product from self.</p>
              )}
            </div>
          </div>
          <Modal className="msg" open={msg}>
            {msg}
          </Modal>
        </div>
        {product && <MiniChat client={product.user} onToggle={setChatOpen} />}
        <Footer />
      </div>
    );
  }
  return (
    <div className={`generic singleProduct ${chatOpen ? "chatOpen" : ""}`}>
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
          <Img key={i} src={item} onClick={() => setView(item)} />
        ))}
        {images.length === 0 && <p>No image was provided by the seller.</p>}
      </div>
    </div>
  );
};

const ImageView = ({ img }) => {
  const [src, setSrc] = useState(img || "/open_box.png");
  const [boundingBody, setBoundingBody] = useState(null);
  const [applyStyle, setApplyStyle] = useState(false);
  const [style, setStyle] = useState({});
  const container = useRef();
  useLayoutEffect(() => {
    setBoundingBody(container.current?.getBoundingClientRect());
  }, []);
  useEffect(() => {
    setSrc(img || "/open_box.png");
  }, [img]);
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
      onTouchStart={(e) => {
        document.querySelector("body").style.overflow = "hidden";
        setApplyStyle(true);
      }}
      onTouchEnd={(e) => {
        document.querySelector("body").style.overflow = "auto";
        setApplyStyle(false);
      }}
      onTouchMove={(e) => {
        if (img) {
          const x =
            Math.abs(
              Math.round(
                (e.touches[0].clientX - boundingBody.x) /
                  (boundingBody.width / 100)
              )
            ) * 0.65;
          const y =
            Math.round(
              (e.touches[0].clientY - boundingBody.y) /
                (boundingBody.height / 100)
            ) * 0.65;
          setStyle({
            transform: `scale(2) translateY(${Math.max(
              30 + -y,
              -30
            )}%) translateX(${Math.max(30 + -x, -30)}%)`,
            transition: "none",
          });
        }
      }}
      onMouseEnter={() => setApplyStyle(true)}
      onMouseLeave={() => setApplyStyle(false)}
    >
      <img
        className={applyStyle ? "scale" : ""}
        style={applyStyle ? style : {}}
        src={src}
        onError={() => setSrc("/img_err.png")}
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
          {carts?.length === 0 && <p>Cart is empty</p>}
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
  const { user, setCart, config } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [deliveryDetail, setDeliveryDetail] = useState({
    name: user.firstName + " " + user.lastName,
    phone: user.phone,
  });
  const [addressForm, setAddressForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const total = +(
    products.reduce(
      (a, c) =>
        (
          a +
          calculatePrice({ product: c.product, gst: seller.gst }) * c.qty
        ).fix(),
      0
    ) + (seller.shopInfo?.shippingCost || 0)
  ).fix();
  const fee = (total * ((100 + config.fee) / 100) - total).fix();
  return (
    <>
      <div className="shop">
        <div className="seller">
          <div className="profile">
            <Img src={seller.profileImg || "/profile-user.jpg"} />
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
                <label>Shipping</label>₹{seller.shopInfo?.shippingCost}
              </p>
              <p>
                <label>Delivery Pay Fee {config.fee}%</label>₹{fee}
              </p>
              <hr />
              <p>
                <label>Total</label>₹{total + fee}
              </p>
              {
                //   <span className="note">
                //   All tax and fee inclued.
                //   <Tip>
                //     Seller specified GST TAX and 10% Delivery Pay Fee applies to
                //     all orders.
                //   </Tip>
                // </span>
              }
            </div>
            <div className="terms">
              <p>
                <label>Refundable: </label>
                {seller.shopInfo?.refundable || "N/A"}
              </p>
              <p>
                By proceeding, I agree to seller's all{" "}
                <span className="btn" onClick={() => setShowTerms(true)}>
                  Terms
                </span>
              </p>
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
          <button onClick={() => setMilestoneForm(true)}>Place order</button>
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
        <Modal
          className="milestoneRequest"
          head={true}
          label="Checkout"
          open={milestoneForm}
          setOpen={setMilestoneForm}
        >
          <MilestoneForm
            action="create"
            client={seller}
            definedAmount={total + fee}
            order={{
              products,
              deliveryDetail: {
                ...deliveryDetail,
                deliveryWithin: seller.shopInfo?.deliveryWithin,
              },
              total,
              refundable: seller.shopInfo?.refundable,
              terms: seller.shopInfo?.terms,
              shippingCost: seller.shopInfo?.shippingCost,
            }}
            onSuccess={({ milestone, order }) => {
              setCart((prev) =>
                prev.filter(({ product }) => {
                  return !order.products.some(
                    (order) => order.product._id === product._id
                  );
                })
              );
              setMilestoneForm(false);
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
            }}
          />
        </Modal>
        <Modal
          open={showTerms}
          setOpen={setShowTerms}
          head={true}
          label="Seller's Terms"
          className="shopTerms"
        >
          <ul>
            {seller.shopInfo?.terms?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
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
      <Img src={product.images[0] || "/open_box.png"} />
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
        ₹{(price * qty).fix()}
      </div>
      {gst?.verified && <Tip>Including {product.gst}% GST.</Tip>}
    </li>
  );
};

export default Marketplace;
