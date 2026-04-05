import express from "express";
import cors from "cors";
import practiceRouter from "./routes/practice";
import competitionRouter from "./routes/competition";

const app = express();
const port = process.env.PORT || 9091;

// CORS Configuration
app.use(cors({
  origin: [
    'https://english-translation-app.pages.dev',
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://192.168.1.*:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers for OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Practice routes
app.use('/api/v1/practice', practiceRouter);

// Competition routes
app.use('/api/v1/competition', competitionRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
