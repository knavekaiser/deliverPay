const transactionModel = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true }
);
global.Transaction = mongoose.model("Transaction", transactionModel);
global.P2PTransaction = Transaction.discriminator(
  "P2PTransaction",
  new Schema({
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
      required: true,
    },
    client: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    dscr: { type: String },
  })
);
global.AddMoney = Transaction.discriminator(
  "AddMoney",
  new Schema({
    paymentMethod: { type: String },
    transactionId: { type: String, unique: true, sparse: true },
  })
);
global.WithdrawMoney = Transaction.discriminator(
  "WithdrawMoney",
  new Schema({
    paymentMethod: { type: String },
    transactionId: { type: String, unique: true, sparse: true },
  })
);

const razorOrderIdModel = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    id: { type: String, required: true, unique: true },
    currency: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, default: "pending" },
    expireAt: { type: Date, default: Date.now, index: { expires: "120m" } },
  },
  { timestamps: true }
);
global.RazorOrderId = mongoose.model("RazorOrderId", razorOrderIdModel);

const milestoneModel = new Schema(
  {
    buyer: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      address: {},
    },
    seller: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      address: {},
    },
    status: {
      type: String,
      enum: [
        "pending",
        "inProgress",
        "pendingRelease",
        "released",
        "cancelled",
        "declined",
        "dispute",
        "pendingVerdict",
        "reverted",
      ],
      default: "pending",
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    refundId: { type: Schema.Types.ObjectId, ref: "Refund" },
    releaseDate: { type: Date },
    amount: { type: Number, required: true },
    verification: { type: String, default: "smooth" },
    dispute: { type: Schema.Types.ObjectId, ref: "Dispute" },
    dscr: { type: String },
    fee: { type: Number, required: true },
    gst: { type: Number },
  },
  { timestamps: true }
);
global.Milestone = mongoose.model("Milestone", milestoneModel);

const rewardModel = new Schema(
  {
    name: { type: String },
    dscr: { type: String },
    img: { type: String },
    amount: { type: Number },
    redeemed: { type: Boolean, default: false },
  },
  { timestamps: true }
);
global.Reward = mongoose.model("Reward", rewardModel);

const paymentMethodModel = new Schema(
  {
    dscr: { type: String },
  },
  { timestamps: true }
);
global.PaymentMethod = mongoose.model("PaymentMethod", paymentMethodModel);
global.BankAccount = PaymentMethod.discriminator(
  "BankAccount",
  new Schema({
    name: { type: String, required: true },
    bank: { type: String },
    accountNumber: { type: String, required: true },
    type: { type: String },
    ifsc: { type: String, required: true },
    city: { type: String },
  })
);
global.VpaAccount = PaymentMethod.discriminator(
  "VpaAccount",
  new Schema({
    username: { type: String },
    handle: { type: String },
    address: { type: String, required: true },
  })
);
global.BankCard = PaymentMethod.discriminator(
  "BankCard",
  new Schema({
    brand: { type: String },
    cardNumber: { type: String, required: true },
    nameOnCard: { type: String, required: true },
    exp: { type: String, required: true },
    cvv: { type: String, required: true },
  })
);
