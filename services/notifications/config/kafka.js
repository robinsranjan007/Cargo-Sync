import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER]
});

export const consumer = kafka.consumer({ 
  groupId: 'notification-group' 
});

export default kafka;