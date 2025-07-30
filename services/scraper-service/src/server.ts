import { connectProducer, sendMessage } from './kafkaProducer';
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.post('/api/scraper', async (req: Request, res: Response) => {
  console.log('Received scraping job:', req.body);

  try {
    await sendMessage('html-to-process', req.body);
    res.status(202).json({ message: 'Scraping job accepted' });
  } catch (error) {
    console.error('Failed to submit scraping job', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper Service listening on port ${PORT}`);
});
