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
// Customer: Book Flight (UPDATED)
// ------------------------------
async function customerBookFlight() {
  console.log("\n-- Customer: Book Flight --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  const flightNumber = await askQuestion("Enter flight number to book: ");

  // Prompt for optional fields
  const seatSelection = await askQuestion("Enter seat selection (optional): ");
  const mealSelection = await askQuestion("Enter meal selection (optional): ");
  const baggageSelection = await askQuestion("Enter baggage selection (optional): ");
  const specialRequest = await askQuestion("Enter any special request (optional): ");

  // Build the body based on user input
  const bookingData = {
    flightNumber: flightNumber.trim()
  };

  if (seatSelection.trim()) {
    bookingData.seatSelection = seatSelection.trim();
  }
  if (mealSelection.trim()) {
    bookingData.mealSelection = mealSelection.trim();
  }
  if (baggageSelection.trim()) {
    bookingData.baggageSelection = baggageSelection.trim();
  }
  if (specialRequest.trim()) {
    bookingData.specialRequest = specialRequest.trim();
  }

  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/bookFlight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
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
// Customer: Cancel Booking and Request Refund
// ------------------------------
async function customerCancelBooking() {
  console.log("\n-- Customer: Cancel Booking and Request Refund --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  const bookingId = await askQuestion("Enter booking ID to cancel: ");
  const reason = await askQuestion("Enter reason for cancellation (optional): ");
  
  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/booking/${bookingId.trim()}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: reason.trim()
      })
    });
    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error cancelling booking:", error);
  }
}

// ------------------------------
// Customer: View and Manage Past Bookings
// ------------------------------
async function customerViewBookings() {
  console.log("\n-- Customer: View and Manage Past Bookings --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  
  // Optional filters
  console.log("\nFiltering options (leave blank to skip):");
  const status = await askQuestion("Filter by status (Active/Cancelled): ");
  const sortBy = await askQuestion("Sort by (date/flight/status): ");
  
  // Build query parameters
  let url = `${BASE_URL}/customer/${customerId.trim()}/bookings`;
  const params = [];
  
  if (status.trim()) {
    params.push(`status=${encodeURIComponent(status.trim())}`);
  }
  
  if (sortBy.trim()) {
    params.push(`sortBy=${encodeURIComponent(sortBy.trim())}`);
  }
  
  if (params.length > 0) {
    url += "?" + params.join("&");
  }
  
  try {
    console.log(`\nFetching bookings from: ${url}`);
    console.log("BASE_URL =", BASE_URL);
    
    // Print current time for debugging
    console.log("Request time:", new Date().toISOString());
    
    const response = await fetch(url);
    
    // Check if the response is OK and contains JSON
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      console.error(`Server returned error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
      console.log("\nTROUBLESHOOTING TIPS:");
      console.log("1. Make sure the server is running");
      console.log("2. Check if the endpoint URL is correct");
      console.log("3. Verify your customer ID exists in the database");
      console.log("4. Try restarting the server");
      return;
    }
    
    const result = await response.json();
    console.log("Response received:", JSON.stringify(result.message));
    
    if (result.bookings && result.bookings.length > 0) {
      console.log("\n===== Your Bookings =====");
      result.bookings.forEach((booking, index) => {
        console.log(`\n[Booking ${index + 1}]`);
        
        // Display booking ID if available
        if (booking.bookingId) {
          console.log(`Booking ID: ${booking.bookingId}`);
        }
        
        console.log(`Flight Number: ${booking.flightNumber}`);
        console.log(`Status: ${booking.status || 'Active'}`);
        
        // Display booking date if available
        if (booking.bookingDate && booking.bookingDate !== 'Unknown') {
          console.log(`Booking Date: ${new Date(booking.bookingDate).toLocaleString()}`);
        }
        
        // Display seat information if available
        if (booking.seat && booking.seat.seatNumber) {
          console.log(`Seat: ${booking.seat.seatNumber} (${booking.seat.class})`);
        } else if (booking.seatNumber) {
          console.log(`Seat: ${booking.seatNumber}`);
        }
        
        // Display flight details if available
        if (booking.flightDetails) {
          console.log("\nFlight Details:");
          console.log(`  ${booking.flightDetails.origin} → ${booking.flightDetails.destination}`);
          console.log(`  Departure: ${new Date(booking.flightDetails.departureTime).toLocaleString()}`);
          console.log(`  Arrival: ${new Date(booking.flightDetails.arrivalTime).toLocaleString()}`);
          console.log(`  Airline: ${booking.flightDetails.airline}`);
          console.log(`  Price: $${booking.flightDetails.price}`);
        }
        
        // Display cancellation info if booking is cancelled
        if (booking.status === 'Cancelled' && booking.cancellationDate) {
          console.log(`\nCancelled on: ${new Date(booking.cancellationDate).toLocaleString()}`);
        }
        
        console.log("------------------------");
      });
      
      // Offer booking management options
      const manageOption = await askQuestion("\nDo you want to manage a booking? (yes/no): ");
      if (manageOption.trim().toLowerCase() === 'yes') {
        const bookingAction = await askQuestion("Enter action (cancel): ");
        if (bookingAction.trim().toLowerCase() === 'cancel') {
          await customerCancelBooking();
        } else {
          console.log("Invalid action.");
        }
      }
    } else {
      console.log("No bookings found.");
    }
  } catch (error) {
    console.error("\nERROR DETAILS:");
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.log("\nPlease make sure the server is running and try again.");
  }
}

// ------------------------------
// Customer: Join Loyalty Program
// ------------------------------
async function customerJoinLoyaltyProgram() {
  console.log("\n-- Customer: Join Loyalty Program --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  
  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/joinLoyaltyProgram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const result = await response.json();
    
    if (response.ok) {
      console.log("\n=== Loyalty Program Enrollment ===");
      console.log(`Status: ${result.message}`);
      console.log(`Current Tier: ${result.loyaltyProgram.level}`);
      console.log(`Date Joined: ${new Date(result.loyaltyProgram.dateJoined).toLocaleString()}`);
      console.log(`Points Per Dollar: ${result.loyaltyProgram.pointsPerDollar}`);
      console.log("\nUpgrade Path:");
      result.loyaltyProgram.upgradePath.forEach(tier => {
        console.log(`- ${tier.level}: $${tier.threshold}+ in spending`);
      });
    } else {
      console.log("Response:", result);
    }
  } catch (error) {
    console.error("Error joining loyalty program:", error);
  }
}

// ------------------------------
// Customer: Check Loyalty Status
// ------------------------------
async function customerCheckLoyaltyStatus() {
  console.log("\n-- Customer: Check Loyalty Status --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  
  try {
    const response = await fetch(`${BASE_URL}/customer/${customerId.trim()}/loyaltyStatus`);
    const result = await response.json();
    
    if (response.ok) {
      console.log("\n=== Your Loyalty Status ===");
      console.log(`Current Tier: ${result.loyaltyProgram.level}`);
      console.log(`Current Points: ${result.loyaltyPoints}`);
      console.log(`Total Spent: $${result.totalSpent.toFixed(2)}`);
      console.log(`Earning Rate: ${result.loyaltyProgram.pointsPerDollar} points per dollar`);
      
      // Calculate tier progress
      const currentTier = result.loyaltyProgram.level;
      const nextTierInfo = getNextTierInfo(currentTier, result.totalSpent);
      
      if (nextTierInfo) {
        const remaining = nextTierInfo.threshold - result.totalSpent;
        console.log(`\nProgress to ${nextTierInfo.level}: $${remaining.toFixed(2)} more spending needed`);
        const progressPercent = Math.min(100, Math.floor((result.totalSpent / nextTierInfo.threshold) * 100));
        console.log(`[${progressBar(progressPercent)}] ${progressPercent}%`);
      } else {
        console.log("\nCongratulations! You've reached our highest tier level.");
      }
      
      // Display redemption options
      console.log("\nAvailable Redemption Options:");
      console.log("1. Free Flight: 10,000 points = $100 flight credit");
      console.log("2. Cabin Upgrade: 5,000 points");
      console.log("3. Lounge Access: 500 points per day");
      console.log("4. Extra Baggage: 200 points per kg");
    } else {
      console.log("Response:", result);
    }
  } catch (error) {
    console.error("Error checking loyalty status:", error);
  }
}

// Helper function to get next tier information
function getNextTierInfo(currentTier, totalSpent) {
  const tiers = [
    { level: 'Basic', threshold: 0 },
    { level: 'Silver', threshold: 1000 },
    { level: 'Gold', threshold: 1500 },
    { level: 'Platinum', threshold: 2000 }
  ];
  
  const currentTierIndex = tiers.findIndex(tier => tier.level === currentTier);
  if (currentTierIndex < tiers.length - 1) {
    return tiers[currentTierIndex + 1];
  }
  return null; // Already at highest tier
}

// Helper function to create a simple progress bar
function progressBar(percent) {
  const width = 20; // characters
  const completed = Math.floor((percent / 100) * width);
  return '█'.repeat(completed) + '░'.repeat(width - completed);
}

// ------------------------------
// Customer: Redeem Loyalty Points
// ------------------------------
async function customerRedeemPoints() {
  console.log("\n-- Customer: Redeem Loyalty Points --");
  const customerId = await askQuestion("Enter your Customer ID: ");
  
  // First, check current points balance
  try {
    const statusResponse = await fetch(`${BASE_URL}/customer/${customerId.trim()}/loyaltyStatus`);
    const statusResult = await statusResponse.json();
    
    if (!statusResponse.ok) {
      console.log("Error:", statusResult.message);
      return;
    }
    
    const currentPoints = statusResult.loyaltyPoints || 0;
    console.log(`\nYou have ${currentPoints} loyalty points available.`);
    
    if (currentPoints <= 0) {
      console.log("You don't have enough points to redeem any rewards.");
      return;
    }
    
    // Display redemption options
    console.log("\nRedemption Options:");
    console.log("1. Free Flight Credit (100 points = $1)");
    console.log("2. Cabin Upgrade (5,000 points)");
    console.log("3. Lounge Access (500 points per day)");
    console.log("4. Extra Baggage (200 points per kg)");
    
    const option = await askQuestion("\nSelect an option (1-4): ");
    let rewardType;
    let pointsToRedeem;
    
    switch (option.trim()) {
      case "1":
        rewardType = "freeFlight";
        pointsToRedeem = await askQuestion(`Enter points to redeem (max ${currentPoints}): `);
        break;
      case "2":
        rewardType = "upgrade";
        pointsToRedeem = 5000;
        if (currentPoints < pointsToRedeem) {
          console.log(`Not enough points. You need ${pointsToRedeem} points for this reward.`);
          return;
        }
        break;
      case "3":
        rewardType = "lounge";
        const days = await askQuestion("Enter number of days for lounge access: ");
        pointsToRedeem = parseInt(days) * 500;
        if (currentPoints < pointsToRedeem) {
          console.log(`Not enough points. You need ${pointsToRedeem} points for ${days} day(s).`);
          return;
        }
        break;
      case "4":
        rewardType = "baggage";
        const kg = await askQuestion("Enter extra baggage in kg: ");
        pointsToRedeem = parseInt(kg) * 200;
        if (currentPoints < pointsToRedeem) {
          console.log(`Not enough points. You need ${pointsToRedeem} points for ${kg}kg.`);
          return;
        }
        break;
      default:
        console.log("Invalid option selected.");
        return;
    }
    
    // Confirm redemption
    const confirmRedemption = await askQuestion(`\nRedeem ${pointsToRedeem} points for ${rewardType}? (yes/no): `);
    if (confirmRedemption.trim().toLowerCase() !== "yes") {
      console.log("Redemption cancelled.");
      return;
    }
    
    // Process redemption
    const redeemResponse = await fetch(`${BASE_URL}/customer/${customerId.trim()}/redeemPoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pointsToRedeem,
        rewardType
      })
    });
    const redeemResult = await redeemResponse.json();
    
    if (redeemResponse.ok) {
      console.log("\n=== Redemption Successful ===");
      console.log(`Reward: ${redeemResult.redemption.rewardValue.type}`);
      console.log(`Value: ${redeemResult.redemption.rewardValue.value}`);
      console.log(`Description: ${redeemResult.redemption.rewardValue.description}`);
      console.log(`Points Used: ${redeemResult.redemption.pointsRedeemed}`);
      console.log(`Remaining Points: ${redeemResult.remainingPoints}`);
      console.log(`Status: ${redeemResult.redemption.status}`);
      console.log(`Redemption ID: ${redeemResult.redemption.redemptionId}`);
    } else {
      console.log("Redemption failed:", redeemResult.message);
    }
  } catch (error) {
    console.error("Error redeeming points:", error);
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
    console.log("15. Customer: Cancel Booking");
    console.log("16. Customer: View Bookings");
    console.log("17. Customer: Join Loyalty Program");
    console.log("18. Customer: Check Loyalty Status");
    console.log("19. Customer: Redeem Points");
    console.log("20. Exit");

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
        await customerCancelBooking();
        break;
      case "16":
        await customerViewBookings();
        break;
      case "17":
        await customerJoinLoyaltyProgram();
        break;
      case "18":
        await customerCheckLoyaltyStatus();
        break;
      case "19":
        await customerRedeemPoints();
        break;
      case "20":
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
