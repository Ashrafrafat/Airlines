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

const app = express();
const PORT = process.env.PORT || 3000;

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
    this.availableSeats = []; // array of Seat objects (if using the Seat class)
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

// ----------------------------------------------------------------------
// EXAMPLE: Flight and LoyaltyProgram Endpoints (CRUD-like)
// ----------------------------------------------------------------------
// POST /flights - Add a Flight
app.post('/flights', (req, res) => {
  const flightData = loadJSON('flights.json');
  const { flightNumber, departureTime, arrivalTime, origin, destination, price, airline, availableSeats } = req.body;

  // Check if the flight number already exists
  const existingFlight = flightData.find(flight => flight.flightNumber === flightNumber);
  if (existingFlight) {
    return res.status(400).json({ message: 'Flight number must be unique. This flight number already exists.' });
  }
  
  // Check if departure is before arrival
  const depTime = new Date(departureTime);
  const arrTime = new Date(arrivalTime);
  if (depTime >= arrTime) {
    return res.status(400).json({ message: 'Flight departure time must be before arrival time.' });
  }

  // Validate available seats if provided
  if (availableSeats && Array.isArray(availableSeats)) {
    // Check for duplicate seat numbers
    const seatNumbers = availableSeats.map(seat => seat.seatNumber);
    const uniqueSeatNumbers = new Set(seatNumbers);
    if (uniqueSeatNumbers.size !== seatNumbers.length) {
      return res.status(400).json({ message: 'Duplicate seats are not allowed in a flight.' });
    }
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

  // Check if the seat is already occupied
  if (seat.isOccupied) {
    return res.status(400).json({ message: 'Seat is already occupied.' });
  }

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
// CUSTOMER: Book a Flight
// ------------------------------
app.post('/customer/:customerId/bookFlight', (req, res) => {
  const { customerId } = req.params;
  const { flightNumber } = req.body;

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

  // Check if the customer has already booked this flight
  if (customer.bookings.includes(flightNumber)) {
    return res.status(400).json({ message: 'You have already booked this flight.' });
  }

  // Add the flight to the customer's bookings
  customer.bookings.push(flightNumber);
  
  // Save the updated customer data
  saveJSON('customers.json', customers);

  return res.status(200).json({
    message: 'Flight booked successfully.',
    flight,
  });
});
// ------------------------------
// CUSTOMER: Payment for Booked Flight
// ------------------------------
app.post('/customer/:customerId/payment', (req, res) => {
  const { customerId } = req.params;
  const { flightNumber, paymentAmount, transactionId } = req.body;

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

  // Check if the customer has already booked the flight
  if (!customer.bookings.includes(flightNumber)) {
    return res.status(400).json({ message: 'You have not booked this flight yet.' });
  }

  // Validate payment amount
  if (paymentAmount !== flight.price) {
    return res.status(400).json({ message: 'Payment amount must be equal to the total flight cost.' });
  }

  // Validate transaction ID (you can add further validation for transaction format or uniqueness if needed)
  if (!transactionId || transactionId.trim() === '') {
    return res.status(400).json({ message: 'Invalid transaction ID.' });
  }

  // Add payment details to the customer
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

  // Save the updated customer data
  saveJSON('customers.json', customers);

  return res.status(200).json({
    message: 'Payment successful.',
    paymentDetails,
  });
});

// ----------------------------------------------------------------------
// Start the Server
// ----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
