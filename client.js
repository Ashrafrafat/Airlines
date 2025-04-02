/**
 * cliClient.js
 *
 * A command-line interface for the Airline Booking System.
 * This client interacts with the backend endpoints for:
 * - Customer registration and login
 * - Admin registration and login
 * - Admin management of flights and loyalty programs
 * - Viewing and adding flights and loyalty programs
 *
 * To run:
 *   node cliClient.js
 *
 * Note: This example uses the global fetch API (Node 18+).
 */

const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask a question and return a Promise for the answer
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Base URL for backend endpoints
const BASE_URL = "http://localhost:3000";

// ------------------------------
// Customer Functions
// ------------------------------
async function customerRegistration() {
  console.log("\n-- Customer Registration --");
  const name = await askQuestion("Enter name: ");
  const email = await askQuestion("Enter email: ");
  const password = await askQuestion("Enter password: ");
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password: password.trim() })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Customer registration error:", error);
  }
}

async function customerLogin() {
  console.log("\n-- Customer Login --");
  const email = await askQuestion("Enter email: ");
  const password = await askQuestion("Enter password: ");
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim() })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Customer login error:", error);
  }
}

// ------------------------------
// Admin Functions
// ------------------------------
async function adminRegistration() {
  console.log("\n-- Admin Registration --");
  const name = await askQuestion("Enter name: ");
  const email = await askQuestion("Enter email: ");
  const password = await askQuestion("Enter password: ");
  
  try {
    const response = await fetch(`${BASE_URL}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password: password.trim() })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Admin registration error:", error);
  }
}

async function adminLogin() {
  console.log("\n-- Admin Login --");
  const email = await askQuestion("Enter email: ");
  const password = await askQuestion("Enter password: ");
  
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim() })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Admin login error:", error);
  }
}

async function adminManageFlights() {
  console.log("\n-- Admin: Manage Flights --");
  const adminId = await askQuestion("Enter your Admin ID: ");
  // Enter flight IDs or flight objects as comma-separated values (e.g., "FL001,FL002")
  const flightsInput = await askQuestion("Enter flight IDs (comma-separated): ");
  const flights = flightsInput.split(",").map(flight => flight.trim()).filter(flight => flight !== "");
  
  try {
    const response = await fetch(`${BASE_URL}/admin/${adminId.trim()}/manageFlights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flights })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error managing flights:", error);
  }
}

async function adminManageLoyaltyPrograms() {
  console.log("\n-- Admin: Manage Loyalty Programs --");
  const adminId = await askQuestion("Enter your Admin ID: ");
  // Enter loyalty program IDs as comma-separated values (e.g., "LP001,LP002")
  const programsInput = await askQuestion("Enter loyalty program IDs (comma-separated): ");
  const loyaltyPrograms = programsInput.split(",").map(prog => prog.trim()).filter(prog => prog !== "");
  
  try {
    const response = await fetch(`${BASE_URL}/admin/${adminId.trim()}/manageLoyaltyPrograms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loyaltyPrograms })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error managing loyalty programs:", error);
  }
}

// ------------------------------
// Flight and LoyaltyProgram Functions
// ------------------------------
async function getFlights() {
  console.log("\n-- Get Flights --");
  try {
    const response = await fetch(`${BASE_URL}/flights`);
    const result = await response.json();
    console.log("Flights:", result);
  } catch (error) {
    console.error("Error getting flights:", error);
  }
}

async function addFlight() {
  console.log("\n-- Add Flight --");
  const flightNumber = await askQuestion("Enter flight number: ");
  const departureTime = await askQuestion("Enter departure time (ISO format): ");
  const arrivalTime = await askQuestion("Enter arrival time (ISO format): ");
  const origin = await askQuestion("Enter origin: ");
  const destination = await askQuestion("Enter destination: ");
  const price = await askQuestion("Enter price: ");
  const airline = await askQuestion("Enter airline: ");
  
  // Prompt for available seats information
  let availableSeats = [];
  const addSeats = await askQuestion("Would you like to add available seats? (yes/no): ");
  if (addSeats.trim().toLowerCase() === "yes") {
    let numSeats = await askQuestion("Enter number of seats to add: ");
    numSeats = parseInt(numSeats);
    for (let i = 0; i < numSeats; i++) {
      const seatNumber = await askQuestion(`Enter seat number for seat ${i + 1}: `);
      const seatClass = await askQuestion(`Enter seat class for seat ${i + 1} (e.g., Economy, Business, First): `);
      const isOccupiedInput = await askQuestion(`Is seat ${i + 1} occupied? (yes/no): `);
      const isOccupied = isOccupiedInput.trim().toLowerCase() === "yes";
      availableSeats.push({
        seatNumber: seatNumber.trim(),
        class: seatClass.trim(),
        isOccupied
      });
    }
  }

  const newFlight = {
    flightNumber: flightNumber.trim(),
    departureTime: departureTime.trim(),
    arrivalTime: arrivalTime.trim(),
    origin: origin.trim(),
    destination: destination.trim(),
    price: parseFloat(price),
    airline: airline.trim(),
    availableSeats // includes seat details if provided
  };

  try {
    const response = await fetch(`${BASE_URL}/flights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFlight)
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error adding flight:", error);
  }
}

async function getLoyaltyPrograms() {
  console.log("\n-- Get Loyalty Programs --");
  try {
    const response = await fetch(`${BASE_URL}/loyaltyPrograms`);
    const result = await response.json();
    console.log("Loyalty Programs:", result);
  } catch (error) {
    console.error("Error getting loyalty programs:", error);
  }
}

async function addLoyaltyProgram() {
  console.log("\n-- Add Loyalty Program --");
  const programId = await askQuestion("Enter program ID: ");
  const programName = await askQuestion("Enter program name: ");
  const pointsPerDollar = await askQuestion("Enter points per dollar: ");
  const tier = await askQuestion("Enter tier (e.g., Silver, Gold, Platinum): ");
  const activeInput = await askQuestion("Is the program active? (true/false): ");
  const validTill = await askQuestion("Enter valid till date (ISO format): ");
  
  const newProgram = {
    programId: programId.trim(),
    programName: programName.trim(),
    pointsPerDollar: parseInt(pointsPerDollar),
    tier: tier.trim(),
    active: activeInput.trim().toLowerCase() === "true",
    validTill: validTill.trim()
  };

  try {
    const response = await fetch(`${BASE_URL}/loyaltyPrograms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProgram)
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error adding loyalty program:", error);
  }
}
async function getFlightsWithFilter() {
  console.log("\n-- Get Flights (Filter by Origin & Destination) --");
  const origin = await askQuestion("Enter origin (leave blank if none): ");
  const destination = await askQuestion("Enter destination (leave blank if none): ");

  let url = `${BASE_URL}/flights`;
  const params = [];

  if (origin.trim()) {
    params.push(`origin=${encodeURIComponent(origin.trim())}`);
  }
  if (destination.trim()) {
    params.push(`destination=${encodeURIComponent(destination.trim())}`);
  }

  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  try {
    const response = await fetch(url);
    const result = await response.json();
    console.log("Filtered Flights:", result);
  } catch (error) {
    console.error("Error fetching flights with filter:", error);
  }
}
// ------------------------------
// Customer: Book Flight
// ------------------------------
async function customerBookFlight() {
  console.log("\n-- Customer: Book Flight --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  const flightNumber = await askQuestion("Enter flight number to book: ");

  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/bookFlight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightNumber: flightNumber.trim() })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error booking flight:", error);
  }
}

// ------------------------------
// Customer: Provide Payment (UPDATED)
// ------------------------------
async function customerProvidePayment() {
  const customerId = await askQuestion("Enter your Customer ID: ");
  const flightNumber = await askQuestion("Enter flight number you want to pay for: ");
  const paymentAmount = await askQuestion("Enter payment amount (must match flight cost): ");
  const creditCardNumber = await askQuestion("Enter credit card number (12 digits): ");
  const cvv = await askQuestion("Enter CVV (3 digits): ");

  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flightNumber: flightNumber.trim(),
        paymentAmount: parseFloat(paymentAmount.trim()),
        creditCardNumber: creditCardNumber.trim(),
        cvv: cvv.trim()
      })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error processing payment:", error);
  }
}

// ------------------------------
// Customer: Book a Seat in a Flight
// ------------------------------
async function customerBookSeat() {
  console.log("\n-- Customer: Book Seat --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  const flightNumber = await askQuestion("Enter flight number: ");
  const seatNumber = await askQuestion("Enter seat number you want to book: ");
  
  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/bookSeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flightNumber: flightNumber.trim(),
        seatNumber: seatNumber.trim()
      })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error booking seat:", error);
  }
}




// ------------------------------
// Main Interactive Menu
// ------------------------------
async function main() {
  while (true) {
    console.log("\n=== Airline Booking CLI ===");
    console.log("1. Customer Registration");
    console.log("2. Customer Login");
    console.log("3. Admin Registration");
    console.log("4. Admin Login");
    console.log("5. Admin: Manage Flights");
    console.log("6. Admin: Manage Loyalty Programs");
    console.log("7. Get Flights");
    console.log("8. Add Flight");
    console.log("9. Get Loyalty Programs");
    console.log("10. Add Loyalty Program");
    console.log("11. Customer: Book Flight");
    console.log("12. Customer: Provide Payment");
    console.log("13. Customer: Book Seat");
    console.log("14. Get Flights with Filter");
    console.log("15. Exit");

    const choice = await askQuestion("Enter your choice: ");
    switch (choice.trim()) {
      case "1":
        await customerRegistration();
        break;
      case "2":
        await customerLogin();
        break;
      case "3":
        await adminRegistration();
        break;
      case "4":
        await adminLogin();
        break;
      case "5":
        await adminManageFlights();
        break;
      case "6":
        await adminManageLoyaltyPrograms();
        break;
      case "7":
        await getFlights();
        break;
      case "8":
        await addFlight();
        break;
      case "9":
        await getLoyaltyPrograms();
        break;
      case "10":
        await addLoyaltyProgram();
        break;
      case "11":
        await customerBookFlight();
        break;
      case "12":
        await customerProvidePayment();
        break;
      case "13":
        await customerBookSeat();
        break;
      case "14":
        await getFlightsWithFilter();
        break;
      case "15":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
      default:
        console.log("Invalid option. Please try again.");
    }
  }
}

// Start the CLI client
main();
