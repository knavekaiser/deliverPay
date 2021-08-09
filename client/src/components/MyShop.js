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
} from "./Elements";
import { Modal, Confirm } from "./Modal";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import { DateRange } from "react-date-range";
import Moment from "react-moment";
import TextareaAutosize from "react-textarea-autosize";
import OrderManagement, { FullOrder } from "./OrderManagement";
import RefundManagement, { FullRefund } from "./RefundManagement";
import moment from "moment";
import XLSX from "xlsx";
require("./styles/products.scss");

const parseXLSXtoJSON = (file) => {
  var name = file.name;
  const reader = new FileReader();
  let items = [];
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
        item[col] = row[j];
      });
      arr.push(item);
    });
    items = arr;
  };
  reader.readAsBinaryString(file);
  return items;
};

const MyShop = ({ history, location, match }) => {
  const { userType } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
      });
  }, []);
  return (
    <>
      {userType === "buyer" && <Redirect to="/account/myShopping/orders" />}
      <div className="productContainer">
        <div style={{ display: "none" }}>
          <X_svg />
        </div>
        <Tabs
          basepath="/account/myShop/"
          tabs={[
            { label: "Products & Services", path: "products" },
            { label: "Orders", path: "orders" },
            { label: "Refunds", path: "refunds" },
            { label: "Settings", path: "settings" },
          ]}
        />
        <Switch>
          <Route path="/account/myShop/products">
            <Products categories={categories} />
          </Route>
          <Route path="/account/myShop/orders/:_id" component={FullOrder} />
          <Route path="/account/myShop/orders">
            <OrderManagement categories={categories} />
          </Route>
          <Route path="/account/myShop/refunds/:_id" component={FullRefund} />
          <Route path="/account/myShop/refunds" component={RefundManagement} />
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
    type: prefill?.discount?.type || "none",
    amount: prefill?.discount?.amount || 0,
    dscr: prefill?.discount?.dscr || "",
  });
  const [name, setName] = useState(prefill?.name || "");
  const [dscr, setDscr] = useState(prefill?.dscr || "");
  const [price, setPrice] = useState(prefill?.price || "");
  const [files, setFiles] = useState(prefill?.images || []);
  const [gst, setGst] = useState(prefill?.gst || user.gst?.verified ? 18 : 0);
  const [available, setAvailable] = useState(prefill?.available);
  const [msg, setMsg] = useState(null);
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
        <section className="images">
          <label>Images of the product</label>
          <FileInput
            multiple={true}
            prefill={prefill?.images}
            accept="image/*"
            onChange={(files) => setFiles(files)}
          />
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
              { label: "None", value: "none" },
              { label: "Percent", value: "percent" },
              { label: "Flat", value: "flat" },
            ]}
            onChange={(e) =>
              setDiscount((prev) => ({ ...prev, type: e.value }))
            }
          />
        </section>
        {discount.type !== "none" && (
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
                <label>GST {gst}%</label>+{+((+price / 100) * +gst).toFixed(2)}
              </p>
            )}
            <p>
              <label>Delivery Pay fee 10%</label>+
              {+((+price + (+price / 100) * +gst) * 0.1).toFixed(2)}
            </p>
            {discount.amount > 0 && discount.type === "flat" && (
              <p>
                <label>Discount flat</label>- ₹{+(+discount.amount).toFixed(2)}
              </p>
            )}
            {discount.amount > 0 && discount.type === "percent" && (
              <p>
                <label>Discount {discount.amount}%</label>- ₹
                {+((+price / 100) * discount.amount).toFixed(2)}
              </p>
            )}
            <p className="final">
              <label>Listing Price</label>₹
              {
                +(
                  +price +
                  (+price / 100) * +gst -
                  (discount.type === "percent"
                    ? (+price / 100) * discount.amount
                    : 0) -
                  (discount.type === "flat" ? discount.amount : 0) * 1.1
                ).toFixed(2)
              }
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

const Products = ({ categories }) => {
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
  }, [category, search, page, perPage, dateFilter, type]);
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
        <button onClick={() => setProductForm(true)}>
          <Plus_svg /> Add Product
        </button>
        {
          //   <button>
          //   <input
          //     type="file"
          //     accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          //     onChange={(e) => {
          //       const items = parseXLSXtoJSON(e.target.files[0]);
          //       console.log(items);
          //     }}
          //   />
          //   <Plus_svg /> Add Batch Products
          // </button>
        }
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
              <th>Available</th>
              <th>Price</th>
              <th>GST</th>
              <th>Discount</th>
              <th>Listing Price</th>
              <th>Sold</th>
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
}) => {
  const { user } = useContext(SiteContext);
  const [selected, setSelected] = useState(selectAll || false);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState(false);
  // const removeProduct = () => {
  //   fetch("/api/removeProduct", {
  //     method: "DELETE",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ _id: product._id }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.code === "ok") {
  //         setProducts((prev) =>
  //           prev.filter((item) => item._id !== product._id)
  //         );
  //       } else {
  //         setMsg(
  //           <>
  //             <button onClick={() => setMsg(null)}>Okay</button>
  //             <div>
  //               <Err_svg />
  //               <h4>Product could not be removed. Please try again.</h4>
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
  //             <h4>Product could not be removed. Make sure you're online</h4>
  //           </div>
  //         </>
  //       );
  //     });
  // };
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
      <td>
        <img src={product.images[0]} />
      </td>
      <td className="name">{product.name}</td>
      <td>{product.type}</td>
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
      <td>{product.popularity || 0}</td>
      <td>
        {batch.length === 0 && (
          <Actions icon={<Chev_down_svg />}>
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

const Settings = ({ categories, setCategories }) => {
  const { user, setUser } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  return (
    <div className="settings">
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
          <input type="text" required={true} placeholder="New Category" />
          <button>Add category</button>
        </form>
      </div>
      <div className="gst">
        <h2 className="head">GST</h2>
        {user.gst?.verified ? (
          <>
            <p>
              Set baseline GST to all your product. this GST will be calculated
              when a customer places order unless there's GST defiened on the
              product.
            </p>
            <p>Current GST {user.gst?.amount || 0}%</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.querySelector("input");
                fetch("/api/editUserProfile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ "gst.amount": input.value }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log(data);
                    if (data.code === "ok") {
                      input.value = "";
                      setUser((prev) => ({ ...prev, gst: data.user.gst }));
                      setMsg(
                        <>
                          <button onClick={() => setMsg(null)}>Okay</button>
                          <div>
                            <Succ_svg />
                            <h4>GST has been updated.</h4>
                          </div>
                        </>
                      );
                    } else {
                      setMsg(
                        <>
                          <button onClick={() => setMsg(null)}>Okay</button>
                          <div>
                            <Err_svg />
                            <h4>GST could not be updated. Try again.</h4>
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
                            GST could not be updated. Make sure you're online.
                          </h4>
                        </div>
                      </>
                    );
                  });
              }}
            >
              <NumberInput required={true} />%<button>Update GST</button>
            </form>
          </>
        ) : (
          <p>
            You have not verified you GST status. Verify your GST{" "}
            <Link to="/account/profile">here</Link>.
          </p>
        )}
      </div>
      <div className="terms shipping">
        <h2 className="head">Shipping Terms</h2>
        <ul>
          <li>Buyer will bare the shipping cost.</li>
        </ul>
      </div>
      <div className="terms payment">
        <h2 className="head">Deposit & Payment Terms</h2>
        <p>
          Refundable [ I will accept Returns ] / Non Refundable [ I will not
          accept returns , My payment should be released as soon as my Order is
          Delivered ] as Options before Requesting for a Payment.
        </p>
      </div>
      <div className="terms return">
        <h2 className="head">Return Policy Terms</h2>
        <ul>
          <li>
            Buyer will be responsible for paying for shipping costs & for
            returning the item.
          </li>
          <li>Shipping costs are nonrefundable.</li>
          <li>Orders must be returned with Original Packaging & Securely.</li>
          <li>
            Orders must be Returned Via Trackable / Traceable Courier Services
            Only.
          </li>
          <li>
            Proof of Return via Photo of Tracking Number & Dispatch Ticket is
            Required.
          </li>
          <li>Refund is Only Issued Upon Delivery of Return Package.</li>
        </ul>
      </div>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

export default MyShop;
