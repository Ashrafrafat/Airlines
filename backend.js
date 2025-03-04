/******************************************************
 * BACKEND.JS
 *
 * This file implements the classes and associations 
 * from the airline-booking UML diagram. 
 ******************************************************/

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
    // We'll store them in arrays:
    this.flights = [];
    this.loyaltyPrograms = [];
  }

  manageFlights(flights) {
    // For simplicity, this method replaces the entire flights array
    this.flights = flights;
  }

  manageLoyaltyPrograms(loyaltyPrograms) {
    // Similarly, replace the entire loyaltyPrograms array
    this.loyaltyPrograms = loyaltyPrograms;
  }
}

// ================ CLASS: LoyaltyProgram =================
class LoyaltyProgram {
  constructor(programId, programName, pointsPerDollar, tier, active, validTill) {
    this.programId = programId;
    this.programName = programName;
    this.pointsPerDollar = pointsPerDollar;
    this.tier = tier;           // e.g. Silver/Gold/Platinum
    this.active = active;       // e.g. "Yes"/"No" or boolean
    this.validTill = validTill; // a Date or date-time string
  }
}

// ================ CLASS: Customer ==================
// (Customer is also conceptually a specialized User)
class Customer extends User {
  constructor(userId, name, email, password, loyaltyPoints = 0, loyaltyProgram = null) {
    super(userId, name, email, password);
    this.loyaltyPoints = loyaltyPoints;
    this.loyaltyProgram = loyaltyProgram;  // single LoyaltyProgram
    this.bookings = [];                    // array of Booking objects
  }

  addBooking(booking) {
    this.bookings.push(booking);
  }
}

// ================ CLASS: Seat ==================
class Seat {
  constructor(seatNumber, seatClass, isOccupied = false) {
    this.seatNumber = seatNumber;
    this.class = seatClass;     // e.g. "Economy", "Business", "First"
    this.isOccupied = isOccupied;
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

    // Diagram shows flight has an array of seats
    this.availableSeats = [];
  }

  addSeat(seat) {
    this.availableSeats.push(seat);
  }
}

// ================ CLASS: Meal ==================
class Meal {
  constructor(mealType) {
    this.mealType = mealType; // e.g. "Vegetarian", "Standard", etc.
  }
}

// ================ CLASS: SpecialRequest ==================
class SpecialRequest {
  constructor(requestType, note, status) {
    this.requestType = requestType;  // e.g. "Wheelchair", "Extra Luggage"
    this.note = note;
    this.status = status;            // e.g. "Pending", "Approved", "Denied"
  }
}

// ================ CLASS: Payment ==================
class Payment {
  constructor(paymentId, amount, status, method, transactionId) {
    this.paymentId = paymentId;
    this.amount = amount;
    this.status = status;     // e.g. "Completed", "Pending"
    this.method = method;     // e.g. "CreditCard", "PayPal"
    this.transactionId = transactionId;
  }
}

// ================ CLASS: Booking ==================
class Booking {
  constructor(bookingId, customer, bookingDate, status, paymentInfo = null) {
    this.bookingId = bookingId;
    this.customer = customer;        // one Customer
    this.bookingDate = bookingDate;  // Date or string
    this.status = status;            // e.g. "Confirmed", "Cancelled"
    this.paymentInfo = paymentInfo;  // one Payment

    // Diagram shows a booking can include multiple flights, meals, special requests
    this.flights = [];
    this.meals = [];
    this.specialRequests = [];
  }

  addFlight(flight) {
    this.flights.push(flight);
  }

  addMeal(meal) {
    this.meals.push(meal);
  }

  addSpecialRequest(specialRequest) {
    this.specialRequests.push(specialRequest);
  }
}

// ================ CLASS: Ticket ==================
class Ticket {
  constructor(ticketId, boardingPassUrl, booking) {
    this.ticketId = ticketId;
    this.boardingPassUrl = boardingPassUrl;
    this.booking = booking; // references a Booking
  }
}

// Export all classes so we can require() them in client.js
module.exports = {
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
};
