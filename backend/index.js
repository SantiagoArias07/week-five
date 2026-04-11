const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const testRouter = require('./routes/test');
app.use('/api', testRouter);

app.listen(PORT, () => {
  console.log(`WeekFive server running on http://localhost:${PORT}`);
});
