import express, { Request, Response } from 'express';
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
