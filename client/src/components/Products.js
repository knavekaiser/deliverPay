import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../SiteContext";
import {
  Err_svg,
  Plus_svg,
  X_svg,
  Succ_svg,
  FileInput,
  UploadFiles,
} from "./Elements";
import { Modal, Confirm } from "./Modal";
import Moment from "react-moment";

const Products = ({ history, location, match }) => {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [productForm, setProductForm] = useState(false);
  useEffect(() => {
    fetch("/api/products?perPage=100")
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setProducts(data.products);
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
  }, []);
  return (
    <div className="productContainer">
      <div className="benner">
        <p>Product Management</p>
        <button onClick={() => setProductForm(true)}>
          <Plus_svg /> Add Product
        </button>
      </div>
      <ul className="products">
        {products.map((product) => (
          <SingleProduct
            key={product._id}
            product={product}
            setProducts={setProducts}
          />
        ))}
        {products.length === 0 && (
          <p className="placeholder">No product yet.</p>
        )}
      </ul>
      <Modal open={productForm} className="productForm">
        <div className="head">
          <p className="modalName">Add Product/Service</p>
          <button
            onClick={() => {
              setProductForm(null);
            }}
          >
            <X_svg />
          </button>
        </div>
        <ProductForm
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
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const SingleProduct = ({ product, setProducts }) => {
  const { user } = useContext(SiteContext);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState(false);
  const removeProduct = () => {
    fetch("/api/removeProduct", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: product._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setProducts((prev) =>
            prev.filter((item) => item._id !== product._id)
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Product could not be removed. Please try again.</h4>
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
              <h4>Product could not be removed. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  return (
    <li className={`product`}>
      <img src={product.images[0]} />
      <div className="detail">
        <p className="name">{product.name}</p>
        <p className="dscr">{product.dscr}</p>
        <p className="price">₹ {product.price}</p>
      </div>
      <div className="btns">
        <button className="edit" onClick={() => setEdit(true)}>
          Edit
        </button>
        <button
          className="delete"
          onClick={() =>
            Confirm({
              label: "Removing Product",
              question: "You sure want to delete this product?",
              callback: removeProduct,
            })
          }
        >
          Delete
        </button>
      </div>
      <Modal open={edit} className="productForm">
        <div className="head">
          <p className="modalName">Edit Product/Service</p>
          <button
            onClick={() => {
              setEdit(false);
            }}
          >
            <X_svg />
          </button>
        </div>
        <ProductForm
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
    </li>
  );
};
const ProductForm = ({ prefill, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(prefill?.name || "");
  const [dscr, setDscr] = useState(prefill?.dscr || "");
  const [price, setPrice] = useState(prefill?.price || "");
  const [files, setFiles] = useState(prefill?.images || []);
  const [msg, setMsg] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
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
        name,
        dscr,
        price,
        images,
        ...(prefill && { _id: prefill._id }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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
        <section>
          <label>Name of the product/service</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={true}
          />
        </section>
        <section>
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={true}
          />
        </section>
        <section className="dscr">
          <label>Description of the product/service</label>
          <textarea
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
            onChange={(e) => setFiles(e)}
          />
        </section>
        <button type="submit">Submit</button>
        <div className="pBtm" />
      </form>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

export default Products;
