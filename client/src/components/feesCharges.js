import { Header, Footer } from "./Elements";
require("./styles/generic.scss");

const FeesCharges = () => {
  return (
    <div className="generic feesCharges">
      <Header />
      <div className="content">
        <h1>DeliveryPay Fees and Charges</h1>
        <h2>For Buyers</h2>
        <section>
          <p>
            <strong>Delivery Pay Services</strong> : DeliveryPay is free to sign
            up,Send Order Confirmations, receive bids from DeliveryPay Sellers,
            review the DeliveryPay's portfolio and discuss the project
            requirements. If you choose to award the project, and the
            DeliveryPay accepts, we charge you a small project fee relative to
            the value of the selected bid, as an introduction fee.
          </p>
          <p>
            The cost and how this fee is charged depends on the type of project.
          </p>
          <p>
            For fixed price projects, a fee of 5% or ₹150.00 INR (whichever is
            greater) is levied at the time a project that has been awarded by
            you has been accepted by each DeliveryPay you award. If you
            subsequently pay the DeliveryPay more than the original bid amount
            we will also charge the project fee on any overage payments.
          </p>
          <p>
            For hourly projects, a fee of 5% is levied on each payment that you
            make to the DeliveryPay.
          </p>
          <p>
            You may cancel the project from your dashboard at any time for up to
            seven (7) days after the project has been accepted for a full refund
            of your fee.
          </p>
          <p>
            The Money Back Guarantee entitles you to get your money back for up
            to 3 days from delivery of Product / service if you are not happy
            with the submitted entries. You can get refunded simply by
            contacting support.
          </p>
          <p>
            Note that refunds are not available on 'non refundable”', and this
            refund does not include any upgrades that you may have selected.
          </p>
          <p>
            There is no fee for Requesting a Bid or Awarding a Bid for
            employers.
          </p>
          <p>
            Each additional awarded entry will also require payment of the prize
            for that entry.
          </p>
        </section>
        <section>
          <h3>Services</h3>
          <p>
            At the time of ordering a service, employers must provide funds
            equivalent to the total service price. The payment is protected by
            the DeliveryPay IntervalPayment System. Only release the payment
            once you are 100% happy with the work that has been delivered.
          </p>
        </section>
        <h2>For DeliveryPay Sellers</h2>
        <section>
          <p>
            DeliveryPay is free to sign up, create a profile, select skills of
            projects you are interested in, upload a portfolio, receive project
            notifications, discuss project details with the employer & request
            for payments.
          </p>
        </section>
        <section>
          <h3>Products</h3>
          <p>
            For fixed priceProducts, if you are awarded an Order for a Product,
            and you accept, we charge you a small project fee relative to the
            value of the selected bid, as an introduction fee. If you are
            subsequently paid more than the original bid amount, we will also
            charge the project fee on any overage payments.
          </p>
          <p>
            For hourly Services projects, the fee is levied on each payment as
            it is made by the employer to you.
          </p>
          <p>
            The fee for fixed price projects is 10% or ₹250.00 INR, whichever is
            greater, and 10% for hourly projects.
          </p>
        </section>
        <section>
          <h3>Services</h3>
          <p>
            If you are subsequently hired to perform that Service, a 5% fee of
            the total service price is charged. This is charged when the service
            is ordered by way of a deduction from the payment you receive.
          </p>
        </section>
        <section>
          <h3>Preferred DeliveryPay Program</h3>
          <p>
            If you are in the Preferred DeliveryPay Program, you will be charged
            15% project fee when you are awarded and accept a Recruiter project.
            This will not be charged upfront, like on regular projects, but
            rather when you receive the payment.
          </p>
        </section>
        <section>
          <h3>Refunds as Bonus Credit</h3>
          <p>
            In some instances, refund of fees may be done as bonus credit. This
            bonus may only be used on site, and can not be withdrawn or
            transferred. The bonus will expire in 90 days from the date of
            receipt.
          </p>
        </section>
        <h3>Incase of Disputes :</h3>
        <section>
          <h3>Arbitration Fees</h3>
          <p>
            The arbitration fee for a Intervaldispute is ₹500.00 INR or 5%,
            whichever is greater
          </p>
          <p>
            Our dispute resolution system is designed to allow both parties to
            resolve issues regarding Interval Payments amongst themselves
            without arbitration.
          </p>
          <p>
            After 4 days of a dispute being filed (or 7 days if the dispute is
            filed by the DeliveryPay) either party may elect to move the dispute
            to paid arbitration. The other party will then have a further 4 days
            to agree to pay this fee and for both parties to submit any final
            evidence. If the other party fails to pay within time, they will
            lose the dispute.
          </p>
          <p>
            The arbitration fee will then be refunded to the winner of the
            dispute.
          </p>
        </section>
        <section>
          <h3>Withdrawal Fees</h3>
          <p>
            Fees may be optionally levied depending on the method of withdrawal.
            Additional fees may be levied by the third party offering the
            withdrawal method.
          </p>
          <table cellSpacing={0} cellPadding={0}>
            <tbody>
              <tr>
                <td>Express Withdrawal</td>
                <td>Free</td>
              </tr>
              <tr>
                <td>PayPal</td>
                <td>FREE</td>
              </tr>
              <tr>
                <td>Skrill (Moneybookers)</td>
                <td>FREE</td>
              </tr>
              <tr>
                <td>Payoneer Debit Card</td>
                <td>FREE</td>
              </tr>
              <tr>
                <td>International Wire</td>
                <td>₹1250.00 INR</td>
              </tr>
            </tbody>
          </table>
          <p>We impose a minimum withdrawal, after fees, of USD $30.</p>
        </section>
        <section>
          <h3>Maintenance Fees</h3>
          <p>
            User Accounts that have not logged in for six months will incur a
            maintenance fee of up to $10.00 USD per month until either the
            account is terminated or reactivated for storage, bandwidth, support
            and management costs of providing hosting of the user's profile,
            portfolio storage, listing in directories, provision of the HireMe
            service, file storage and message storage. These fees will be
            refunded upon request by users on subsequent reactivation.
          </p>
          <h3>Taxes</h3>
          <p>
            Taxes are applied based on local rates and rules defined by the
            user's country of residence / registered country.
          </p>
          <table cellSpacing={0} cellPadding={0}>
            <tbody>
              <tr>
                <td>India - Tax Collected at Source (TCS)</td>
                <td>1%</td>
              </tr>
              <tr>
                <td>India - Tax Deducted at Source (TDS)</td>
                <td>1% / 5%</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <h3>India Equalisation Levy Reimbursement</h3>
          <p>
            The treaty relieves DeliveryPays of withholding obligations, for the
            avoidance of doubt, the Equalisation Levy. You are not being charged
            or paying for this levy, it is a reimbursement.
          </p>
          <table cellSpacing={0} cellPadding={0}>
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>DeliveryPay</th>
                <th>WHO PAYS LEVY</th>
                <th>LEVY DETAILS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Indian Resident</td>
                <td>Indian Resident</td>
                <td>Delivery Pay</td>
                <td>2% charged to DeliveryPay on gross earnings</td>
              </tr>
              <tr>
                <td>Indian Resident</td>
                <td>Other</td>
                <td>Client</td>
                <td>2% charged to Client on gross Intervalpayments</td>
              </tr>
              <tr>
                <td>Other</td>
                <td>Indian Resident</td>
                <td>Delivery Pay</td>
                <td>2% charged to DeliveryPay on gross earnings</td>
              </tr>
              <tr>
                <td>Other</td>
                <td>Other</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            </tbody>
          </table>
          <p>
            * DeliveryPay and its affiliates do not provide tax, legal or
            accounting advice. This material has been prepared for informational
            purposes only, and is not intended to provide, and should not be
            relied on for, tax, legal or accounting advice. You should consult
            your own tax, legal and accounting advisors.
          </p>
        </section>
        <section>
          <h3>User Agreement</h3>
          <p>
            The fees and charges summarised on this page are governed by the
            terms of the DeliveryPay User Agreement and related site policies.
            The User Agreement includes other important terms and should be read
            in full. In particular section 23 of the User Agreement specifies
            the consequences of termination for violations of the User
            Agreement. Those consequences can include fines for damages that
            DeliveryPay will sustain as a result of actions that breach the User
            Agreement.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default FeesCharges;
