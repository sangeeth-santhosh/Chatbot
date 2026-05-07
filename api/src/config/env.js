import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const defaultClientUrls = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://sangeeth-santhosh.github.io',
];

function parseList(value, fallback) {
  const items = String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: parseList(process.env.CLIENT_URLS || process.env.CLIENT_URL, defaultClientUrls),
};

const required = ['mongoUri', 'jwtSecret'];

for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default env;
