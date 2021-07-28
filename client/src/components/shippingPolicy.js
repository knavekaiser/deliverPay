import { Header, Footer } from "./Elements";
require("./styles/generic.scss");

const ShippingPolicy = () => {
  return (
    <div className="generic shippingPolicy">
      <Header />
      <div className="content">
        <h1>Shipping & Delivery Policy</h1>
        <section>
          <h3>title</h3>
          <p>paragraph</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
