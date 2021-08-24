import {
  useEffect,
  useState,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import { SiteContext } from "../SiteContext";
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
  Paginaiton,
  calculateDiscount,
  calculatePrice,
  Tip,
  Media,
  LS,
} from "./Elements";
import { Modal, Confirm } from "./Modal";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import { DateRange } from "react-date-range";
import Moment from "react-moment";
import TextareaAutosize from "react-textarea-autosize";
import OrderManagement, { FullOrder } from "./OrderManagement";
import RefundManagement, { FullRefund } from "./RefundManagement";
import FBMarket from "./fbMarketplace";
import { updateProfileInfo } from "./Profile";
import moment from "moment";
import { Step } from "./fbMarketplace";
import XLSX from "xlsx";
import { CSVLink } from "react-csv";
require("./styles/products.scss");

const parseXLSXtoJSON = (file, cb) => {
  var name = file.name;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
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
      user.shopInfo?.deliveryWithin === undefined ||
      user.shopInfo?.deliveryWithin === null ||
      user.shopInfo?.refundable === undefined ||
      Object.values(user.shopInfo?.paymentMethod || {}).length < 6
    ) {
      setShopSetupComplete(false);
    } else {
      setShopSetupComplete(true);
    }
  }, [categories, user]);
  return (
    <>
      {userType === "buyer" && <Redirect to="/account/myShopping/orders" />}
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
            { label: "FB Marketplace", path: "fbMarketplace" },
            { label: "Settings", path: "settings" },
          ]}
        />
        <Switch>
          <Route path="/account/myShop/products">
            <Products
              categories={categories}
              shopSetupComplete={shopSetupComplete}
            />
          </Route>
          <Route path="/account/myShop/orders/:_id" component={FullOrder} />
          <Route path="/account/myShop/orders">
            <OrderManagement categories={categories} />
          </Route>
          <Route path="/account/myShop/refunds/:_id" component={FullRefund} />
          <Route path="/account/myShop/refunds" component={RefundManagement} />
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
const ProductForm = ({ prefill, onSuccess, categories }) => {
  const { user } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(prefill?.type || "product");
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
    prefill?.gst || user.gst?.verified ? user.gst.amount : 0
  );
  const [hsn, setHsn] = useState(prefill?.hsn || "");
  const [available, setAvailable] = useState(prefill?.available);
  const [msg, setMsg] = useState(null);
  const [tags, setTags] = useState(prefill?.tags || []);
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
          onSuccess?.(data.product);
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
            options={categories.map((item) => ({ label: item, value: item }))}
            onChange={(e) => setCategory(e.value)}
          />
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
            {+gst > 0 && (
              <p className="gst">
                <label>GST {gst}%</label>+{((+price / 100) * +gst).fix()}
              </p>
            )}
            {
              //   <p>
              //   <label>Delivery Pay fee 10%</label>+
              //   {((+price + (+price / 100) * +gst) * 0.1).fix(2)}
              // </p>
            }
            {discount.amount > 0 && discount.type === "flat" && (
              <p>
                <label>Discount flat</label>- ₹{(+discount.amount).fix()}
              </p>
            )}
            {discount.amount > 0 && discount.type === "percent" && (
              <p>
                <label>Discount {discount.amount}%</label>- ₹
                {((+price / 100) * discount.amount).fix()}
              </p>
            )}
            <p className="final">
              <label>Listing Price</label>₹
              {(
                +price +
                (+price / 100) * +gst -
                (discount.type === "percent"
                  ? (+price / 100) * discount.amount
                  : 0) -
                (discount.type === "flat" ? discount.amount : 0)
              ).fix()}
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
    </>
  );
};

const Products = ({ categories, shopSetupComplete }) => {
  const { user } = useContext(SiteContext);
  const { FB } = window;
  const dateFilterRef = useRef();
  const [productForm, setProductForm] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [dateOpen, setDateOpen] = useState("");
  const [sort, setSort] = useState({
    column: "createdAt",
    order: "dsc",
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [type, setType] = useState("");
  const [dateFilter, setDateFilter] = useState(false);
  const [datePickerStyle, setDatePickerStyle] = useState({});
  const [products, setProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batch, setBatch] = useState([]);
  const [addMany, setAddMany] = useState(false);
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
      body: JSON.stringify({
        _ids,
        access_token: LS.get("facebook_user_accessToken"),
      }),
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
      body: JSON.stringify({
        _ids,
        access_token: LS.get("facebook_user_accessToken"),
      }),
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
  useEffect(() => {
    const startDate = moment(dateRange.startDate).format("YYYY-MM-DD");
    const endDate = moment(dateRange.endDate).format("YYYY-MM-DD");
    const lastDate = moment(
      new Date(dateRange.endDate).setDate(dateRange.endDate.getDate() + 1)
    ).format("YYYY-MM-DD");
    fetch(
      `/api/products?${new URLSearchParams({
        ...(search && { q: search }),
        page,
        perPage,
        sort: sort.column,
        order: sort.order,
        ...(dateFilter && {
          dateFrom: startDate,
          dateTo: lastDate,
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
  }, [category, search, page, perPage, dateFilter, type, addMany]);
  useLayoutEffect(() => {
    if (dateFilterRef.current) {
      const {
        height,
        y,
        width,
        x,
      } = dateFilterRef.current.getBoundingClientRect();
      setDatePickerStyle({
        position: "fixed",
        top: height + y + 4,
        right: window.innerWidth - x - width,
      });
    }
  }, []);
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
            <button onClick={() => setProductForm(true)}>
              <Plus_svg /> Add Product
            </button>
            <button className="batchUpload" onClick={() => setAddMany(true)}>
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
        <section
          className={`date ${dateFilter ? "open" : ""}`}
          ref={dateFilterRef}
          onClick={() => setDateOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30.971"
            height="30.971"
            viewBox="0 0 30.971 30.971"
          >
            <path
              id="Path_299"
              data-name="Path 299"
              d="M3.992,2.42H6.775V.968a.968.968,0,1,1,1.936,0V2.42H22.26V.968a.968.968,0,1,1,1.936,0V2.42h2.783a4,4,0,0,1,3.992,3.992V26.978a4,4,0,0,1-3.992,3.992H3.992A4,4,0,0,1,0,26.978V6.412A4,4,0,0,1,3.992,2.42ZM26.978,4.355H24.2v.968a.968.968,0,1,1-1.936,0V4.355H8.71v.968a.968.968,0,1,1-1.936,0V4.355H3.992A2.059,2.059,0,0,0,1.936,6.412v2.3h27.1v-2.3A2.059,2.059,0,0,0,26.978,4.355ZM3.992,29.035H26.978a2.059,2.059,0,0,0,2.057-2.057V10.646H1.936V26.978A2.059,2.059,0,0,0,3.992,29.035Z"
              fill="#336cf9"
            />
          </svg>
          {dateFilter && (
            <>
              <div className="dates">
                <p>
                  From:{" "}
                  <Moment format="DD MMM, YYYY">{dateRange.startDate}</Moment>
                </p>
                <p>
                  To: <Moment format="DD MMM, YYYY">{dateRange.endDate}</Moment>
                </p>
              </div>
              <button
                className="clearDateFilter"
                onClick={() => {
                  setDateRange({
                    startDate: new Date(),
                    endDate: new Date(),
                  });
                  setDateFilter(false);
                }}
              >
                <X_svg />
              </button>
            </>
          )}
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
              {user.fbMarket?.userAgreement &&
                LS.get("facebook_user_accessToken") && (
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
      <Paginaiton
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
          onSuccess={(product) => {
            setProducts((prev) => [...prev, product]);
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
        open={dateOpen}
        onBackdropClick={() => setDateOpen(false)}
        className="datePicker"
        backdropClass="datePicker"
        style={datePickerStyle}
      >
        <DateRange
          className="dateRange"
          ranges={[dateRange]}
          onChange={(e) => {
            setDateRange(e.range1);
            if (e.range1.endDate !== e.range1.startDate) {
              setDateOpen(false);
              setDateFilter(true);
            }
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
  const [edit, setEdit] = useState(false);
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
      {
        // <td>{product.popularity || 0}</td>
      }
      <td>
        {batch.length === 0 && (
          <Actions icon={<Chev_down_svg />}>
            <Link to={`/marketplace/${product._id}`} target="_blank">
              View
            </Link>
            {user.fbMarket?.userAgreement &&
              LS.get("facebook_user_accessToken") && (
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
            {!user.fbMarket?.userAgreement && (
              <Link to="/account/myShop/fbMarketplace" className="edit">
                Setup FB Marketplace
              </Link>
            )}
            <Link to="#" className="edit" onClick={() => setEdit(true)}>
              Edit
            </Link>
            <Link
              to="#"
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
            </Link>
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
          onSuccess={(product) => {
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
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </tr>
  );
};

const BatchUpload = ({ onSuccess, categories }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [batchItems, setBatchItems] = useState(null);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState(null);
  const [category, setCategory] = useState("");
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
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          console.log(data);
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
          console.log(headers, data.products);
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

const defaultTerms = [
  "Buyer will be responsible for paying for shipping costs & for returning the item.",
  "Shipping costs are nonrefundable.",
  "Orders must be returned with Original Packaging & Securely.",
  "Orders must be Returned Via Trackable / Traceable Courier Services Only.",
  "Proof of Return via Photo of Tracking Number & Dispatch Ticket is Required.",
  "Refund is Only Issued Upon Delivery of Return Package.",
];
const Settings = ({ categories, setCategories }) => {
  const { user, setUser } = useContext(SiteContext);
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
          user.shopInfo?.deliveryWithin === undefined ||
          user.shopInfo?.deliveryWithin === null ||
          user.shopInfo?.refundable === undefined) && (
          <p className="err">Add Shipping & Delivery detail</p>
        )}
        {Object.values(user.shopInfo?.paymentMethod || {}).length < 6 && (
          <p className="err">Add valid payment method</p>
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
            <p>Name: {user.shopInfo?.paymentMethod?.name || "--"}</p>
            <p>Bank: {user.shopInfo?.paymentMethod?.bank || "--"}</p>
            <p>City: {user.shopInfo?.paymentMethod?.city || "--"}</p>
            <p>
              Account type: {user.shopInfo?.paymentMethod?.accountType || "--"}
            </p>
            <p>
              Account Number:{" "}
              {user.shopInfo?.paymentMethod?.accountNumber || "--"}
            </p>
            <p>ifsc: {user.shopInfo?.paymentMethod?.ifsc || "--"}</p>
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
        <label>GST Registration Nubmer</label>
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
      "shopInfo.paymentMethod": {
        name,
        bank,
        city,
        accountType: type,
        ifsc,
        accountNumber,
      },
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
