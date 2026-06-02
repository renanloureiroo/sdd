import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

const app = createApp();

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
