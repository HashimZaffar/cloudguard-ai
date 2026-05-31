// Load environment variables from a .env file when one exists.
// Example: PORT=5001
require("dotenv").config();

const app = require("./app");

// Use the PORT from the environment, or fall back to 5001 for local learning.
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});

