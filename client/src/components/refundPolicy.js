import { Header, Footer } from "./Elements";
require("./styles/generic.scss");

const RefundPolicy = () => {
  return (
    <div className="generic refundPolicy">
      <Header />
      <div className="content">
        <h1>Refund & Cancellation Policy</h1>
        <section>
          <h3>title</h3>
          <p>paragraph</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
