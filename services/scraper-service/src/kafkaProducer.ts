import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'scraper-service',
  brokers: ['arachne-cluster-kafka-bootstrap.kafka.svc:9092'],
});

const producer: Producer = kafka.producer();

let isConnected = false;

export const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('Kafka Producer connected (scraper-service)');
  }
};

export const disconnectProducer = async () => {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
    console.log('Kafka Producer disconnected');
  }
};

export const sendMessage = async (topic: string, message: any) => {
  if (!isConnected) {
    throw new Error('Producer is not connected to Kafka');
  }

  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}`);
  } catch (error) {
    console.error('Could not send message to Kafka', error);
    throw error;
  }
};

process.on('SIGTERM', async () => {
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disconnectProducer();
  process.exit(0);
});
