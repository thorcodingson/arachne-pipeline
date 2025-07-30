import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'scraper-service',
  brokers: ['arachne-cluster-kafka-bootstrap.kafka.svc:9092'],
});

const producer: Producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log('Kafka Producer connected (scraper-service)');
};

export const sendMessage = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error('Could not send message to Kafka', error);
  }
};
