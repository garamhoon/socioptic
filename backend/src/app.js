import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Socioptic API');
});

app.listen(port, () => {
  console.log(`Socioptic backend is running on port ${port}`);
});
