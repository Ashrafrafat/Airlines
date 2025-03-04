/******************************************************
 * Test.JS
 
 ******************************************************/

const assert = require('assert');
const {
  User,
  Admin,
  Customer,
  Flight,
  Seat,
  Booking,
  Ticket,
  Meal,
  SpecialRequest,
  Payment,
  LoyaltyProgram
} = require('./backend');

//
// 1. Test creation of a Customer, LoyaltyProgram, & Admin
//
(function testUsers() {
  const lp = new LoyaltyProgram(
    "LP001", 
    "Frequent Flyer", 
    2, 
    "Gold", 
    "Yes", 
    "2025-12-31"
  );

  const cust = new Customer(
    "C001",
    "Alice",
    "alice@example.com",
    "secret",
    100,
    lp
  );

  const admin = new Admin(
    "A001",
    "Bob (Admin)",
    "adminbob@example.com",
    "adminpass"
  );

  // Basic checks with assert
  assert.strictEqual(cust.name, "Alice");
  assert.strictEqual(cust.loyaltyProgram.programName, "Frequent Flyer");
  assert.strictEqual(admin.email, "adminbob@example.com");

  // Print out info
  console.log("testUsers: Customer:", cust);
  console.log("testUsers: Admin:", admin);

  console.log("testUsers passed ✅");
  console.log("----------------------------------------\n");
})();

//
// 2. Test adding flights to an Admin
//
(function testAdminFlights() {
  const admin = new Admin("ADM123", "AdminGuy", "admin@gov.org", "pass");
  const flight1 = new Flight("F001", "2025-01-01 10:00", "2025-01-01 12:00", "LAX", "SFO", 100, "AirExample");
  const flight2 = new Flight("F002", "2025-01-02 09:00", "2025-01-02 11:30", "SFO", "LAX", 120, "AirExample");

  admin.manageFlights([flight1, flight2]);
  assert.strictEqual(admin.flights.length, 2);
  assert.strictEqual(admin.flights[0].flightNumber, "F001");

  // Print out info
  console.log("testAdminFlights: Admin flights:", admin.flights);

  console.log("testAdminFlights passed ✅");
  console.log("----------------------------------------\n");
})();

//
// 3. Test creating a Booking with multiple Flights, Meals, and SpecialRequests
//
(function testBooking() {
  const cust = new Customer("C002", "Charlie", "charlie@test.com", "pass123");
  const payment = new Payment("PAY001", 300, "Completed", "CreditCard", "TXN123");

  const booking = new Booking("B001", cust, "2025-01-01", "Confirmed", payment);

  // Add flights
  const flight1 = new Flight("F100", "2025-03-10 09:00", "2025-03-10 13:00", "NYC", "LAX", 200, "AirXYZ");
  const flight2 = new Flight("F101", "2025-03-12 09:00", "2025-03-12 13:00", "LAX", "NYC", 200, "AirXYZ");
  booking.addFlight(flight1);
  booking.addFlight(flight2);

  // Add Meals
  const meal1 = new Meal("Vegetarian");
  const meal2 = new Meal("Halal");
  booking.addMeal(meal1);
  booking.addMeal(meal2);

  // Add Special Requests
  const sr1 = new SpecialRequest("Wheelchair", "Need assistance boarding", "Pending");
  const sr2 = new SpecialRequest("SeatUpgrade", "Request upgrade to business", "Pending");
  booking.addSpecialRequest(sr1);
  booking.addSpecialRequest(sr2);

  // Link booking back to the customer
  cust.addBooking(booking);

  // Basic checks
  assert.strictEqual(booking.flights.length, 2);
  assert.strictEqual(booking.meals.length, 2);
  assert.strictEqual(booking.specialRequests.length, 2);
  assert.strictEqual(booking.customer.name, "Charlie");
  assert.strictEqual(cust.bookings[0], booking);

  // Create a custom replacer to handle circular references when converting to JSON
  function circularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  }

  // Print out the booking using our custom replacer
  console.log(
    "testBooking: Booking object:\n",
    JSON.stringify(booking, circularReplacer(), 2)
  );

  // Also print out the Customer's bookings
  console.log(
    "testBooking: Customer's bookings:\n",
    JSON.stringify(cust.bookings, circularReplacer(), 2)
  );

  console.log("testBooking passed ✅");
  console.log("----------------------------------------\n");
})();

//
// 4. Test seat associations
//
(function testSeatsOnFlight() {
  const flight = new Flight("X999", "2025-05-20 08:00", "2025-05-20 10:30", "ORD", "MIA", 150, "RandomAir");
  const seatA = new Seat("12A", "Economy", false);
  const seatB = new Seat("12B", "Economy", false);

  flight.addSeat(seatA);
  flight.addSeat(seatB);

  assert.strictEqual(flight.availableSeats.length, 2);
  assert.strictEqual(flight.availableSeats[0].seatNumber, "12A");

  // Print out info
  console.log("testSeatsOnFlight: Flight seats:", flight.availableSeats);

  console.log("testSeatsOnFlight passed ✅");
  console.log("----------------------------------------\n");
})();

//
// 5. Test Ticket linking to a Booking
//
(function testTicket() {
  const cust = new Customer("C003", "Diana", "diana@example.com", "password");
  const booking = new Booking("B002", cust, "2025-06-01", "Confirmed");

  const ticket = new Ticket("TKT001", "http://example.com/boardingpass", booking);

  assert.strictEqual(ticket.booking, booking);
  assert.strictEqual(ticket.ticketId, "TKT001");

  // Print out info
  console.log("testTicket: Ticket object:", ticket);

  console.log("testTicket passed ✅");
  console.log("----------------------------------------\n");
})();

console.log("All tests completed successfully!");
