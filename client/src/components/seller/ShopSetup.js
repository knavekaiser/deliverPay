import { useState, useRef, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { defaultTerms } from "./MyShop";
import { updateProfileInfo } from "../Profile";
import { Combobox, X_svg, FileInput, UploadFiles, Err_svg } from "../Elements";
import TextareaAutosize from "react-textarea-autosize";

const ShopSetup = () => {
  const { user, setUser } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState("");
  const [charge, setCharge] = useState("");
  const [shopName, setShopName] = useState("");
  const [logo, setLogo] = useState([]);
  const [phone, setPhone] = useState(user.phone);
  const [gst, setGst] = useState("");
  const [gstReg, setGstReg] = useState("");
  const [gstAmount, setGstAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [refund, setRefund] = useState("");
  const [refundable, setRefundable] = useState("");
  const [deliveryWithin, setDeliveryWithin] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [shipping, setShipping] = useState("");
  const [terms, setTerms] = useState(defaultTerms);
  const termInput = useRef();
  const [step, setStep] = useState(1);
  const submit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else {
      setLoading(true);
      const [logoLink] = (await UploadFiles({ files: logo, setMsg })) || [];
      if (logo.length && !logoLink) {
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
      console.log(logo, logoLink);
      updateProfileInfo({
        gst: gst
          ? {
              detail: {
                reg: gstReg,
              },
              amount: gstAmount,
            }
          : null,
        shopInfo: {
          name: shopName,
          ...(logoLink && { logo: logoLink }),
          phone,
          charge,
          paymentMethod:
            paymentMethod === "bankAccount"
              ? {
                  name,
                  bank,
                  city,
                  accountType: type,
                  accountNumber,
                  ifsc,
                }
              : paymentMethod,
          deliveryWithin,
          deliveryMethod,
          shippingCost: shippingCost || 0,
          refundable: refundable || null,
          terms,
        },
      }).then(({ user: newUser }) => {
        if (newUser) {
          setUser((prev) => ({
            ...prev,
            gst: newUser.gst,
            shopInfo: newUser.shopInfo,
          }));
        }
      });
    }
  };
  return (
    <form className="shopSetup" onSubmit={submit} autoComplete="off">
      <h1>Shop Setup</h1>
      <div style={{ display: "none" }}>
        <X_svg />
      </div>
      <div className="innerWrapper">
        {step === 1 && (
          <>
            <section>
              <h4>What do you sell</h4>
              <Combobox
                required={true}
                defaultValue={offerings}
                options={[
                  { label: "Product", value: "product" },
                  { label: "Service", value: "service" },
                  { label: "Both", value: "product,service" },
                ]}
                onChange={(option) => setOfferings(option.value)}
              />
            </section>
            {offerings === "product" && (
              <section className="charge">
                <h4>Charge</h4>
                <Combobox
                  required={true}
                  defaultValue={charge}
                  options={[
                    { label: "Charge per unit", value: "Charge per unit" },
                  ]}
                  onChange={(option) => setCharge(option.value)}
                />
              </section>
            )}
            {(offerings === "service" || offerings === "product,service") && (
              <section className="charge">
                <h4>Charge</h4>
                <Combobox
                  required={true}
                  defaultValue={charge}
                  options={[
                    { label: "Charge per hour", value: "Charge per hour" },
                    {
                      label: "I charge flat rates for my Services",
                      value: "I charge flat rates for my Services",
                    },
                  ]}
                  onChange={(option) => setCharge(option.value)}
                />
              </section>
            )}
            {charge && (
              <>
                <section className="shop">
                  <h4>What is your Brand/Shop name</h4>
                  <input
                    required={true}
                    name="shop"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </section>
                <section>
                  <h4>Do you have a Logo?</h4>
                  <FileInput
                    prefill={logo}
                    onChange={(files) => setLogo(files)}
                  />
                </section>
                <section>
                  <h4>Shop Phone number</h4>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </section>
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <section>
              <h4>Do you have GST Registration?</h4>
              <Combobox
                required={true}
                defaultValue={gst}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
                onChange={(op) => setGst(op.value)}
              />
            </section>
            {gst === true && (
              <>
                <section>
                  <h4>GST Registration number</h4>
                  <input
                    required={true}
                    value={gstReg}
                    onChange={(e) => setGstReg(e.target.value)}
                  />
                </section>
                <section>
                  <h4>GST amount (%)</h4>
                  <input
                    type="number"
                    required={true}
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                  />
                </section>
              </>
            )}
            <section className="method">
              <h4>Do you want to Receive Payments Via</h4>
              <Combobox
                required={true}
                defaultValue={paymentMethod}
                options={[
                  { label: "Check", value: "check" },
                  { label: "Demand Draft", value: "demandDraft" },
                  {
                    label: "Directly in your bank account",
                    value: "bankAccount",
                  },
                ]}
                onChange={(op) => setPaymentMethod(op.value)}
              />
            </section>
            {paymentMethod === "bankAccount" && (
              <>
                <section className="bankDetails">
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
              </>
            )}
            {!(paymentMethod === "bankAccount") && (
              <p className="note">
                Please note - Checks & Demand Drafts can take longer & a
                additional charges such as courier charges are applicable .
                Incase of Loss of Demand Draft - We will not be able to issue a
                new one without the Bank's Approval
              </p>
            )}
          </>
        )}
        {step === 3 && (
          <>
            {offerings === "service" ? (
              <>
                <section>
                  <h4>Can your customer ask for refunds?</h4>
                  <Combobox
                    required={true}
                    defaultValue={refund}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(op) => setRefund(op.value)}
                  />
                </section>
                {refund && (
                  <section>
                    <h4>
                      Upto how many days can the customer claim a refund in?
                    </h4>
                    <Combobox
                      required={true}
                      defaultValue={refundable}
                      onChange={(e) => setRefundable(e.value)}
                      options={[
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
                )}
              </>
            ) : (
              <>
                <section>
                  <h4>In how many days do you generally ship your products?</h4>
                  <input
                    required={true}
                    type="number"
                    value={deliveryWithin}
                    onChange={(e) => setDeliveryWithin(e.target.value)}
                  />
                </section>
                <section className="deliveryMethod">
                  <h4>
                    Do you currently have a courier company which handles your
                    orders?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={deliveryMethod}
                    options={[
                      { label: "Yes - I will use my own", value: "shop" },
                      {
                        label:
                          "No - I would like deliverypay to handle my couriers & returns",
                        value: "deliveryPay",
                      },
                    ]}
                    onChange={(op) => setDeliveryMethod(op.value)}
                  />
                </section>
                <section className="deliveryMethod">
                  <h4>
                    Are Courier Charges Included in cost of product or extra?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={shipping}
                    options={[
                      {
                        label:
                          "Yes. Shipping costs are included in the product.",
                        value: null,
                      },
                      { label: "No. Shipping costs are extra", value: true },
                    ]}
                    onChange={(op) => setShipping(op.value)}
                  />
                </section>
                {shipping && (
                  <section>
                    <h4>What is the shipping cost (₹)</h4>
                    <input
                      type="number"
                      value={shippingCost}
                      required={true}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </section>
                )}
                <section>
                  <h4>
                    If a Customer Claims They are not satisfied with your
                    product Do you provide Refunds?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={refund}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(op) => setRefund(op.value)}
                  />
                </section>
                {refund && (
                  <section>
                    <h4>
                      Upto how many days can the customer claim a refund in?
                    </h4>
                    <Combobox
                      required={true}
                      defaultValue={refundable}
                      onChange={(e) => setRefundable(e.value)}
                      options={[
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
                )}
              </>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <section className="terms">
              <h4>Terms to Show to my Buyers</h4>
              <ul>
                {terms.map((item, i) => (
                  <li key={i}>
                    <p>{item}</p>
                    <button
                      type="button"
                      className="clear"
                      onClick={() =>
                        setTerms((prev) => prev.filter((term) => term !== item))
                      }
                    >
                      <X_svg />
                    </button>
                  </li>
                ))}
                {terms.length === 0 && <li>No terms has been added.</li>}
              </ul>
              <div className="newTerm">
                <TextareaAutosize ref={termInput} />
                <button
                  type="button"
                  className="fill"
                  onClick={() => {
                    const newTerm = termInput.current.value;
                    setTerms((prev) =>
                      newTerm
                        ? [...prev.filter((term) => term !== newTerm), newTerm]
                        : prev
                    );
                    termInput.current.value = "";
                  }}
                >
                  Add Terms
                </button>
              </div>
            </section>
          </>
        )}
        {step === 5 && (
          <>
            <section>
              <h2>Review shop information</h2>
            </section>
            <section>
              <h4>What do you sell</h4>
              <Combobox
                required={true}
                defaultValue={offerings}
                options={[
                  { label: "Product", value: "product" },
                  { label: "Service", value: "service" },
                  { label: "Both", value: "product,service" },
                ]}
                onChange={(option) => setOfferings(option.value)}
              />
            </section>
            {offerings === "product" && (
              <section className="charge">
                <h4>Charge</h4>
                <Combobox
                  required={true}
                  defaultValue={charge}
                  options={[
                    { label: "Charge per unit", value: "Charge per unit" },
                  ]}
                  onChange={(option) => setCharge(option.value)}
                />
              </section>
            )}
            {(offerings === "service" || offerings === "product,service") && (
              <section className="charge">
                <h4>Charge</h4>
                <Combobox
                  required={true}
                  defaultValue={charge}
                  options={[
                    { label: "Charge per hour", value: "Charge per hour" },
                    {
                      label: "I charge flat rates for my Services",
                      value: "I charge flat rates for my Services",
                    },
                  ]}
                  onChange={(option) => setCharge(option.value)}
                />
              </section>
            )}
            {charge && (
              <>
                <section className="shop">
                  <h4>What is your Brand/Shop name</h4>
                  <input
                    required={true}
                    name="shop"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </section>
                <section>
                  <h4>Do you have a Logo?</h4>
                  <FileInput
                    prefill={logo}
                    onChange={(files) => setLogo(files)}
                  />
                </section>
                <section>
                  <h4>Shop Phone number</h4>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </section>
              </>
            )}
            <section>
              <h4>Do you have GST Registration?</h4>
              <Combobox
                required={true}
                defaultValue={gst}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
                onChange={(op) => setGst(op.value)}
              />
            </section>
            {gst === true && (
              <>
                <section>
                  <h4>GST Registration number</h4>
                  <input
                    required={true}
                    value={gstReg}
                    onChange={(e) => setGstReg(e.target.value)}
                  />
                </section>
                <section>
                  <h4>GST amount (%)</h4>
                  <input
                    type="number"
                    required={true}
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                  />
                </section>
              </>
            )}
            <section className="method">
              <h4>Do you want to Receive Payments Via</h4>
              <Combobox
                required={true}
                defaultValue={paymentMethod}
                options={[
                  { label: "Check", value: "check" },
                  { label: "Demand Draft", value: "demandDraft" },
                  {
                    label: "Directly in your bank account",
                    value: "bankAccount",
                  },
                ]}
                onChange={(op) => setPaymentMethod(op.value)}
              />
            </section>
            {paymentMethod === "bankAccount" && (
              <>
                <section className="bankDetails">
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
              </>
            )}
            {!(paymentMethod === "bankAccount") && (
              <p className="note">
                Please note - Checks & Demand Drafts can take longer & a
                additional charges such as courier charges are applicable .
                Incase of Loss of Demand Draft - We will not be able to issue a
                new one without the Bank's Approval
              </p>
            )}
            {offerings === "service" ? (
              <>
                <section>
                  <h4>Can your customer ask for refunds?</h4>
                  <Combobox
                    required={true}
                    defaultValue={refund}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(op) => setRefund(op.value)}
                  />
                </section>
                {refund && (
                  <section>
                    <h4>
                      Upto how many days can the customer claim a refund in?
                    </h4>
                    <Combobox
                      required={true}
                      defaultValue={refundable}
                      onChange={(e) => setRefundable(e.value)}
                      options={[
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
                )}
              </>
            ) : (
              <>
                <section>
                  <h4>In how many days do you generally ship your products?</h4>
                  <input
                    required={true}
                    type="number"
                    value={deliveryWithin}
                    onChange={(e) => setDeliveryWithin(e.target.value)}
                  />
                </section>
                <section className="deliveryMethod">
                  <h4>
                    Do you currently have a courier company which handles your
                    orders?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={deliveryMethod}
                    options={[
                      { label: "Yes - I will use my own", value: "shop" },
                      {
                        label:
                          "No - I would like deliverypay to handle my couriers & returns",
                        value: "deliveryPay",
                      },
                    ]}
                    onChange={(op) => setDeliveryMethod(op.value)}
                  />
                </section>
                <section className="deliveryMethod">
                  <h4>
                    Are Courier Charges Included in cost of product or extra?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={shipping}
                    options={[
                      {
                        label:
                          "Yes. Shipping costs are included in the product.",
                        value: null,
                      },
                      { label: "No. Shipping costs are extra", value: true },
                    ]}
                    onChange={(op) => setShipping(op.value)}
                  />
                </section>
                {shipping && (
                  <section>
                    <h4>What is the shipping cost (₹)</h4>
                    <input
                      type="number"
                      value={shippingCost}
                      required={true}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </section>
                )}
                <section>
                  <h4>
                    If a Customer Claims They are not satisfied with your
                    product Do you provide Refunds?
                  </h4>
                  <Combobox
                    required={true}
                    defaultValue={refund}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(op) => setRefund(op.value)}
                  />
                </section>
                {refund && (
                  <section>
                    <h4>
                      Upto how many days can the customer claim a refund in?
                    </h4>
                    <Combobox
                      required={true}
                      defaultValue={refundable}
                      onChange={(e) => setRefundable(e.value)}
                      options={[
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
                )}
              </>
            )}
            <section className="terms">
              <h4>Terms to Show to my Buyers</h4>
              <ul>
                {terms.map((item, i) => (
                  <li key={i}>
                    <p>{item}</p>
                    <button
                      type="button"
                      className="clear"
                      onClick={() =>
                        setTerms((prev) => prev.filter((term) => term !== item))
                      }
                    >
                      <X_svg />
                    </button>
                  </li>
                ))}
                {terms.length === 0 && <li>No terms has been added.</li>}
              </ul>
              <div className="newTerm">
                <TextareaAutosize ref={termInput} />
                <button
                  type="button"
                  className="fill"
                  onClick={() => {
                    const newTerm = termInput.current.value;
                    setTerms((prev) =>
                      newTerm
                        ? [...prev.filter((term) => term !== newTerm), newTerm]
                        : prev
                    );
                    termInput.current.value = "";
                  }}
                >
                  Add Terms
                </button>
              </div>
            </section>
          </>
        )}
      </div>
      <section className="btns">
        {step > 1 && (
          <button
            className="fill"
            onClick={() => setStep((prev) => prev - 1)}
            type="button"
          >
            Back
          </button>
        )}
        <button className="fill next">{step === 5 ? "Submit" : "Next"}</button>
      </section>
      <div className="pad" />
    </form>
  );
};

export default ShopSetup;
