import { Header, Footer } from "./Elements";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <div className="generic shippingPolicy">
      <Header />
      <div className="content">
        <h1>Shipping & Delivery Policy</h1>
        <section>
          <p>
            Thank you for visiting and shopping at DeliveryPay.in. Following are
            the terms and conditions that constitute our Shipping Policy.
          </p>
          <p>This Policy may be changed or Updated from time to time .</p>
        </section>
        <section>
          <h2>Domestic Shipping Policy</h2>
          <h3>Shipping Vendors / Courier / Partners</h3>
          <p>
            Courier Companies & Partners are Decided by the Sellers or by the
            Buyers . DeliveryPay.in does not have part in this . Charges as
            discussed must be included in payments .
          </p>
        </section>
        <section>
          <h3>Shipment processing time</h3>
          <p>
            Based upon the agreement between buyer & seller , usually All orders
            are processed within 2-3 business days. Orders are not shipped or
            delivered on weekends or holidays.
          </p>
          <p>
            If sellers are experiencing a high volume of orders, shipments may
            be delayed by a few days. Please allow additional days in transit
            for delivery. If there will be a significant delay in shipment of
            your order, we will contact you via email or telephone.
          </p>
          <p>
            Please discuss clearly with your seller how many days they require
            to ship .
          </p>
        </section>
        <section>
          <h3>Shipment to P.O. boxes or APO/FPO addresses</h3>
          <p>
            DeliveryPay.in ships to addresses within India Only . If you provide
            an address where delivery is not possible Orders will be returned .
          </p>
          <p>
            Incase of undeliverable Addresses , we reserve the right to charge
            you for the full cost of delivery & return & may award the payment
            to the seller .
          </p>
        </section>
        <section>
          <h3>Shipment confirmation & Order tracking</h3>
          <p>
            You will receive a Shipment Confirmation email once your order has
            shipped containing your tracking number(s). The tracking number will
            be active within 24 hours.
          </p>
        </section>
        <section>
          <h3>Customs, Duties and Taxes</h3>
          <p>
            DeliveryPay.in is not responsible for any customs and taxes applied
            to your order. All fees imposed during or after shipping are the
            responsibility of the customer (tariffs, taxes, etc.).
          </p>
        </section>
        <section>
          <h3>Damages</h3>
          <p>
            DeliveryPay.in is not liable for any products damaged or lost during
            shipping. If you received your order damaged, please contact the
            shipment carrier to file a claim.
          </p>
          <p>
            Please save all packaging materials and damaged goods before filing
            a claim.
          </p>
        </section>
        <section>
          <h3>International Shipping Policy</h3>
          <p>
            We currently do not ship outside India. Unless Agreed Upon by Buyer
            & seller
          </p>
        </section>
        <section>
          <h3>Returns Policy</h3>
          <p>
            Our{" "}
            <Link to="/refundCancellationPolicy">Return & Refund Policy</Link>{" "}
            provides detailed information about options and procedures for
            returning your order.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
