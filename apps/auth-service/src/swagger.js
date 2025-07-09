import swaggerAutogen from "swagger-autogen";

// Swagger documentation configuration object
const doc = {
  info: {
    title: "Auth Service API",
    description:
      "Automatically generated Swagger docs for authentication microservice",
    version: "1.0.0",
  },
  host: "localhost:6001",
  basePath: "", // root path
  schemes: ["http"], // use ['https'] if you secure it later
};

// Output file where the generated Swagger JSON will be stored
const outputFile = "./swagger-output.json";

// Files where swagger-autogen will scan for endpoints & comments
// Can use wildcards to include multiple route files if needed
const endpointsFiles = ["./routes/auth.route.ts"];

// Generate the swagger file
swaggerAutogen()(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log("✅ Swagger documentation has been generated successfully.");
  })
  .catch((err) => {
    console.error("❌ Failed to generate Swagger docs:", err);
  });
