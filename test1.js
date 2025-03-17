const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb+srv://ashrafuddinrafat:ashrafuddinrafat@cluster0.pq8jro5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a new MongoClient with SSL/TLS options
const client = new MongoClient(uri, {
    tls: true, // Enable TLS/SSL
    tlsAllowInvalidCertificates: false, // Do not allow invalid certificates
    // If you require a CA certificate, update the path below to point to your certificate file.
    // For example: tlsCAFile: 'D:/Concordia/Winter 2025/Model Driven/Project/certs/ca-certificate.pem'
    // Otherwise, remove the tlsCAFile option.
    // tlsCAFile: `path/to/ca-certificate.pem`,
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // Specify the database and collection
        const database = client.db('Cluster0'); // Database name
        const collection = database.collection('sample_analytics'); // Collection name

        // Perform a simple query (e.g., find the first document in the collection)
        const result = await collection.findOne({});
        console.log("First document in the collection:", result);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);
