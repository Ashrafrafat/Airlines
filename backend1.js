/******************************************************
 * BACKEND.JS
 *
 * This file implements:
 * 1) Classes for User, Admin, Flight, and LoyaltyProgram.
 * 2) Registration and login endpoints for both customers and admins.
 * 3) Example endpoints to manage (CRUD) flights and loyalty programs.
 * 
 * Data is stored in JSON files:
 *   - customers.json
 *   - admins.json
 *   - flights.json
 *   - loyaltyPrograms.json
 ******************************************************/

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', // Be more restrictive in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// ----------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------

// ================ CLASS: User ==================
class User {
  constructor(userId, name, email, password) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

// ================ CLASS: Admin =================
// (Admin is conceptually a specialized User)
class Admin extends User {
  constructor(userId, name, email, password) {
    super(userId, name, email, password);
    // The diagram shows that an Admin can manage flights and loyalty programs
    this.flights = [];         // Array of flight IDs or flight objects
    this.loyaltyPrograms = []; // Array of loyalty program IDs or objects
  }

  manageFlights(flights) {
    this.flights = flights; // Replace the entire flights array
  }

  manageLoyaltyPrograms(loyaltyPrograms) {
    this.loyaltyPrograms = loyaltyPrograms; // Replace the entire loyaltyPrograms array
  }
}

// ================ CLASS: Seat (Optional) =================
// If you want to fully handle seats, uncomment below.
 class Seat {
constructor(seatNumber, seatClass, isOccupied = false) {
this.seatNumber = seatNumber;
this.class = seatClass;     // e.g. "Economy", "Business", "First"
this.isOccupied = isOccupied;
   }
  static fromJSON(obj) {
    return new Seat(obj.seatNumber, obj.class, obj.isOccupied);
   }
 }

// ================ CLASS: Flight ==================
class Flight {
  constructor(flightNumber, departureTime, arrivalTime, origin, destination, price, airline) {
    this.flightNumber = flightNumber;
    this.departureTime = departureTime;  // Date or string
    this.arrivalTime = arrivalTime;      // Date or string
    this.origin = origin;
    this.destination = destination;
    this.price = price;
    this.airline = airline;
    this.availableSeats = [];
    this.baggage = []; // array of Seat objects (if using the Seat class)
  }

  addSeat(seat) {
    this.availableSeats.push(seat);
  }

  // Convert a plain JSON object into a Flight instance
  static fromJSON(obj) {
    const flight = new Flight(
      obj.flightNumber,
      obj.departureTime,
      obj.arrivalTime,
      obj.origin,
      obj.destination,
      obj.price,
      obj.airline
    );
    // If using seats, map them here:
    // if (obj.availableSeats && Array.isArray(obj.availableSeats)) {
    //   flight.availableSeats = obj.availableSeats.map(seatObj => Seat.fromJSON(seatObj));
    // }
    return flight;
  }
}

// ================ CLASS: Meal ==================
class Meal {
  constructor(mealType) {
    this.mealType = mealType; // e.g., "Vegetarian", "Standard", "Kosher"
  }
}

// ================ CLASS: SpecialRequest ==================
class SpecialRequest {
  constructor(requestType, note, status = "Pending") {
    this.requestType = requestType; // e.g. "Wheelchair"
    this.note = note;               // e.g. "Need assistance boarding"
    this.status = status;           // "Pending", "Approved", etc.
  }
}

// ================ CLASS: Ticket ==================
class Ticket {
  constructor(ticketId, boardingPassUrl, bookingRef) {
    this.ticketId = ticketId;
    this.boardingPassUrl = boardingPassUrl;
    // "bookingRef" could be the booking ID or a full Booking object
    this.bookingRef = bookingRef;
  }
}

// ================ CLASS: Booking ==================
class Booking {
  constructor(
    bookingId,
    flightNumber,
    seatObj,
    mealObj,
    specialRequestObj,
    ticketObj,
    bookingDate,
    baggage
  ) {
    this.bookingId = bookingId;
    this.flightNumber = flightNumber;
    this.seat = seatObj;            // instance of Seat
    this.meal = mealObj;            // instance of Meal
    this.specialRequest = specialRequestObj; // instance of SpecialRequest
    this.ticket = ticketObj;        // instance of Ticket
    this.bookingDate = bookingDate;
    this.baggage = baggage; // e.g. new Date().toISOString()
  }
}


// ================ CLASS: LoyaltyProgram ==================
class LoyaltyProgram {
  constructor(programId, programName, pointsPerDollar, tier, active, validTill) {
    this.programId = programId;
    this.programName = programName;
    this.pointsPerDollar = pointsPerDollar;
    this.tier = tier;         // e.g. "Silver", "Gold", "Platinum"
    this.active = active;     // e.g. "Yes"/"No", or a boolean true/false
    this.validTill = validTill; // a Date or date-time string
  }

  static fromJSON(obj) {
    return new LoyaltyProgram(
      obj.programId,
      obj.programName,
      obj.pointsPerDollar,
      obj.tier,
      obj.active,
      obj.validTill
    );
  }
}

// ----------------------------------------------------------------------
// Utility functions to load and save JSON data
// ----------------------------------------------------------------------
function loadJSON(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

function saveJSON(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ----------------------------------------------------------------------
// CUSTOMER Registration and Login Endpoints
// ----------------------------------------------------------------------

// POST /register - Customer Registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: name, email, and password are required.' });
  }

  // Load customers from JSON file
  const customers = loadJSON('customers.json');
  //Unique Email per User
  // Check if the email is already registered
  if (customers.some(customer => customer.email === email)) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  // Create new customer object
  const newCustomer = {
    userId: 'cust' + Date.now(),
    name,
    email,
    password, // In production, remember to hash passwords!
    loyaltyPoints: 0,
    loyaltyProgram: null,
    bookings: []
  };

  // Save new customer
  customers.push(newCustomer);
  saveJSON('customers.json', customers);

  return res.status(201).json({
    message: 'Customer registered successfully.',
    customer: newCustomer
  });
});

// POST /login - Customer Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: email and password are required.' });
  }

  // Load customers from JSON file
  const customers = loadJSON('customers.json');

  // Find customer with matching credentials
  const customer = customers.find(c => c.email === email && c.password === password);
  if (!customer) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.status(200).json({ message: 'Customer login successful.', customer });
});

// ----------------------------------------------------------------------
// ADMIN Registration and Login Endpoints
// ----------------------------------------------------------------------

// POST /admin/register - Admin Registration
app.post('/admin/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: name, email, and password are required.' });
  }

  // Load admins from JSON file
  const admins = loadJSON('admins.json');

  // Check if email is already registered
  if (admins.some(a => a.email === email)) {
    return res.status(400).json({ message: 'Admin email already registered.' });
  }

  // Create new admin object
  const newAdmin = {
    userId: 'admin' + Date.now(),
    name,
    email,
    password,  // In production, hash passwords before storing!
    flights: [],
    loyaltyPrograms: []
  };

  // Save new admin
  admins.push(newAdmin);
  saveJSON('admins.json', admins);

  return res.status(201).json({ message: 'Admin registered successfully.', admin: newAdmin });
});

// POST /admin/login - Admin Login
app.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: email and password are required.' });
  }

  // Load admins from JSON file
  const admins = loadJSON('admins.json');

  // Find admin with matching credentials
  const admin = admins.find(a => a.email === email && a.password === password);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.status(200).json({ message: 'Admin login successful.', admin });
});

// ----------------------------------------------------------------------
// EXAMPLE: Admin Management Endpoints (Flights & Loyalty Programs)
// ----------------------------------------------------------------------

// POST /admin/:adminId/manageFlights
app.post('/admin/:adminId/manageFlights', (req, res) => {
  const { adminId } = req.params;
  const { flights } = req.body; // Expecting flights to be an array of flight IDs or objects

  if (!flights || !Array.isArray(flights)) {
    return res.status(400).json({ message: 'Flights must be provided as an array.' });
  }

  // Load admins
  const admins = loadJSON('admins.json');
  const adminIndex = admins.findIndex(a => a.userId === adminId);
  if (adminIndex === -1) {
    return res.status(404).json({ message: 'Admin not found.' });
  }

  // Update the admin's flights
  admins[adminIndex].flights = flights;
  saveJSON('admins.json', admins);

  return res.status(200).json({
    message: 'Admin flights updated successfully.',
    admin: admins[adminIndex]
  });
});

// POST /admin/:adminId/manageLoyaltyPrograms
app.post('/admin/:adminId/manageLoyaltyPrograms', (req, res) => {
  const { adminId } = req.params;
  const { loyaltyPrograms } = req.body; // Expecting an array of program IDs or objects

  if (!loyaltyPrograms || !Array.isArray(loyaltyPrograms)) {
    return res.status(400).json({ message: 'Loyalty programs must be provided as an array.' });
  }

  // Load admins
  const admins = loadJSON('admins.json');
  const adminIndex = admins.findIndex(a => a.userId === adminId);
  if (adminIndex === -1) {
    return res.status(404).json({ message: 'Admin not found.' });
  }

  // Update the admin's loyalty programs
  admins[adminIndex].loyaltyPrograms = loyaltyPrograms;
  saveJSON('admins.json', admins);

  return res.status(200).json({
    message: 'Admin loyalty programs updated successfully.',
    admin: admins[adminIndex]
  });
});

// GET /flights - Get all flights with optional filtering
app.get('/flights', (req, res) => {
  console.log('DEBUG: In GET /flights route'); // Add for debugging
  console.log('Query params:', req.query);

  const { origin, destination } = req.query;
  let flightData = loadJSON('flights.json');

  // Filter by origin if 'origin' query param is provided
  if (origin) {
    flightData = flightData.filter(flight =>
      flight.origin.toLowerCase() === origin.toLowerCase().trim()
    );
  }

  // Filter by destination if 'destination' query param is provided
  if (destination) {
    flightData = flightData.filter(flight =>
      flight.destination.toLowerCase() === destination.toLowerCase().trim()
    );
  }

  // Log how many flights remain after filtering
  console.log('DEBUG: flightData after filter:', flightData.map(f => f.flightNumber));
  res.json(flightData);
});

// ----------------------------------------------------------------------
// EXAMPLE: Flight and LoyaltyProgram Endpoints (CRUD-like)
// ----------------------------------------------------------------------

// POST /flights - Add a Flight
app.post('/flights', (req, res) => {
  const flightData = loadJSON('flights.json');
  const { flightNumber, departureTime, arrivalTime, origin, destination, price, airline, availableSeats } = req.body;
  //•	Unique Flight Numbers
  // Check if the flight number already exists
  const existingFlight = flightData.find(flight => flight.flightNumber === flightNumber);
  if (existingFlight) {
    return res.status(400).json({ message: 'Flight number must be unique. This flight number already exists.' });
  }
  //Flight Departure Must Be Before Arrival
  // Check if departure is before arrival
  const depTime = new Date(departureTime);
  const arrTime = new Date(arrivalTime);
  if (depTime >= arrTime) {
    return res.status(400).json({ message: 'Flight departure time must be before arrival time.' });
  }

  // Validate available seats if provided
  if (availableSeats && Array.isArray(availableSeats)) {
    //•	No Duplicate Seats in a Flight
    // Check for duplicate seat numbers
    const seatNumbers = availableSeats.map(seat => seat.seatNumber);
    const uniqueSeatNumbers = new Set(seatNumbers);
    if (uniqueSeatNumbers.size !== seatNumbers.length) {
      return res.status(400).json({ message: 'Duplicate seats are not allowed in a flight.' });
    }
    //•	Occupied or Available Seats
    // Ensure each seat has a valid Boolean for isOccupied (default to false if not)
    availableSeats.forEach(seat => {
      if (typeof seat.isOccupied !== 'boolean') {
        seat.isOccupied = false;
      }
    });
  }

  // Create the new flight object
  const newFlight = {
    flightNumber: flightNumber.trim(),
    departureTime: departureTime.trim(),
    arrivalTime: arrivalTime.trim(),
    origin: origin.trim(),
    destination: destination.trim(),
    price: parseFloat(price),
    airline: airline.trim(),
    availableSeats  // includes seat details if provided
  };

  flightData.push(newFlight);
  saveJSON('flights.json', flightData);
  
  return res.status(201).json({ message: 'Flight added successfully.', flight: newFlight });
});

// ------------------------------
// CUSTOMER: Book a Seat in a Flight
// ------------------------------
app.post('/customer/:customerId/bookSeat', (req, res) => {
  const { customerId } = req.params;
  const { flightNumber, seatNumber } = req.body;

  // Load customers and flights data
  const customers = loadJSON('customers.json');
  const flights = loadJSON('flights.json');

  // Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // Find the flight
  const flight = flights.find(f => f.flightNumber === flightNumber);
  if (!flight) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // Check if availableSeats exists
  if (!flight.availableSeats || !Array.isArray(flight.availableSeats)) {
    return res.status(400).json({ message: 'No seats available for this flight.' });
  }

  // Find the seat in the flight's availableSeats
  const seat = flight.availableSeats.find(s => s.seatNumber === seatNumber);
  if (!seat) {
    return res.status(404).json({ message: 'Seat not found in this flight.' });
  }
  //Occupied or Available Seats
  // Check if the seat is already occupied
  //Seat Cannot Be Occupied More Than Once
  if (seat.isOccupied) {
    return res.status(400).json({ message: 'Seat is already occupied.' });//Seats Cannot Be Overbooked
  }

  //Customer Cannot Book the Same Flight Twice
  // Check if the customer has already booked this seat in this flight
  // Assuming customer.bookings is now an array of objects with flightNumber and seatNumber
  const existingBooking = customer.bookings.find(b => b.flightNumber === flightNumber && b.seatNumber === seatNumber);
  if (existingBooking) {
    return res.status(400).json({ message: 'You have already booked this seat.' });
  }

  // Mark the seat as occupied
  seat.isOccupied = true;

  // Add the seat booking to the customer's bookings array
  // We now store bookings as objects with flightNumber and seatNumber
  if (!customer.bookings) {
    customer.bookings = [];
  }
  customer.bookings.push({ flightNumber, seatNumber });

  // Save the updated customer and flight data
  saveJSON('customers.json', customers);
  saveJSON('flights.json', flights);

  return res.status(200).json({ message: 'Seat booked successfully.', booking: { flightNumber, seatNumber } });
});



// GET /loyaltyPrograms
app.get('/loyaltyPrograms', (req, res) => {
  const lpData = loadJSON('loyaltyPrograms.json');
  return res.json(lpData);
});

// POST /loyaltyPrograms
app.post('/loyaltyPrograms', (req, res) => {
  const lpData = loadJSON('loyaltyPrograms.json');
  lpData.push(req.body);
  saveJSON('loyaltyPrograms.json', lpData);
  return res.status(201).json({ message: 'Loyalty program added.', program: req.body });
});
// ------------------------------
// ------------------------------
// CUSTOMER: Book a Flight (Expanded)
// ------------------------------
// ------------------------------
// CUSTOMER: Book a Flight (Refactored with Classes)
// ------------------------------
app.post('/customer/:customerId/bookFlight', (req, res) => {
  const { customerId } = req.params;

  // We'll expect these fields in the body:
  // flightNumber (required)
  // seatNumber, seatClass (optional)
  // mealType (optional)
  // specialRequestType, specialRequestNote (optional)
  // boardingPassUrl (optional)
  const {
    flightNumber,
    seatNumber,
    seatClass,
    mealType,
    specialRequestType,
    specialRequestNote,
    boardingPassUrl,
    baggage
  } = req.body;

  // Load customers and flights
  const customers = loadJSON('customers.json');
  const flights = loadJSON('flights.json');

  // 1) Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // 2) Find the flight
  const flight = flights.find(f => f.flightNumber === flightNumber);
  if (!flight) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // 3) Check if already booked
  const alreadyBooked = customer.bookings.some(booking => {
    if (typeof booking === 'object' && booking.flightNumber === flightNumber) {
      return true;
    } else if (typeof booking === 'string' && booking === flightNumber) {
      return true;
    }
    return false;
  });
  if (alreadyBooked) {
    return res.status(400).json({ message: 'You have already booked this flight.' });
  }

  // 4) Build new class instances

  // Seat object
  const seatObj = new Seat(seatNumber || "Unassigned", seatClass || "Economy", false);

  // Optional: Mark seat as occupied in flights.json if seatNumber is provided
  if (seatNumber) {
    const seatInFlight = flight.availableSeats.find(s => s.seatNumber === seatNumber);
    if (seatInFlight && !seatInFlight.isOccupied) {
      seatInFlight.isOccupied = true;
      saveJSON('flights.json', flights); // persist seat occupancy
    }
  }

  // Meal object
  const mealObj = new Meal(mealType || "Standard");

  // SpecialRequest object
  let specialRequestObj = null;
  if (specialRequestType) {
    specialRequestObj = new SpecialRequest(
      specialRequestType,
      specialRequestNote || "",
      "Pending"
    );
  }

  // Generate a new bookingId
  function generateBookingId() {
    return 'BK-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  const bookingId = generateBookingId();

  // Build a Ticket
  const ticketId = 'TK-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  const ticketObj = new Ticket(ticketId, boardingPassUrl || "", null);

  // Create the Booking object
  const newBooking = new Booking(
    bookingId,
    flightNumber,
    seatObj,
    mealObj,
    specialRequestObj,
    ticketObj,
    new Date().toISOString(),
    baggage // Optional baggage info
  );

  // Link the ticket back to the booking if you wish
  ticketObj.bookingRef = newBooking.bookingId;

  // 5) Save the booking to the customer's record
  if (!customer.bookings) {
    customer.bookings = [];
  }
  customer.bookings.push(newBooking);

  // 6) Save the updated data
  saveJSON('customers.json', customers);

  return res.status(201).json({
    message: 'Flight booked successfully with classes.',
    booking: newBooking
  });
});



/**
 * ===============================
 * NEW: EDIT AN EXISTING FLIGHT
 * ===============================
 */
app.put('/flights/:flightNumber', (req, res) => {
  const { flightNumber } = req.params;
  const {
    newFlightNumber,
    departureTime,
    arrivalTime,
    origin,
    destination,
    price,
    airline,
    availableSeats
  } = req.body;

  const flightData = loadJSON('flights.json');
  const flightIndex = flightData.findIndex(f => f.flightNumber === flightNumber);

  if (flightIndex === -1) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // If user wants to update the flight number, check uniqueness
  if (newFlightNumber && newFlightNumber.trim() !== flightNumber) {
    const flightExists = flightData.some(
      f => f.flightNumber === newFlightNumber.trim() && f.flightNumber !== flightNumber
    );
    if (flightExists) {
      return res
        .status(400)
        .json({ message: 'Cannot change to this flightNumber, it already exists.' });
    }
  }

  // Validate departure/arrival times if present
  if (departureTime && arrivalTime) {
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    if (depTime >= arrTime) {
      return res
        .status(400)
        .json({ message: 'Flight departure time must be before arrival time.' });
    }
  }

  // Validate seats if user provided them
  if (availableSeats && Array.isArray(availableSeats)) {
    // Check for duplicate seat numbers
    const seatNumbers = availableSeats.map(seat => seat.seatNumber);
    const uniqueSeatNumbers = new Set(seatNumbers);
    if (uniqueSeatNumbers.size !== seatNumbers.length) {
      return res
        .status(400)
        .json({ message: 'Duplicate seats are not allowed in a flight.' });
    }
    // Ensure each seat has a valid Boolean for isOccupied
    availableSeats.forEach(seat => {
      if (typeof seat.isOccupied !== 'boolean') {
        seat.isOccupied = false;
      }
    });
  }

  // Update the flight object
  if (newFlightNumber) {
    flightData[flightIndex].flightNumber = newFlightNumber.trim();
  }
  if (departureTime) {
    flightData[flightIndex].departureTime = departureTime.trim();
  }
  if (arrivalTime) {
    flightData[flightIndex].arrivalTime = arrivalTime.trim();
  }
  if (origin) {
    flightData[flightIndex].origin = origin.trim();
  }
  if (destination) {
    flightData[flightIndex].destination = destination.trim();
  }
  if (price !== undefined) {
    flightData[flightIndex].price = parseFloat(price);
  }
  if (airline) {
    flightData[flightIndex].airline = airline.trim();
  }
  if (availableSeats) {
    flightData[flightIndex].availableSeats = availableSeats;
  }

  saveJSON('flights.json', flightData);

  return res.status(200).json({
    message: 'Flight updated successfully.',
    flight: flightData[flightIndex]
  });
});

/**
 * ===============================
 * NEW: DELETE AN EXISTING FLIGHT
 * ===============================
 */
app.delete('/flights/:flightNumber', (req, res) => {
  const { flightNumber } = req.params;
  const flightData = loadJSON('flights.json');
  const flightIndex = flightData.findIndex(f => f.flightNumber === flightNumber);

  if (flightIndex === -1) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // Remove the flight from the array
  const deletedFlight = flightData.splice(flightIndex, 1)[0];
  saveJSON('flights.json', flightData);

  return res.status(200).json({
    message: 'Flight deleted successfully.',
    deletedFlight
  });
});

app.post('/customer/:customerId/payment', (req, res) => {
  const { customerId } = req.params;
  
  // We now expect:
  //   - flightNumber
  //   - paymentAmount
  //   - creditCardNumber (12 digits)
  //   - cvv (3 digits)
  const { flightNumber, paymentAmount, creditCardNumber, cvv, bookingId } = req.body;

  // Load customers and flights data
  const customers = loadJSON('customers.json');
  const flights = loadJSON('flights.json');

  // 1) Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // 2) Find the flight
  const flight = flights.find(f => f.flightNumber === flightNumber);
  if (!flight) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // 3) Check booking
  if (!customer.bookings.includes(flightNumber)) {
    return res.status(400).json({ message: 'You have not booked this flight yet.' });
  }

  // 4) Validate payment amount matches the flight price
  if (paymentAmount !== flight.price) {
    return res.status(400).json({
      message: 'Payment amount must be equal to the total flight cost.'
    });
  }

  // 5) Validate creditCardNumber (12 digits)
  if (!creditCardNumber || !/^\d{12}$/.test(creditCardNumber)) {
    return res.status(400).json({
      message: 'Invalid credit card number. Must be exactly 12 digits.'
    });
  }

  // 6) Validate CVV (3 digits)
  if (!cvv || !/^\d{3}$/.test(cvv)) {
    return res.status(400).json({
      message: 'Invalid CVV. Must be 3 digits.'
    });
  }

  // 7) Generate transaction ID automatically
  function generateTransactionId() {
    // e.g. "TXN-<timestamp>-<random4digits>"
    return 'TXN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  const transactionId = generateTransactionId();

  // 8) Add payment details to the customer
  if (!customer.payments) {
    customer.payments = [];
  }

  const paymentDetails = {
    flightNumber,
    paymentAmount,
    transactionId,
    date: new Date().toISOString()
  };

  customer.payments.push(paymentDetails);

  // 9) Award loyalty points if customer is in loyalty program
  let loyaltyPointsEarned = 0;
  let tierUpgraded = false;
  let newTier = null;

  if (customer.loyaltyProgram) {
    // Calculate points based on the customer's current pointsPerDollar rate
    const pointsPerDollar = customer.loyaltyProgram.pointsPerDollar || 1;
    loyaltyPointsEarned = Math.floor(paymentAmount * pointsPerDollar);
    
    // Add points to customer's account
    if (!customer.loyaltyPoints) {
      customer.loyaltyPoints = 0;
    }
    customer.loyaltyPoints += loyaltyPointsEarned;
    
    // Track total spending for tier upgrades
    if (!customer.totalSpent) {
      customer.totalSpent = 0;
    }
    customer.totalSpent += paymentAmount;
    
    // Check if customer should be upgraded to a new tier
    if (customer.totalSpent >= 2000 && customer.loyaltyProgram.level !== 'Platinum') {
      customer.loyaltyProgram.level = 'Platinum';
      customer.loyaltyProgram.pointsPerDollar = 3; // Higher earn rate for platinum
      customer.loyaltyProgram.lastUpgrade = new Date().toISOString();
      tierUpgraded = true;
      newTier = 'Platinum';
    }
    else if (customer.totalSpent >= 1500 && customer.loyaltyProgram.level !== 'Gold' 
            && customer.loyaltyProgram.level !== 'Platinum') {
      customer.loyaltyProgram.level = 'Gold';
      customer.loyaltyProgram.pointsPerDollar = 2.5;
      customer.loyaltyProgram.lastUpgrade = new Date().toISOString();
      tierUpgraded = true;
      newTier = 'Gold';
    }
    else if (customer.totalSpent >= 1000 && customer.loyaltyProgram.level === 'Basic') {
      customer.loyaltyProgram.level = 'Silver';
      customer.loyaltyProgram.pointsPerDollar = 2;
      customer.loyaltyProgram.lastUpgrade = new Date().toISOString();
      tierUpgraded = true;
      newTier = 'Silver';
    }
  }

  // 10) Save the updated customer data
  saveJSON('customers.json', customers);

  // 11) Return the response with payment and loyalty information
  const response = {
    message: 'Payment successful.',
    paymentDetails
  };
  
  // Add loyalty information to the response if relevant
  if (customer.loyaltyProgram) {
    response.loyaltyInfo = {
      pointsEarned: loyaltyPointsEarned,
      totalPoints: customer.loyaltyPoints,
      currentTier: customer.loyaltyProgram.level,
      tierUpgraded
    };
    
    if (tierUpgraded) {
      response.loyaltyInfo.newTier = newTier;
      response.loyaltyInfo.message = `Congratulations! You've been upgraded to ${newTier} status.`;
    }
  }

  return res.status(200).json(response);
});

/**
 * ===============================
 * NEW: CUSTOMER ADDS BAGGAGE
 * ===============================
 */
app.post('/customer/:customerId/addBaggage', (req, res) => {
  const { customerId } = req.params;
  const { flightNumber, baggage } = req.body;
  // 'baggage' can be an array of items or a single object, depending on your needs.

  // Load data
  const customers = loadJSON('customers.json');
  const flights = loadJSON('flights.json');

  // 1) Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // 2) Check that flight exists overall (optional but recommended)
  const flightExists = flights.some(f => f.flightNumber === flightNumber);
  if (!flightExists) {
    return res.status(404).json({ message: 'Flight not found.' });
  }

  // 3) Find the booking for this flight on the customer
  //    NOTE: Your code stores flights in different ways:
  //      - bookFlight: pushes a string flightNumber
  //      - bookSeat: pushes an object { flightNumber, seatNumber }
  //    We handle both cases:
  let bookingIndex = -1;
  let bookingObj = null;

  customer.bookings.forEach((booking, idx) => {
    if (typeof booking === 'string' && booking === flightNumber) {
      bookingIndex = idx;
      bookingObj = { flightNumber }; // convert to object for storing baggage
    } else if (typeof booking === 'object' && booking.flightNumber === flightNumber) {
      bookingIndex = idx;
      bookingObj = booking;
    }
  });

  if (bookingIndex === -1) {
    return res.status(400).json({ message: 'You have not booked this flight yet.' });
  }

  // 4) Attach baggage info to this booking
  //    We'll store an array of baggage items under bookingObj.baggage
  if (!bookingObj.baggage) {
    bookingObj.baggage = [];
  }

  if (Array.isArray(baggage)) {
    // If user sends an array of items, push them all
    bookingObj.baggage.push(...baggage);
  } else if (typeof baggage === 'object') {
    // If user sends a single baggage object, just push it
    bookingObj.baggage.push(baggage);
  } else {
    return res.status(400).json({
      message: 'Invalid baggage format. Provide an array or an object.'
    });
  }

  // 5) Update the customer's booking in memory
  customer.bookings[bookingIndex] = bookingObj;

  // 6) Save the updated customers.json
  saveJSON('customers.json', customers);

  return res.status(200).json({
    message: 'Baggage added successfully.',
    booking: bookingObj
  });
});

/**
 * ===============================
 * NEW: CUSTOMER CANCELS BOOKING AND REQUESTS REFUND
 * ===============================
 */
app.post('/customer/:customerId/booking/:bookingId/cancel', (req, res) => {
  const { customerId, bookingId } = req.params;
  const { reason } = req.body; // Optional reason for cancellation

  // Load data
  const customers = loadJSON('customers.json');
  const flights = loadJSON('flights.json');

  // 1) Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // 2) Find the booking to cancel
  let bookingIndex = -1;
  let bookingToCancel = null;

  // Check different booking formats in our system
  customer.bookings.forEach((booking, idx) => {
    // Handle case where booking is an object with bookingId
    if (typeof booking === 'object' && booking.bookingId === bookingId) {
      bookingIndex = idx;
      bookingToCancel = booking;
    }
    // Handle legacy bookings that might not have bookingId
    else if (typeof booking === 'object' && !booking.bookingId && booking.flightNumber === bookingId) {
      bookingIndex = idx;
      bookingToCancel = booking;
    }
    // Handle case where booking is just a string (flightNumber)
    else if (typeof booking === 'string' && booking === bookingId) {
      bookingIndex = idx;
      bookingToCancel = { flightNumber: booking };
    }
  });

  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  // 3) If the booking had a seat, free up the seat in the flight
  if (bookingToCancel.flightNumber && (bookingToCancel.seatNumber || (bookingToCancel.seat && bookingToCancel.seat.seatNumber))) {
    const flightIndex = flights.findIndex(f => f.flightNumber === bookingToCancel.flightNumber);
    
    if (flightIndex !== -1) {
      const seatNumber = bookingToCancel.seatNumber || (bookingToCancel.seat && bookingToCancel.seat.seatNumber);
      
      if (seatNumber && flights[flightIndex].availableSeats) {
        const seatIndex = flights[flightIndex].availableSeats.findIndex(
          s => s.seatNumber === seatNumber
        );
        
        if (seatIndex !== -1) {
          // Mark the seat as not occupied
          flights[flightIndex].availableSeats[seatIndex].isOccupied = false;
          saveJSON('flights.json', flights);
        }
      }
    }
  }

  // 4) Create a refund record
  const refundAmount = calculateRefundAmount(bookingToCancel);
  const refundId = 'REF-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  
  const refundRecord = {
    refundId,
    bookingId: bookingToCancel.bookingId || bookingId,
    flightNumber: bookingToCancel.flightNumber,
    amount: refundAmount,
    status: 'Pending',
    requestDate: new Date().toISOString(),
    reason: reason || 'Customer requested cancellation'
  };

  // 5) Add refund to customer record
  if (!customer.refunds) {
    customer.refunds = [];
  }
  customer.refunds.push(refundRecord);

  // 6) Mark booking as cancelled instead of removing it
  bookingToCancel.status = 'Cancelled';
  bookingToCancel.cancellationDate = new Date().toISOString();
  customer.bookings[bookingIndex] = bookingToCancel;

  // 7) Save updated customer data
  saveJSON('customers.json', customers);

  return res.status(200).json({
    message: 'Booking cancelled successfully. Refund request submitted.',
    cancellation: {
      bookingId: bookingToCancel.bookingId || bookingId,
      flightNumber: bookingToCancel.flightNumber,
      cancellationDate: bookingToCancel.cancellationDate
    },
    refund: refundRecord
  });
});

// Helper function to calculate refund amount based on booking details
function calculateRefundAmount(booking) {
  // In a real system, this would implement the business logic for:
  // - Different refund amounts based on time before flight
  // - Refund penalties/fees
  // - Ticket class and airline policies
  
  // For this example, we'll assume a flat 80% refund of the payment amount
  let refundAmount = 0;
  
  if (booking.payment && booking.payment.paymentAmount) {
    refundAmount = booking.payment.paymentAmount * 0.8;
  } else {
    // If no payment info in booking, try to look up the flight price
    const flights = loadJSON('flights.json');
    const flight = flights.find(f => f.flightNumber === booking.flightNumber);
    if (flight) {
      refundAmount = flight.price * 0.8;
    }
  }
  
  return parseFloat(refundAmount.toFixed(2)); // Return with 2 decimal places
}

// GET /customer/:customerId/bookings - View and manage bookings
app.get('/customer/:customerId/bookings', (req, res) => {
  console.log('DEBUG: In GET /customer/:customerId/bookings route');
  console.log('URL:', req.url);
  console.log('Query params:', req.query);
  
  const { customerId } = req.params;
  const { status, sortBy } = req.query;

  try {
    // Load customer data
    const customers = loadJSON('customers.json');

    // Find the customer
    const customer = customers.find(c => c.userId === customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Check if the customer has any bookings
    if (!customer.bookings || customer.bookings.length === 0) {
      return res.status(200).json({ 
        message: 'No bookings found for this customer.',
        bookings: [] 
      });
    }

    // Process bookings for display
    let bookings = customer.bookings.map(booking => {
      // Handle different booking formats in our system
      if (typeof booking === 'string') {
        // Legacy format where booking is just a flight number string
        return {
          flightNumber: booking,
          status: 'Active', // Default status for legacy bookings
          bookingDate: 'Unknown'
        };
      } else {
        // Modern format where booking is an object
        return booking;
      }
    });

    // Filter by status if provided
    if (status) {
      const statusLower = status.toLowerCase();
      bookings = bookings.filter(booking => {
        if (!booking.status) return statusLower === 'active'; // Assume active if no status
        return booking.status.toLowerCase() === statusLower;
      });
    }

    // Sort bookings if sortBy parameter is provided
    if (sortBy) {
      switch(sortBy.toLowerCase()) {
        case 'date':
          // Sort by booking date (newest first)
          bookings.sort((a, b) => {
            const dateA = a.bookingDate ? new Date(a.bookingDate) : new Date(0);
            const dateB = b.bookingDate ? new Date(b.bookingDate) : new Date(0);
            return dateB - dateA;
          });
          break;
        case 'flight':
          // Sort by flight number
          bookings.sort((a, b) => {
            if (!a.flightNumber) return 1;
            if (!b.flightNumber) return -1;
            return a.flightNumber.localeCompare(b.flightNumber);
          });
          break;
        case 'status':
          // Sort by status (Active first, then Cancelled)
          bookings.sort((a, b) => {
            const statusA = a.status || 'Active';
            const statusB = b.status || 'Active';
            return statusA.localeCompare(statusB);
          });
          break;
      }
    }

    // Return bookings with flight details if available
    const flights = loadJSON('flights.json');
    
    // Enrich booking data with flight details
    const enrichedBookings = bookings.map(booking => {
      const flightNumber = booking.flightNumber;
      if (flightNumber) {
        const flightDetails = flights.find(f => f.flightNumber === flightNumber);
        if (flightDetails) {
          return {
            ...booking,
            flightDetails: {
              origin: flightDetails.origin,
              destination: flightDetails.destination,
              departureTime: flightDetails.departureTime,
              arrivalTime: flightDetails.arrivalTime,
              airline: flightDetails.airline,
              price: flightDetails.price
            }
          };
        }
      }
      return booking;
    });

    return res.status(200).json({
      message: 'Retrieved bookings successfully.',
      bookings: enrichedBookings
    });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return res.status(500).json({ 
      message: 'Error retrieving bookings',
      error: error.message 
    });
  }
});

/**
 * ===============================
 * NEW: CUSTOMER JOINS LOYALTY PROGRAM
 * ===============================
 */
app.post('/customer/:customerId/joinLoyaltyProgram', (req, res) => {
  const { customerId } = req.params;
  
  // Load customer data
  const customers = loadJSON('customers.json');
  
  // Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  
  // Check if customer already has a loyalty program
  if (customer.loyaltyProgram) {
    return res.status(400).json({ 
      message: 'You are already enrolled in a loyalty program.',
      program: customer.loyaltyProgram
    });
  }
  
  // Set up initial loyalty program (Basic level)
  customer.loyaltyProgram = {
    level: 'Basic',
    dateJoined: new Date().toISOString(),
    pointsPerDollar: 1,
    statusMiles: 0,
    upgradePath: [
      { level: 'Basic', threshold: 0 },
      { level: 'Silver', threshold: 1000 },
      { level: 'Gold', threshold: 1500 },
      { level: 'Platinum', threshold: 2000 }
    ]
  };

  // Initialize loyalty points if not already there
  if (!customer.loyaltyPoints) {
    customer.loyaltyPoints = 0;
  }
  
  // Save the updated customer data
  saveJSON('customers.json', customers);
  
  return res.status(200).json({
    message: 'Successfully joined the loyalty program.',
    loyaltyProgram: customer.loyaltyProgram
  });
});

/**
 * ===============================
 * NEW: GET CUSTOMER LOYALTY STATUS
 * ===============================
 */
app.get('/customer/:customerId/loyaltyStatus', (req, res) => {
  const { customerId } = req.params;
  
  // Load customer data
  const customers = loadJSON('customers.json');
  
  // Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  
  // Check if customer has joined a loyalty program
  if (!customer.loyaltyProgram) {
    return res.status(404).json({ 
      message: 'You are not enrolled in a loyalty program.',
      loyaltyPoints: customer.loyaltyPoints || 0
    });
  }
  
  // Return the loyalty status
  return res.status(200).json({
    message: 'Loyalty status retrieved successfully.',
    loyaltyProgram: customer.loyaltyProgram,
    loyaltyPoints: customer.loyaltyPoints || 0,
    totalSpent: customer.totalSpent || 0
  });
});

/**
 * ===============================
 * NEW: REDEEM LOYALTY POINTS
 * ===============================
 */
app.post('/customer/:customerId/redeemPoints', (req, res) => {
  const { customerId } = req.params;
  const { pointsToRedeem, rewardType } = req.body;
  
  if (!pointsToRedeem || !rewardType) {
    return res.status(400).json({ 
      message: 'Missing required fields: pointsToRedeem and rewardType are required.' 
    });
  }

  // Validate pointsToRedeem is a positive number
  const points = parseInt(pointsToRedeem);
  if (isNaN(points) || points <= 0) {
    return res.status(400).json({ 
      message: 'Points to redeem must be a positive number.' 
    });
  }
  
  // Load customers data
  const customers = loadJSON('customers.json');
  
  // Find the customer
  const customer = customers.find(c => c.userId === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  
  // Check if customer has enough points
  if (!customer.loyaltyPoints || customer.loyaltyPoints < points) {
    return res.status(400).json({ 
      message: 'Insufficient loyalty points for redemption.',
      availablePoints: customer.loyaltyPoints || 0,
      requestedPoints: points
    });
  }
  
  // Get reward values based on type
  const rewardValue = calculateRewardValue(rewardType, points);
  if (!rewardValue) {
    return res.status(400).json({ 
      message: 'Invalid reward type. Valid types include: freeFlight, upgrade, lounge, baggage'
    });
  }
  
  // Create a new redemption record
  const redemptionId = 'RDM-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  const redemption = {
    redemptionId,
    date: new Date().toISOString(),
    pointsRedeemed: points,
    rewardType,
    rewardValue,
    status: 'Processed'
  };
  
  // Save the redemption to customer record
  if (!customer.redemptions) {
    customer.redemptions = [];
  }
  customer.redemptions.push(redemption);
  
  // Deduct the points
  customer.loyaltyPoints -= points;
  
  // Save the updated customer data
  saveJSON('customers.json', customers);
  
  return res.status(200).json({
    message: 'Points redeemed successfully.',
    redemption,
    remainingPoints: customer.loyaltyPoints
  });
});

// Helper function to calculate reward value based on points and type
function calculateRewardValue(rewardType, points) {
  switch (rewardType.toLowerCase()) {
    case 'freeflight':
      // Calculate flight value (e.g., 10,000 points = $100 flight)
      return {
        type: 'Flight Credit',
        value: `$${Math.floor(points / 100)}`,
        description: 'Can be applied to any flight purchase'
      };
    case 'upgrade':
      // Cabin upgrade
      return {
        type: 'Cabin Upgrade',
        value: 'One Cabin Class',
        description: 'Upgrade one cabin class on an existing booking'
      };
    case 'lounge':
      // Lounge access
      const days = Math.floor(points / 500);
      return {
        type: 'Lounge Access',
        value: `${days} day${days > 1 ? 's' : ''}`,
        description: 'Access to airport lounges'
      };
    case 'baggage':
      // Extra baggage
      return {
        type: 'Extra Baggage',
        value: `${Math.floor(points / 200)}kg`,
        description: 'Additional baggage allowance on your next flight'
      };
    default:
      return null;
  }
}

// ----------------------------------------------------------------------
// Start the Server
// ----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});