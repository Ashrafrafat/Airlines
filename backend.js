
const express = require("express");
const mongoose = require("mongoose");


const CONNECTION_STRING =
  "mongodb+srv://aurafat24:aurafat24@cluster0.2ddxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex, useFindAndModify no longer needed in Mongoose 6+
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// 2) Define Schemas & Models

//-------------------- Seat
const SeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  class: { type: String, required: true }, // e.g. "Economy", "Business"
  isOccupied: { type: Boolean, default: false },
});

//-------------------- Flight
const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  price: { type: Number, required: true },
  airline: { type: String, required: true },
  availableSeats: [SeatSchema],
});
const Flight = mongoose.model("Flight", FlightSchema);

//-------------------- LoyaltyProgram
const LoyaltyProgramSchema = new mongoose.Schema({
  programId: { type: String, required: true },
  programName: { type: String, required: true },
  pointsPerDollar: { type: Number, required: true },
  tier: { type: String, required: true }, // e.g. "Silver", "Gold"
  active: { type: String, default: "Yes" },
  validTill: { type: Date, required: true },
});
const LoyaltyProgram = mongoose.model("LoyaltyProgram", LoyaltyProgramSchema);

//-------------------- Customer
const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyProgram: LoyaltyProgramSchema,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});
const Customer = mongoose.model("Customer", CustomerSchema);

//-------------------- Meal
const MealSchema = new mongoose.Schema({
  mealType: { type: String, required: true },
});

//-------------------- SpecialRequest
const SpecialRequestSchema = new mongoose.Schema({
  requestType: { type: String, required: true },
  note: { type: String },
  status: { type: String, default: "Pending" },
});

//-------------------- Payment
const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  method: { type: String, required: true },
  transactionId: { type: String, required: true },
});

//-------------------- Booking
const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: "Confirmed" },
  meals: [MealSchema],
  specialRequests: [SpecialRequestSchema],
  paymentInfo: PaymentSchema,
});
const Booking = mongoose.model("Booking", BookingSchema);

//-------------------- Ticket
const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  boardingPassUrl: { type: String },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
});
const Ticket = mongoose.model("Ticket", TicketSchema);

//-------------------- User
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

//-------------------- Admin (pseudo-"extends" User)
const AdminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  d: String,
});
const Admin = mongoose.model("Admin", AdminSchema);

// 3) Set up Express App
const app = express();
app.use(express.json()); // parse JSON bodies

// 4) Example Routes for each entity
//----------------------------------
// FLIGHTS
//----------------------------------
app.get("/api/flights", async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/flights", async (req, res) => {
  try {
    const newFlight = await Flight.create(req.body);
    res.json(newFlight);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/flights/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json(flight);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/flights/:id", async (req, res) => {
  try {
    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedFlight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json(updatedFlight);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/flights/:id", async (req, res) => {
  try {
    const deletedFlight = await Flight.findByIdAndDelete(req.params.id);
    if (!deletedFlight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json({ message: "Flight deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------------------------------
// CUSTOMERS
//----------------------------------
app.get("/api/customers", async (req, res) => {
  try {
    // optionally populate bookings
    const customers = await Customer.find().populate("bookings");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.json(newCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------------------------------
// BOOKINGS
//----------------------------------
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer")
      .populate("flights");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = await Booking.create(req.body);

    // link booking to the customer
    if (newBooking.customer) {
      await Customer.findByIdAndUpdate(newBooking.customer, {
        $push: { bookings: newBooking._id },
      });
    }

    res.json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------------------------------
// TICKETS
//----------------------------------
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("booking");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tickets", async (req, res) => {
  try {
    const newTicket = await Ticket.create(req.body);
    res.json(newTicket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//----------------------------------
// USERS / ADMINS
//----------------------------------
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admins
app.get("/api/admins", async (req, res) => {
  try {
    const admins = await Admin.find().populate("user").populate("flights");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admins", async (req, res) => {
  try {
    const newAdmin = await Admin.create(req.body);
    res.json(newAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5) Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
