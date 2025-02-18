import {
  useEffect,
  useState,
  useContext,
  useRef,
  useLayoutEffect,
  lazy,
} from "react";
import { SiteContext } from "../../SiteContext";
import {
  Err_svg,
  Plus_svg,
  X_svg,
  Succ_svg,
  FileInput,
  NumberInput,
  UploadFiles,
  Combobox,
  Tabs,
  Checkbox,
  Chev_down_svg,
  Actions,
  Pagination,
  calculateDiscount,
  calculatePrice,
  Tip,
  Media,
  LS,
  Moment,
  moment,
  InputDateRange,
  Img,
} from "../Elements";
import { Modal, Confirm } from "../Modal";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import OrderManagement, { FullOrder } from "./OrderManagement";
import RefundManagement, { FullRefund } from "./RefundManagement";
import Campaigns from "./CampaignManagement";
import FBMarket from "./fbMarketplace";
import { updateProfileInfo } from "../Profile";
import { FacebookShareButton } from "react-share";
import { Step } from "./fbMarketplace";
import { CSVLink } from "react-csv";

const ShopSetup = lazy(() => import("./ShopSetup.js"));

require("../styles/products.scss");

const parseXLSXtoJSON = (file, cb) => {
  var name = file.name;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    const bstr = evt.target.result;
    const XLSX = await import("xlsx");
    const wb = XLSX.read(bstr, { type: "binary" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const arr = [];
    const cols = data.shift();
    data.forEach((row, i) => {
      const item = {};
      cols.forEach((col, j) => {
        let label;
        switch (col) {
          case "Images":
            label = "images";
            break;
          case "Name":
            label = "name";
            break;
          case "Description":
            label = "dscr";
            break;
          case "Material":
            label = "material";
            break;
          case "Size [Please specify mm, cm, inch or KG]":
            label = "size";
            break;
          case "Category":
            label = "category";
            break;
          case "Type":
            label = "type";
            break;
          case "Price in INR.":
            label = "price";
            break;
          case "Units Available":
            label = "available";
            break;
          case "HSN Code":
            label = "hsn";
            break;
          case "GST %":
            label = "gst";
            break;
          case "id":
            label = "_id";
            break;
          default:
        }
        item[label] = row[j];
      });
      arr.push(item);
    });
    cb(arr);
  };
  reader.readAsBinaryString(file);
};

const MyShop = ({ history, location, match }) => {
  const { user, userType } = useContext(SiteContext);
  const { FB } = window;
  const [msg, setMsg] = useState(null);
  const [categories, setCategories] = useState([]);
  const [shopSetupComplete, setShopSetupComplete] = useState(false);
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
      });
  }, []);
  useEffect(() => {
    if (
      !categories?.length ||
      !user.shopInfo?.terms?.length ||
      user.shopInfo?.shippingCost === undefined ||
      user.shopInfo?.shippingCost === null ||
      user.shopInfo?.refundable === undefined ||
      user.shopInfo?.paymentMethod === undefined ||
      user.shopInfo?.paymentMethod === null
    ) {
      setShopSetupComplete(false);
    } else {
      setShopSetupComplete(true);
    }
  }, [categories, user]);
  useEffect(() => {
    // FB.getLoginStatus(function (response) {
    //   if (response.status === "connected") {
    //     console.log(response);
    //     const accessToken = response.authResponse.accessToken;
    //     LS.set("facebook_user_accessToken", accessToken);
    //   }
    // });
    // FB.api(
    //   `/${user.fbMarket?.facebookPage?.id}`,
    //   "GET",
    //   { fields: "access_token" },
    //   (res) => {
    //     if (res.access_token) {
    //       LS.set("facebook_page_accessToken", res.access_token);
    //     }
    //   }
    // );
  }, [user]);
  if (!user.shopInfo) {
    return <ShopSetup />;
  }
  return (
    <>
      {userType === "buyer" && <Redirect to="/account/orders/current" />}
      <div className="myShop">
        <div style={{ display: "none" }}>
          <X_svg />
        </div>
        <Tabs
          basepath="/account/myShop/"
          tabs={[
            { label: "Products & Services", path: "products" },
            { label: "Orders", path: "orders" },
            { label: "Refunds", path: "refunds" },
            { label: "Campaigns", path: "campaigns" },
            { label: "FB Marketplace", path: "fbMarketplace" },
            { label: "Settings", path: "settings" },
          ]}
        />
        <Switch>
          <Route path="/account/myShop/products">
            <Products
              categories={categories}
              setCategories={setCategories}
              shopSetupComplete={shopSetupComplete}
            />
          </Route>
          <Route path="/account/myShop/orders/:_id" component={FullOrder} />
          <Route path="/account/myShop/orders">
            <OrderManagement categories={categories} />
          </Route>
          <Route path="/account/myShop/refunds/:_id" component={FullRefund} />
          <Route path="/account/myShop/refunds" component={RefundManagement} />
          <Route path="/account/myShop/campaigns" component={Campaigns} />
          <Route path="/account/myShop/fbMarketplace" component={FBMarket} />
          <Route path="/account/myShop/settings">
            <Settings categories={categories} setCategories={setCategories} />
          </Route>
        </Switch>
        <Modal className="msg" open={msg}>
          {msg}
        </Modal>
      </div>
    </>
  );
};
const ProductForm = ({ prefill, onSuccess, categories, setCategories }) => {
  const { user } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(
    prefill?.type ||
      (user.shopInfo?.offerings === "service" ? "service" : "product") ||
      "product"
  );
  const [addCat, setAddCat] = useState(false);
  const [category, setCategory] = useState(prefill?.category || "");
  const [discount, setDiscount] = useState({
    type: prefill?.discount?.type || null,
    amount: prefill?.discount?.amount || 0,
    dscr: prefill?.discount?.dscr || "",
  });
  const [name, setName] = useState(prefill?.name || "");
  const [dscr, setDscr] = useState(prefill?.dscr || "");
  const [price, setPrice] = useState(prefill?.price || "");
  const [files, setFiles] = useState(prefill?.images || []);
  const [gst, setGst] = useState(
    prefill?.gst || user.gst?.verified ? user.gst?.amount : 0
  );
  const [hsn, setHsn] = useState(prefill?.hsn || "");
  const [available, setAvailable] = useState(prefill?.available);
  const [msg, setMsg] = useState(null);
  const [tags, setTags] = useState(prefill?.tags || []);
  const [priceDetail, setPriceDetail] = useState({});
  useEffect(() => {
    const discountAmount = calculateDiscount({ price, discount });
    const gstAmount =
      (((+price || 0) - (+discountAmount || 0)) / 100) * (+gst || 0);
    const final = (price - discountAmount + gstAmount).fix();
    setPriceDetail({
      discount: discountAmount.fix(),
      gst: gstAmount.fix(),
      final,
    });
  }, [price, discount, gst]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const images = files.length
      ? await UploadFiles({
          files,
          setMsg,
        })
      : [];
    fetch(`/api/${prefill ? "edit" : "add"}Product`, {
      method: prefill ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name,
        dscr,
        price: +price,
        images,
        category,
        tags,
        available:
          available === true || available === false ? available : +available,
        gst,
        discount,
        ...(prefill && { _id: prefill._id }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data);
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>
                  You can't add more that 100 product at a time. Delete a
                  product/service and try again.
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
                <h4>Could not add product. please try again.</h4>
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
              <h4>Could not add product. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form onSubmit={submit} className={loading ? "loading" : ""}>
        <section className="type">
          <label>Type</label>
          <Combobox
            defaultValue={type}
            options={[
              { label: "Product", value: "product" },
              { label: "Service", value: "service" },
              { label: "Other", value: "other" },
            ]}
            onChange={(e) => {
              setType(e.value);
            }}
          />
        </section>
        <section className="name">
          <label>Name of the product/service</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={true}
          />
        </section>
        <section className="category">
          <label>
            Category{" "}
            <Tip>
              You can Add/Edit/Delete your categories{" "}
              <Link to="/account/myShop/settings">here</Link>
            </Tip>
          </label>
          <Combobox
            required={true}
            defaultValue={category}
            options={[
              ...categories.map((item) => ({ label: item, value: item })),
            ]}
            onChange={(e) => {
              if (e.value === "addNew") {
                setAddCat(true);
              } else {
                setCategory(e.value);
              }
            }}
          />
          <button
            type="button"
            className="clear"
            onClick={() => setAddCat(true)}
          >
            <Plus_svg />
          </button>
        </section>
        <section>
          <label>Price ₹</label>
          <NumberInput
            defaultValue={price}
            onChange={(e) => setPrice(e.target.value)}
            required={true}
          />
        </section>
        <section className="available">
          {type === "product" ? (
            <>
              <label>Available in stock</label>
              <NumberInput
                required={true}
                defaultValue={available}
                onChange={(e) => setAvailable(e.target.value)}
              />
            </>
          ) : (
            <>
              <label>Availability</label>
              <Combobox
                defaultValue={available}
                required={true}
                options={[
                  { label: "Available", value: true },
                  { label: "Not available", value: false },
                ]}
                onChange={(e) => setAvailable(e.value)}
              />
            </>
          )}
        </section>
        <section className="dscr">
          <label>Description of the product/service</label>
          <TextareaAutosize
            value={dscr}
            onChange={(e) => setDscr(e.target.value)}
            required={true}
          />
        </section>
        <section className="tags">
          <label>Tags</label>
          <ul>
            {tags.map((item) => (
              <li key={item}>
                {item}
                <button
                  onClick={() => {
                    setTags((prev) => prev.filter((tag) => tag !== item));
                  }}
                >
                  <X_svg />
                </button>
              </li>
            ))}
            <li className="form">
              <input
                placeholder="addNewTag"
                onKeyPress={(e) => {
                  const value = `${e.target.value.trim()}`;
                  if (e.charCode === 13) {
                    e.preventDefault();
                    if (!value) return;
                    setTags((prev) => [
                      ...prev.filter((tag) => tag !== value),
                      value,
                    ]);
                    e.target.focus();
                    e.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  const value = `${e.target.previousElementSibling.value.trim()}`;
                  if (!value) return;
                  setTags((prev) => [
                    ...prev.filter((tag) => tag !== value),
                    value,
                  ]);
                  input.value = "";
                  input.focus();
                }}
              >
                Add Tag
              </button>
            </li>
          </ul>
        </section>
        <section className="images">
          <label>Images of the product</label>
          <FileInput
            multiple={true}
            prefill={prefill?.images}
            accept="image/*"
            onChange={(files) => setFiles(files)}
          />
        </section>
        <section>
          <label>HSN Code</label>
          <input value={hsn} onChange={(e) => setHsn(e.target.value)} />
        </section>
        {user.gst?.verified && (
          <section>
            <label>GST (%)</label>
            <NumberInput
              defaultValue={gst}
              onChange={(e) => setGst(e.target.value)}
            />
          </section>
        )}
        <section className="discountType">
          <label>Discount Type</label>
          <Combobox
            defaultValue={discount.type}
            options={[
              { label: "None", value: null },
              { label: "Percent", value: "percent" },
              { label: "Flat", value: "flat" },
            ]}
            onChange={(e) =>
              setDiscount((prev) => ({ ...prev, type: e.value }))
            }
          />
        </section>
        {discount.type !== null && (
          <>
            <section className="discountAmount">
              <label>Amount {discount.type === "percent" && "(%)"}</label>
              <NumberInput
                defaultValue={discount.amount}
                onChange={(e) =>
                  setDiscount((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </section>
            <section className="discountDscr">
              <label>Discount description</label>
              <TextareaAutosize
                defaultValue={discount.dscr}
                onChange={(e) =>
                  setDiscount((prev) => ({ ...prev, dscr: e.target.value }))
                }
              />
            </section>
          </>
        )}
        {price && (
          <section className="finalPrice">
            <p>
              <label>Input price</label>
              {price}
            </p>
            {priceDetail.discount > 0 && (
              <p>
                <label>
                  Discount{" "}
                  {discount.type === "flat" ? "flat" : `${discount.amount}%`}
                </label>
                {priceDetail.discount}
              </p>
            )}
            {priceDetail.gst > 0 && (
              <p>
                <label>GST {gst}%</label>
                {priceDetail.gst}
              </p>
            )}
            <p className="final">
              <label>Listing Price</label>₹{priceDetail.final}
            </p>
          </section>
        )}
        <section className="btns">
          <button className="submit" type="submit">
            Submit
          </button>
        </section>
        <div className="pBtm" />
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
      <Modal
        head={true}
        className="categoryForm"
        label="Add category"
        open={addCat}
        setOpen={setAddCat}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const input = e.target.querySelector("input");
            const value = `${input.value}`;
            fetch("/api/addCategory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: value,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.code === "ok") {
                  setCategories(data.categories);
                  setCategory(value);
                  setAddCat(false);
                  input.value = "";
                } else {
                  setMsg(
                    <>
                      <button onClick={() => setMsg(null)}>Okay</button>
                      <div>
                        <Err_svg />
                        <h4>Could not add category. Try again.</h4>
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
                      <h4>Could not add category. Make sure you're online.</h4>
                    </div>
                  </>
                );
              });
          }}
        >
          <section>
            <label>Category</label>
            <input required={true} />
          </section>
          <section className="btns">
            <button className="submit">Add</button>
          </section>
        </form>
      </Modal>
    </>
  );
};

const Products = ({ categories, setCategories, shopSetupComplete }) => {
  const { user } = useContext(SiteContext);
  const { FB } = window;
  const [productForm, setProductForm] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({
    column: "createdAt",
    order: "dsc",
  });
  const [dateRange, setDateRange] = useState(null);
  const [type, setType] = useState("");
  const [products, setProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batch, setBatch] = useState([]);
  const [addMany, setAddMany] = useState(false);
  const [socialShare, setSocialShare] = useState(false);
  const [msg, setMsg] = useState(null);
  const deleteItems = (items) => {
    if (items.length) {
      fetch("/api/deleteProducts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _ids: items }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setBatch([]);
            setProducts((prev) =>
              prev.filter((item) => !items.some((_id) => _id === item._id))
            );
          } else {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Err_svg />
                  <h4>Could not delete products. Try again.</h4>
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
                <h4>Could not delete products. Make sure you're online.</h4>
              </div>
            </>
          );
        });
    }
  };
  const deleteMany = () => deleteItems(batch);
  const addToFbMarket = (_ids) => {
    fetch("/api/addToFbMarket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _ids }),
    })
      .then((res) => res.json())
      .then(({ code, fb_products }) => {
        if (code === "ok") {
          const success = [];
          const failed = [];
          fb_products.forEach((item, i) => {
            if (item.success) {
              success.push(item);
            } else {
              failed.push(item);
            }
          });
          setProducts((prev) =>
            prev.map((item) => {
              const prod = fb_products.find(
                (product) => product._id === item._id
              );
              if (prod) {
                return {
                  ...item,
                  fbMarketId: prod.fbMarketId,
                };
              } else {
                return item;
              }
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                {failed.length === 0 ? (
                  <>
                    <Succ_svg />
                    <h4>{success.length} products has been added.</h4>
                  </>
                ) : (
                  <>
                    <Err_svg />
                    <h4>{failed.length} products failed.</h4>
                  </>
                )}
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not add products to Facebook Marketplace.</h4>
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
                Could not add products to Facebook Marketplace. Make sure you're
                online.
              </h4>
            </div>
          </>
        );
      });
  };
  const removeFromFbMarket = (_ids) => {
    fetch("/api/removeFromFbMarket", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _ids }),
    })
      .then((res) => res.json())
      .then(({ code, fb_products }) => {
        if (code === "ok") {
          const success = [];
          const failed = [];
          fb_products.forEach((item, i) => {
            if (item.success) {
              success.push(item);
            } else {
              failed.push(item);
            }
          });
          setProducts((prev) =>
            prev.map((item) => {
              const prod = fb_products.find(
                (product) => product._id === item._id
              );
              if (prod) {
                return {
                  ...item,
                  fbMarketId: prod.fbMarketId,
                };
              } else {
                return item;
              }
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                {failed.length === 0 ? (
                  <>
                    <Succ_svg />
                    <h4>{success.length} products has been removed.</h4>
                  </>
                ) : (
                  <>
                    <Err_svg />
                    <h4>{failed.length} products failed to remove.</h4>
                  </>
                )}
              </div>
            </>
          );
          // console.log(data);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not remove products from Facebook Marketplace.</h4>
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
                Could not remove products from Facebook Marketplace. Make sure
                you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  const share = (_ids) => {
    fetch("/api/shareProducts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: _ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Product has been shared.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not share products. please try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not share products. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
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
      `/api/products?${new URLSearchParams({
        ...(search && { q: search }),
        page,
        perPage,
        sort: sort.column,
        order: sort.order,
        ...(dateRange && {
          dateFrom: startDate,
          dateTo: endDate,
        }),
        ...(category && { category }),
        ...(type && { type }),
      })}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setProducts(data.products);
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
              <h4>Could not get products.</h4>
            </div>
          </>
        );
      });
  }, [category, search, page, perPage, type, addMany, dateRange]);
  useEffect(() => {
    if (selectAll) {
      // setBatch(products.map((item) => item._id));
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
        <p>Product Management</p>
        {shopSetupComplete ? (
          <>
            <button className="pill" onClick={() => setProductForm(true)}>
              <Plus_svg /> Add Product
            </button>
            <button
              className="pill batchUpload"
              onClick={() => setAddMany(true)}
            >
              <Plus_svg /> Batch Upload
            </button>
          </>
        ) : (
          <Link to="/account/myShop/settings" className="err">
            <p>Please complete your shop information to add product.</p>
          </Link>
        )}
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
            placeholder="Search for products & services"
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
            defaultValue={0}
            options={[
              { label: "All", value: "" },
              { label: "Product", value: "product" },
              { label: "Service", value: "service" },
              { label: "Other", value: "other" },
            ]}
            onChange={(e) => setType(e.value)}
          />
        </section>
        <section className="category">
          <label>Category:</label>
          <Combobox
            defaultValue={0}
            options={[
              { label: "All", value: "" },
              ...categories.map((item) => ({
                label: item,
                value: item,
              })),
            ]}
            onChange={(e) => setCategory(e.value)}
          />
        </section>
        <section className={`date`}>
          <InputDateRange
            dateRange={dateRange}
            onChange={(range) => setDateRange(range)}
          />
        </section>
      </div>
      <table className="table products">
        <thead>
          {batch.length > 0 ? (
            <tr className="batchAction">
              <th className="checkContainer">
                <Checkbox
                  value={selectAll}
                  defaultValue={selectAll}
                  onChange={(e) => setSelectAll(e)}
                />
              </th>
              <th>
                <button
                  onClick={() =>
                    Confirm({
                      label: "Batch delete",
                      question: `You sure you want to delete these ${batch.length} items?`,
                      callback: deleteMany,
                    })
                  }
                >
                  Delete
                </button>
              </th>
              {user.fbMarket?.userAgreement && (
                <>
                  <th>
                    <button
                      onClick={() => {
                        addToFbMarket(batch);
                        setBatch([]);
                      }}
                    >
                      Add to Facebook
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => {
                        removeFromFbMarket(batch);
                        setBatch([]);
                      }}
                    >
                      Remove from Facebook
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => {
                        setSocialShare(true);
                      }}
                    >
                      Share on Social media
                    </button>
                  </th>
                </>
              )}
            </tr>
          ) : (
            <tr>
              <th className="checkContainer">
                <Checkbox
                  value={selectAll}
                  defaultValue={selectAll}
                  onChange={(e) => setSelectAll(e)}
                />
              </th>
              <th className="date">Date</th>
              <th>Image</th>
              <th className="name">Name</th>
              <th>Type</th>
              <th>Facebook Marketplace</th>
              <th>Available</th>
              <th>Price</th>
              <th>GST</th>
              <th>Discount</th>
              <th>Listing Price</th>
              {
                // <th>Sold</th>
              }
              <th>Actions</th>
            </tr>
          )}
        </thead>
        <tbody>
          {products.map((product) => (
            <SingleProduct
              categories={categories}
              key={product._id}
              product={product}
              setProducts={setProducts}
              selectAll={selectAll}
              setBatch={setBatch}
              batch={batch}
              deleteItems={deleteItems}
              addToFbMarket={addToFbMarket}
              removeFromFbMarket={removeFromFbMarket}
            />
          ))}
          {products.length === 0 && (
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
      <Modal
        head={true}
        label="Edit Product/Service"
        setOpen={setProductForm}
        open={productForm}
        className="productForm"
      >
        <ProductForm
          categories={categories}
          setCategories={setCategories}
          onSuccess={({ product, fbMarket }) => {
            setProducts((prev) => [product, ...prev]);
            setProductForm(false);
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4>Product added.</h4>
                </div>
              </>
            );
          }}
        />
      </Modal>
      <Modal
        open={addMany}
        head={true}
        label="Batch product upload"
        setOpen={setAddMany}
        className="batchItemPreview"
      >
        <BatchUpload
          categories={categories}
          onSuccess={() => {
            setAddMany(false);
          }}
        />
      </Modal>
      <Modal
        open={socialShare}
        setOpen={setSocialShare}
        head={true}
        label="Share on Social media"
        className="socialShare"
      >
        <SocialShare
          products={batch}
          onSuccess={() => {
            setSocialShare(false);
            setMsg(
              <>
                <button
                  onClick={() => {
                    setMsg(null);
                    setBatch([]);
                  }}
                >
                  Okay
                </button>
                <div>
                  <Succ_svg />
                  <h4>Product shared.</h4>
                </div>
              </>
            );
          }}
        />
      </Modal>
    </>
  );
};
const SingleProduct = ({
  product,
  setProducts,
  categories,
  selectAll,
  setBatch,
  batch,
  deleteItems,
  addToFbMarket,
  removeFromFbMarket,
}) => {
  const { user } = useContext(SiteContext);
  const [selected, setSelected] = useState(selectAll || false);
  const [socialShare, setSocialShare] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showInstaForm, setShowInstaForm] = useState(false);
  const [msg, setMsg] = useState(false);
  useEffect(() => {
    setSelected(selectAll);
  }, [selectAll]);
  useEffect(() => {
    if (selected) {
      setBatch((prev) => [...prev, product._id]);
    } else {
      setBatch((prev) => prev.filter((item) => item !== product._id));
    }
  }, [selected]);
  return (
    <tr className={`product ${selected ? "selected" : ""}`}>
      <td className="checkContainer">
        <Checkbox
          defaultValue={selected}
          value={selected}
          onChange={(e) => {
            setSelected(e);
          }}
        />
      </td>
      <td className="date">
        <Moment format="DD-MM-YY">{product.createdAt}</Moment>
      </td>
      <td className="thumbs">
        <Media links={product.images} />
      </td>
      <td className="name">{product.name}</td>
      <td>{product.type}</td>
      <td>{product.fbMarketId ? "Added" : "N/A"}</td>
      <td>
        {product.available} {product.available === true && "Available"}
        {product.available === false && "Unavailable"}
      </td>
      <td>₹{product.price}</td>
      <td>
        {user.gst?.verified
          ? (product.gst || user.gst?.amount || 0) + "%"
          : "N/A"}
      </td>
      <td>₹{calculateDiscount(product) || 0}</td>
      <td>₹{calculatePrice({ product, gst: user.gst }) || 0}</td>
      <td>
        {batch.length === 0 && (
          <Actions icon={<Chev_down_svg />}>
            <Link to={`/marketplace/${product._id}`} target="_blank">
              View
            </Link>
            {user.fbMarket?.userAgreement && (
              <>
                {product.fbMarketId ? (
                  <button onClick={() => removeFromFbMarket([product._id])}>
                    Remove from Facebook
                  </button>
                ) : (
                  <button onClick={() => addToFbMarket([product._id])}>
                    Add to Facebook
                  </button>
                )}
              </>
            )}
            {user.fbMarket?.instagramAccount?.id && (
              <button onClick={() => setShowInstaForm(true)}>
                Post to instagram
              </button>
            )}
            {!user.fbMarket?.userAgreement && (
              <Link to="/account/myShop/fbMarketplace" className="edit">
                Setup FB Marketplace
              </Link>
            )}
            {user.fbMarket?.user?.access_token && (
              <button onClick={() => setSocialShare(true)}>
                Share on Social media
              </button>
            )}
            <FacebookShareButton
              resetButtonStyle={false}
              url={`deliverypay.in/marketplace/${product._id}`}
            >
              Post on Facebook
            </FacebookShareButton>
            <button className="edit" onClick={() => setEdit(true)}>
              Edit
            </button>
            <button
              className="delete"
              onClick={() =>
                Confirm({
                  label: "Removing Product",
                  question: "You sure want to delete this product?",
                  callback: () => deleteItems([product._id]),
                })
              }
            >
              Delete
            </button>
          </Actions>
        )}
      </td>
      <Modal
        head={true}
        label="Edit Product/Service"
        open={edit}
        setOpen={setEdit}
        className="productForm"
      >
        <ProductForm
          categories={categories}
          onSuccess={({ product }) => {
            setProducts((prev) =>
              prev.map((item) => {
                if (item._id === product._id) {
                  return product;
                } else {
                  return item;
                }
              })
            );
            setEdit(false);
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4>Product updated.</h4>
                </div>
              </>
            );
          }}
          prefill={product}
        />
      </Modal>
      <Modal
        head={true}
        label="Post to Instagram"
        open={showInstaForm}
        setOpen={setShowInstaForm}
        className="instaForm"
      >
        <InstaForm
          product={product}
          onSuccess={() => setShowInstaForm(false)}
        />
      </Modal>
      <Modal
        open={socialShare}
        setOpen={setSocialShare}
        head={true}
        label="Share on Social media"
        className="socialShare"
      >
        <SocialShare
          products={[product._id]}
          onSuccess={() => {
            setSocialShare(false);
            setMsg(
              <>
                <button
                  onClick={() => {
                    setMsg(null);
                  }}
                >
                  Okay
                </button>
                <div>
                  <Succ_svg />
                  <h4>Product shared.</h4>
                </div>
              </>
            );
          }}
        />
      </Modal>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </tr>
  );
};
const InstaForm = ({ product, onSuccess }) => {
  const { FB } = window;
  const { user } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(product.images[0]);
  const [caption, setCaption] = useState("");
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    FB.api(
      `/${user.fbMarket?.instagramAccount?.id}/media`,
      "POST",
      {
        caption,
        image_url: img,
        access_token: user.fbMarket.user.access_token,
      },
      (res) => {
        if (res.error) {
          console.log(res.error);
          setMsg(
            <>
              <button
                onClick={() => {
                  setMsg(null);
                }}
              >
                Okay
              </button>
              <div>
                <Err_svg />
                <h4>{res.error.message}</h4>
              </div>
            </>
          );
          setLoading(false);
          return;
        }
        FB.api(
          `/${user.fbMarket?.instagramAccount?.id}/media_publish`,
          "POST",
          {
            creation_id: res.id,
            access_token: user.fbMarket.user.access_token,
          },
          (res) => {
            setLoading(false);
            if (res.error) {
              console.log(res.error);
              setMsg(
                <>
                  <button
                    onClick={() => {
                      setMsg(null);
                    }}
                  >
                    Okay
                  </button>
                  <div>
                    <Err_svg />
                    <h4>{res.error.message}</h4>
                  </div>
                </>
              );
              return;
            }
            console.log(res);
            setMsg(
              <>
                <button
                  onClick={() => {
                    setMsg(null);
                    onSuccess?.();
                  }}
                >
                  Okay
                </button>
                <div>
                  <Succ_svg />
                  <h4>Successfully posted.</h4>
                </div>
              </>
            );
          }
        );
      }
    );
  };
  return (
    <>
      <form className="content" onSubmit={submit}>
        <div className="profile">
          <Img src={user.fbMarket?.instagramAccount?.profile_picture_url} />
          <p>{user.fbMarket?.instagramAccount?.username}</p>
        </div>
        <Img src={img} className="main" />
        <div className="thumbs">
          {product.images?.map((img, i) => (
            <Img key={i} src={img} onClick={() => setImg(img)} />
          ))}
        </div>
        <section>
          <label>Caption</label>
          <TextareaAutosize
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
          />
        </section>
        <section className="btns">
          <button className="submit pill">Post</button>
        </section>
      </form>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
    </>
  );
};

const BatchUpload = ({ onSuccess, categories }) => {
  const { user } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [batchItems, setBatchItems] = useState(null);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState(user.shopInfo.offerings || "");
  const [csvDraft, setCsvDraft] = useState(null);
  const addBatchProducts = () => {
    setLoading(true);
    fetch("/api/updateDraft", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: batchItems }),
    })
      .then((res) => res.json())
      .then(({ code, updated }) => {
        setLoading(false);
        if (code === "ok") {
          setMsg(
            <>
              <button
                onClick={() => {
                  setMsg(null);
                  onSuccess?.();
                }}
              >
                Okay
              </button>
              <div>
                {updated ? <Succ_svg /> : <Err_svg />}
                <h4>{updated} items has been updated.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not add products. Try again.</h4>
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
              <h4>Could not add products. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  const uploadImages = async (e) => {
    e.preventDefault();
    setLoading(true);
    const imgLinks = (await UploadFiles({ files: images, setMsg })) || [];
    if (imgLinks.length !== images.length) {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Could not upload images. Please try again.</h4>
          </div>
        </>
      );
      return;
    }
    fetch("/api/uploadProductImg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: imgLinks,
        category,
        type,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          const headers = Object.entries({
            Images: "images",
            id: "_id",
            Name: "name",
            Description: "dscr",
            Material: "material",
            "Size [Please specify mm, cm, inch or KG]": "size",
            Category: "category",
            Type: "type",
            "Price in INR.": "price",
            "Units Available": "available",
            "HSN Code": "hsn",
            "GST %": "gst",
          }).map(([key, value]) => ({
            label: key,
            key: value,
          }));
          setCsvDraft({
            headers,
            data: data.products,
            filename: `Delivery Pay Product Draft.csv`,
          });
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not add products. Make sure you're online.</h4>
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
              <h4>Could not add products. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <div className="content">
      <Step
        label="Create Draft"
        className="createDraft"
        defaultStatus={step === 1}
        data={csvDraft}
      >
        <>
          <form onSubmit={uploadImages}>
            <section className="type">
              <label>Type</label>
              <Combobox
                defaultValue={type}
                options={[
                  { label: "Product", value: "product" },
                  { label: "Service", value: "service" },
                  { label: "Other", value: "other" },
                ]}
                required={true}
                onChange={(e) => setType(e.value)}
              />
            </section>
            <section className="category">
              <label>Choose category</label>
              <Combobox
                options={categories.map((item) => ({
                  label: item,
                  value: item.toLowerCase(),
                }))}
                required={true}
                onChange={(e) => setCategory(e.value)}
              />
            </section>
            <p>
              Choose images{" "}
              <span>
                Choose 1 image for each product. you can add multiple images
                later.
              </span>
            </p>
            <FileInput onChange={(files) => setImages(files)} multiple={true} />
            <section className="btns">
              <button
                className="clean"
                type="button"
                onClick={() => setStep(3)}
              >
                Already have a draft
              </button>
              {csvDraft ? (
                <CSVLink
                  {...csvDraft}
                  className="submit"
                  type="submit"
                  onClick={() => {
                    setCsvDraft(null);
                    setStep(2);
                  }}
                >
                  Download Draft
                </CSVLink>
              ) : (
                <button className="submit">Create Draft</button>
              )}
            </section>
          </form>
        </>
      </Step>
      <Step label="Populate With data" defaultStatus={step === 2}>
        <p>
          Populate the Sheet with real product data. Don't Change the header.
        </p>
        <button className="submit" onClick={() => setStep(3)}>
          Next
        </button>
      </Step>
      <Step label="Upload Draft" defaultStatus={step === 3}>
        {!!batchItems?.length && (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Images</th>
                <th className="name">Name</th>
                <th className="dscr">Description</th>
                <th>Available</th>
                <th>Price</th>
                <th>GST</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {batchItems?.map((item, i) => (
                <tr key={i}>
                  <td>{item.type}</td>
                  <td className="thumbs">
                    <Media links={item.images} />
                  </td>
                  <td className="name">{item.name}</td>
                  <td className="dscr">{item.dscr}</td>
                  <td>
                    {item.available}
                    {item.available === true && "Available"}
                    {item.available === false && "Unavailable"}
                  </td>
                  <td>{item.price}</td>
                  <td>{item.gst}</td>
                  <td>
                    <button
                      className="remove"
                      onClick={() =>
                        setBatchItems((prev) => {
                          const newItems = [...prev];
                          newItems.splice(i, 1);
                          return newItems;
                        })
                      }
                    >
                      <X_svg />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!batchItems?.length && (
          <div className="uploadFile">
            <p>
              Upload xlsx/csv file in. See the example file{" "}
              <a
                href="/batch_product_upload_xlsx_file_example.csv"
                target="_blank"
              >
                here
              </a>
              .
            </p>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                if (e.target.files[0]) {
                  parseXLSXtoJSON(e.target.files[0], (result) => {
                    if (result?.length) {
                      setBatchItems(
                        result
                          .filter(
                            (item) =>
                              item.type &&
                              item.category &&
                              item.name &&
                              item.dscr &&
                              item.price !== undefined
                          )
                          .map((item) => ({
                            ...item,
                            status: "",
                            images: item.images
                              .split(/,( |\n)/)
                              .filter((item) => item.trim()),
                          }))
                      );
                    }
                  });
                }
                e.target.value = null;
              }}
            />
          </div>
        )}
        {!!batchItems?.length && (
          <button
            className="submit"
            onClick={() =>
              Confirm({
                label: "Adding Batch products",
                question: "You sure want to add all these items?",
                callback: addBatchProducts,
              })
            }
          >
            Add
          </button>
        )}
      </Step>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const SocialShare = ({ products, onSuccess }) => {
  const { FB } = window;
  const { user } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [igs, setIgs] = useState([]);
  const [pages, setPages] = useState([]);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    FB.api(
      `/me/accounts`,
      "GET",
      {
        fields:
          "instagram_business_account{profile_picture_url, username},picture{url},access_token,category,name",
        access_token: user.fbMarket?.user?.access_token,
      },
      (resp) => {
        if (resp.data) {
          setPages(
            resp.data.map((item) => {
              if (item.instagram_business_account) {
                setIgs((prev) => [
                  ...prev,
                  {
                    ...item.instagram_business_account,
                    publish: true,
                  },
                ]);
              }
              return { ...item, publish: true };
            })
          );
        }
      }
    );
    FB.api(
      `/me/groups`,
      "GET",
      {
        fields: "name,picture{url}",
        access_token: user.fbMarket?.user?.access_token,
      },
      (resp) => {
        if (resp.data) {
          setGroups(resp.data.map((item) => ({ ...item, publish: true })));
        }
      }
    );
  }, []);
  const allPages = pages.filter((item) => item.publish).length === pages.length;
  const allIgs = igs.filter((item) => item.publish).length === igs.length;
  const allGroups =
    groups.filter((item) => item.publish).length === groups.length;
  const post = () => {
    setLoading(true);
    fetch("/api/shareProducts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products,
        pages: pages
          .filter((item) => item.publish)
          .map((item) => ({ id: item.id, access_token: item.access_token })),
        igs: igs
          .filter((item) => item.publish)
          .map((item) => ({ id: item.id })),
        groups: groups.filter((item) => item.publish),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.();
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not share products. Try again.</h4>
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
              <h4>Could not share products. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <div className="content">
        <h2>
          Pages{" "}
          <button
            className="clear"
            onClick={() =>
              setPages((prev) =>
                prev.map((item) => ({ ...item, publish: !allPages }))
              )
            }
          >
            {allPages ? <Succ_svg /> : <Err_svg />}
          </button>
        </h2>
        <table className="table pages">
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>
                  <Img src={page.picture?.data?.url} />
                </td>
                <td className="name">
                  {page.name}
                  <span className="category">{page.category}</span>
                </td>
                <td>
                  <button
                    className="clear"
                    onClick={() => {
                      setPages((prev) =>
                        prev.map((item) => {
                          if (item.id === page.id) {
                            return {
                              ...item,
                              publish: !item.publish,
                            };
                          } else {
                            return item;
                          }
                        })
                      );
                    }}
                  >
                    {page.publish ? <Succ_svg /> : <Err_svg />}
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr className="placeholder">
                <td>No page found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <h2>
          Instagram{" "}
          <button
            className="clear"
            onClick={() =>
              setIgs((prev) =>
                prev.map((item) => ({ ...item, publish: !allIgs }))
              )
            }
          >
            {allIgs ? <Succ_svg /> : <Err_svg />}
          </button>
        </h2>
        <p className="note">
          *Make sure image aspect ratio is correct. otherwise product may not be
          posted on instagram.
        </p>
        <table className="table ig">
          <tbody>
            {igs.map((ig) => (
              <tr key={ig.id}>
                <td>
                  <Img src={ig.profile_picture_url} />
                </td>
                <td className="name">{ig.username}</td>
                <td>
                  <button
                    className="clear"
                    onClick={() => {
                      setIgs((prev) =>
                        prev.map((item) => {
                          if (item.id === ig.id) {
                            return {
                              ...item,
                              publish: !item.publish,
                            };
                          } else {
                            return item;
                          }
                        })
                      );
                    }}
                  >
                    {ig.publish ? <Succ_svg /> : <Err_svg />}
                  </button>
                </td>
              </tr>
            ))}
            {igs.length === 0 && (
              <tr className="placeholder">
                <td>No Instagram busines account found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <h2>
          Groups{" "}
          <button
            className="clear"
            onClick={() =>
              setGroups((prev) =>
                prev.map((item) => ({ ...item, publish: !allGroups }))
              )
            }
          >
            {allGroups ? <Succ_svg /> : <Err_svg />}
          </button>
        </h2>
        <p className="note">
          *Make sure you are an admin of the group or at least have permission
          to post on the group.
        </p>
        <table className="table groups">
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>
                  <Img src={group.picture?.data?.url} />
                </td>
                <td className="name">{group.name}</td>
                <td>
                  <button
                    className="clear"
                    onClick={() => {
                      setGroups((prev) =>
                        prev.map((item) => {
                          if (item.id === group.id) {
                            return {
                              ...item,
                              publish: !item.publish,
                            };
                          } else {
                            return item;
                          }
                        })
                      );
                    }}
                  >
                    {group.publish ? <Succ_svg /> : <Err_svg />}
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr className="placeholder">
                <td>No group found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="publish fill" onClick={post}>
        Post
      </button>
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

export const defaultTerms = [
  "Buyer will be responsible for paying for shipping costs & for returning the item.",
  "Shipping costs are nonrefundable.",
  "Orders must be returned with Original Packaging & Securely.",
  "Orders must be Returned Via Trackable / Traceable Courier Services Only.",
  "Proof of Return via Photo of Tracking Number & Dispatch Ticket is Required.",
  "Refund is Only Issued Upon Delivery of Return Package.",
];
const Settings = ({ categories, setCategories }) => {
  const { user, setUser } = useContext(SiteContext);
  const [shopEdit, setShopEdit] = useState(false);
  const [gstEdit, setGstEdit] = useState(false);
  const [shippingEdit, setShippingEdit] = useState(false);
  const [termsEdit, setTermsEdit] = useState();
  const [editPayment, setEditPayment] = useState(false);
  const [msg, setMsg] = useState(null);
  return (
    <div className="settings">
      <div className="caution">
        {!categories?.length && <p className="err">Add at least 1 category.</p>}
        {!user.shopInfo?.terms?.length && (
          <p className="err">Add Return policy terms</p>
        )}
        {(user.shopInfo?.shippingCost === undefined ||
          user.shopInfo?.shippingCost === null ||
          user.shopInfo?.refundable === undefined) && (
          <p className="err">Add Shipping & Delivery detail</p>
        )}
        {!user.shopInfo?.paymentMethod && (
          <p className="err">Add valid payment method</p>
        )}
      </div>
      <div className="gst">
        <h2 className="head">
          Shop detail{" "}
          {!shopEdit && <button onClick={() => setShopEdit(true)}>Edit</button>}
        </h2>
        {shopEdit ? (
          <ShopEditForm setOpen={setShopEdit} setMsg={setMsg} />
        ) : (
          <>
            <p>We sell: {user.shopInfo.offerings}</p>
            <p>Brand/Shop name: {user.shopInfo.name}</p>
            <p>
              Logo: <Img className="logo" src={user.shopInfo.logo} />
            </p>
            <p>
              Phone:
              {user.shopInfo.phone}
            </p>
          </>
        )}
      </div>
      <div className="cat">
        <h2 className="head">Categories</h2>
        <ul className="categories">
          {categories.map((item, i) => (
            <li key={i}>
              {item}{" "}
              <button
                onClick={() =>
                  Confirm({
                    label: "Remove Category",
                    question: "You sure want to remove this category?",
                    callback: () => {
                      fetch("/api/categories", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          category: item,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.code === "ok") {
                            setCategories((prev) =>
                              prev.filter((cat) => cat !== item)
                            );
                          } else {
                            setMsg(
                              <>
                                <button onClick={() => setMsg(null)}>
                                  Okay
                                </button>
                                <div>
                                  <Err_svg />
                                  <h4>Could not delete category. Try again.</h4>
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
                                  Could not delete category. Make sure you're
                                  online.
                                </h4>
                              </div>
                            </>
                          );
                        });
                    },
                  })
                }
              >
                <X_svg />
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="placeholder">No category found.</li>
          )}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.querySelector("input");
            fetch("/api/addCategory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: input.value,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.code === "ok") {
                  setCategories(data.categories);
                  input.value = "";
                } else {
                  setMsg(
                    <>
                      <button onClick={() => setMsg(null)}>Okay</button>
                      <div>
                        <Err_svg />
                        <h4>Could not add category. Try again.</h4>
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
                      <h4>Could not add category. Make sure you're online.</h4>
                    </div>
                  </>
                );
              });
          }}
        >
          <input
            type="text"
            required={true}
            placeholder="New Category. ie Mobile"
          />
          <button>Add category</button>
        </form>
      </div>
      <div className="gst">
        <h2 className="head">
          GST{" "}
          {!gstEdit && <button onClick={() => setGstEdit(true)}>Edit</button>}
        </h2>
        <p className="status">
          Status:{" "}
          <strong>{user.gst?.verified ? "Verified" : "Unverified"}</strong>
        </p>
        {gstEdit ? (
          <GstEditForm setOpen={setGstEdit} setMsg={setMsg} />
        ) : (
          <>
            <p>GST Registration number: {user.gst?.detail?.reg || "N/A"}</p>
            <p>
              GST amount: {user.gst?.amount ? user.gst.amount + "%" : "N/A"}
            </p>
            <p>
              Files for verification:{" "}
              {!user.gst?.detail?.files?.length && "N/A"}
            </p>
            {user.gst?.detail?.files?.length && (
              <ul className="thumbs">
                <Media links={user.gst?.detail?.files} />
              </ul>
            )}
          </>
        )}
        {!user.gst?.verified && (
          <p className="note">
            *GST will apply once we review and verify your GST registraion.
          </p>
        )}
      </div>
      <div className="payment">
        <h2 className="head">
          Payment Method{" "}
          {!editPayment && (
            <button onClick={() => setEditPayment(true)}>Edit</button>
          )}
        </h2>
        {editPayment ? (
          <PaymentMethodForm
            prefill={user.shopInfo?.paymentMethod}
            setOpen={setEditPayment}
            setMsg={setMsg}
          />
        ) : (
          <>
            {user.shopInfo.paymentMethod?.bank ? (
              <>
                <p>Name: {user.shopInfo?.paymentMethod?.name || "--"}</p>
                <p>Bank: {user.shopInfo?.paymentMethod?.bank || "--"}</p>
                <p>City: {user.shopInfo?.paymentMethod?.city || "--"}</p>
                <p>
                  Account type:{" "}
                  {user.shopInfo?.paymentMethod?.accountType || "--"}
                </p>
                <p>
                  Account Number:{" "}
                  {user.shopInfo?.paymentMethod?.accountNumber || "--"}
                </p>
                <p>ifsc: {user.shopInfo?.paymentMethod?.ifsc || "--"}</p>
              </>
            ) : (
              <>
                <p>Payment method: {user.shopInfo.paymentMethod}</p>
              </>
            )}
          </>
        )}
      </div>
      <div className="terms shipping">
        <h2 className="head">
          Shipping & Delivery{" "}
          {!shippingEdit && (
            <button onClick={() => setShippingEdit(true)}>Edit</button>
          )}
        </h2>
        {shippingEdit ? (
          <ShippingEditForm setOpen={setShippingEdit} setMsg={setMsg} />
        ) : (
          <>
            <p>
              Shipping cost:{" "}
              {user.shopInfo?.shippingCost
                ? "₹" + user.shopInfo?.shippingCost
                : "N/A"}
            </p>
            <p>
              Delivery within (days): {user.shopInfo?.deliveryWithin || "N/A"}
            </p>
            <p>Refundable: {user.shopInfo?.refundable?.toString() || "N/A"}</p>
          </>
        )}
      </div>
      {
        //   <div className="terms payment">
        //   <h2 className="head">Deposit & Payment Terms</h2>
        //   <p>
        //     Refundable [ I will accept Returns ] / Non Refundable [ I will not
        //     accept returns , My payment should be released as soon as my Order is
        //     Delivered ] as Options before Requesting for a Payment.
        //   </p>
        // </div>
      }
      <div className="terms return">
        <h2 className="head">
          Return Policy Terms{" "}
          {!termsEdit && (
            <button onClick={() => setTermsEdit(true)}>Edit</button>
          )}
        </h2>
        <TermsEditForm
          setOpen={setTermsEdit}
          termsEdit={termsEdit}
          setMsg={setMsg}
        />
      </div>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

const ShopEditForm = ({ setOpen, setMsg }) => {
  const { user, setUser } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState(user.shopInfo?.offerings || "");
  const [shopName, setShopName] = useState(user.shopInfo?.name || "");
  const [phone, setPhone] = useState(user.shopInfo?.phone || "");
  const [logo, setLogo] = useState(
    user.shopInfo?.logo ? [user.shopInfo.logo] : []
  );
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const [logoLink] = (await UploadFiles({ files: logo, setMsg })) || [];
    updateProfileInfo({
      "shopInfo.offerings": offerings,
      "shopInfo.name": shopName,
      "shopInfo.phone": phone,
      "shopInfo.logo": logoLink,
    })
      .then(({ user: newUser }) => {
        setLoading(false);
        if (newUser) {
          setUser((prev) => ({ ...prev, shopInfo: newUser.shopInfo }));
          setOpen(false);
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
              <h4>Could not upadte GST Information. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  return (
    <form onSubmit={submit}>
      <section>
        <label>We sell</label>
        <Combobox
          defaultValue={offerings}
          options={[
            { label: "Product", value: "product" },
            { label: "Service", value: "service" },
            { label: "Both", value: "product,service" },
          ]}
          onChange={(option) => setOfferings(option.value)}
        />
      </section>
      <section>
        <label>Shop Name</label>
        <input
          required={true}
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />
      </section>
      <section>
        <label>Logo</label>
        <FileInput prefill={logo} onChange={(files) => setLogo(files)} />
      </section>
      <section>
        <label>Phone</label>
        <input
          required={true}
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </section>
      <section className="btns">
        <button>Save Changes</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </section>
    </form>
  );
};
const GstEditForm = ({ setOpen, setMsg }) => {
  const { user, setUser } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [gstFiles, setGstFiles] = useState([]);
  const [gstReg, setGstReg] = useState(user.gst?.detail?.reg);
  const [amount, setAmount] = useState(user.gst?.amount);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileLinks = (await UploadFiles({ files: gstFiles, setMsg })) || [];
    updateProfileInfo({
      "gst.detail.files": fileLinks,
      "gst.detail.reg": gstReg,
      "gst.amount": amount,
    })
      .then(({ user: newUser }) => {
        setLoading(false);
        if (newUser) {
          setUser((prev) => ({ ...prev, gst: newUser.gst }));
          setOpen(false);
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
              <h4>Could not upadte GST Information. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  return (
    <form onSubmit={submit}>
      <section>
        <label>GST Registration Number</label>
        <input
          required={true}
          type="text"
          defaultValue={user.gst?.detail.reg}
          name="gst.detail.reg"
          onChange={(e) => setGstReg(e.target.value)}
        />
      </section>
      <section>
        <label>GST percentage (%)</label>
        <NumberInput
          required={true}
          defaultValue={user.gst?.amount}
          name="gst.detail.reg"
          onChange={(e) => setAmount(e.target.value)}
        />
      </section>
      <section>
        <label>Upload files for verification</label>
        <FileInput
          multiple={true}
          prefill={user.gst?.detail?.files}
          name="gst.detail.files"
          onChange={(files) => setGstFiles(files)}
        />
      </section>
      <section className="btns">
        <button>Save Changes</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </section>
    </form>
  );
};
const ShippingEditForm = ({ setOpen, setMsg }) => {
  const { user, setUser } = useContext(SiteContext);
  const [shippingCost, setShippingCost] = useState(
    user.shopInfo?.shippingCost || 0
  );
  const [deliveryWithin, setDeliveryWithin] = useState(
    user.shopInfo?.deliveryWithin
  );
  const [refundable, setRefundable] = useState(
    user.shopInfo?.refundable || null
  );
  const submit = (e) => {
    e.preventDefault();
    updateProfileInfo({
      "shopInfo.shippingCost": shippingCost,
      "shopInfo.deliveryWithin": deliveryWithin,
      "shopInfo.refundable": refundable,
    })
      .then(({ user: newUser }) => {
        if (newUser) {
          setUser((prev) => ({ ...prev, shopInfo: newUser.shopInfo }));
          setOpen(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not upadte Terms. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  return (
    <form onSubmit={submit}>
      <section>
        <label>Shipping Cost ₹</label>
        <NumberInput
          required={true}
          defaultValue={shippingCost}
          name="shippingCost"
          onChange={(e) => setShippingCost(e.target.value)}
        />
      </section>
      <section>
        <label>Delivery Within (days)</label>
        <NumberInput
          required={true}
          defaultValue={deliveryWithin}
          name="deliveryWithin"
          min={1}
          step="0"
          placeholder="ie. 4 Days"
          onChange={(e) => setDeliveryWithin(e.target.value)}
        />
      </section>
      <section>
        <label>Refundable</label>
        <Combobox
          required={true}
          defaultValue={0}
          onChange={(e) => setRefundable(e.value)}
          options={[
            { label: "No", value: null },
            {
              label: "Upto 24 Hours After Delivery",
              value: "Upto 24 Hours After Delivery",
            },
            {
              label: "Upto 7 Days After Delivery",
              value: "Upto 7 Days After Delivery",
            },
            {
              label: "Upto 15 Days After Delivery",
              value: "Upto 15 Days After Delivery",
            },
          ]}
        />
      </section>
      <section className="btns">
        <button>Save Changes</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </section>
    </form>
  );
};
const TermsEditForm = ({ setOpen, termsEdit, setMsg }) => {
  const { user, setUser } = useContext(SiteContext);
  const [terms, setTerms] = useState(user.shopInfo?.terms || []);
  const [addTerm, setAddTerm] = useState("");
  const submit = (e) => {
    e.preventDefault();
    updateProfileInfo({
      "shopInfo.terms": terms,
    })
      .then(({ user: newUser }) => {
        if (newUser) {
          setUser((prev) => ({ ...prev, shopInfo: newUser.shopInfo }));
          setOpen(false);
          setTerms(newUser.shopInfo?.terms);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not upadte Terms. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    if (termsEdit) {
      if (terms.length === 0) {
        setTerms(defaultTerms);
      }
    } else {
      setTerms(user.shopInfo?.terms || []);
    }
  }, [termsEdit]);
  return (
    <form onSubmit={submit}>
      <ul>
        {terms.map((item, i) => (
          <li key={i}>
            {item}{" "}
            {termsEdit && (
              <button
                type="button"
                onClick={() =>
                  setTerms((prev) => prev.filter((term) => term !== item))
                }
              >
                <X_svg />
              </button>
            )}
          </li>
        ))}
        {terms.length === 0 && <li>No terms has been added.</li>}
      </ul>
      {termsEdit && (
        <>
          <section className="addTerm">
            <TextareaAutosize
              value={addTerm}
              placeholder="Add auditional term"
              onChange={(e) => setAddTerm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                setTerms((prev) =>
                  addTerm
                    ? [...prev.filter((term) => term !== addTerm), addTerm]
                    : prev
                );
                setAddTerm("");
              }}
            >
              Add Term
            </button>
          </section>
          <section className="btns">
            <button>Save Changes</button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTerms(
                  user.shopInfo?.terms?.length
                    ? user.shopInfo.terms
                    : defaultTerms
                );
              }}
            >
              Cancel
            </button>
          </section>
        </>
      )}
    </form>
  );
};
const PaymentMethodForm = ({ prefill, onSuccess, setMsg, setOpen }) => {
  const { setUser } = useContext(SiteContext);
  const [method, setMethod] = useState(
    prefill?.bank ? "bankAccount" : prefill || ""
  );
  const [bank, setBank] = useState(prefill?.bank || "");
  const [name, setName] = useState(prefill?.name || "");
  const [ifsc, setIfsc] = useState(prefill?.ifsc || "");
  const [city, setCity] = useState(prefill?.city || "");
  const [type, setType] = useState(prefill?.accountType || "");
  const [accountNumber, setAccountNumber] = useState(
    prefill?.accountNumber || ""
  );
  const submit = (e) => {
    e.preventDefault();
    updateProfileInfo({
      "shopInfo.paymentMethod":
        method === "bankAccount"
          ? {
              name,
              bank,
              city,
              accountType: type,
              ifsc,
              accountNumber,
            }
          : method,
    })
      .then(({ user: newUser }) => {
        if (newUser) {
          setUser((prev) => ({
            ...prev,
            shopInfo: newUser.shopInfo,
          }));
          setOpen(false);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not update payment method. Please try again.</h4>
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
                Could not updated payment method. Make sure you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  return (
    <form className="paymentMethodForm netBanking" onSubmit={submit}>
      <section>
        <label></label>
        <Combobox
          defaultValue={method}
          options={[
            { label: "Check", value: "check" },
            { label: "Demand Draft", value: "demandDraft" },
            {
              label: "Directly in your bank account",
              value: "bankAccount",
            },
          ]}
          onChange={(op) => setMethod(op.value)}
        />
      </section>
      {method === "bankAccount" && (
        <section className="inputs">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={true}
          />
          <input
            type="text"
            name="bank"
            placeholder="Bank"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            required={true}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required={true}
          />
          <input
            type="text"
            name="type"
            placeholder="Account type ie. Savings / Current"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required={true}
          />
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required={true}
          />
          <input
            type="text"
            name="ifsc"
            placeholder="IFSC"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value)}
            required={true}
          />
        </section>
      )}
      <section className="btns">
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </section>
    </form>
  );
};

export default MyShop;
