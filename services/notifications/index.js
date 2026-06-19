import 'dotenv/config';
import { consumer } from './config/kafka.js';
import { sendEmail } from './config/email.js';

const emailTemplates = {
  load_created: (data) => ({
    subject: `Rate Confirmation — Load ${data.loadNumber}`,
    html: `
      <h2>Rate Confirmation</h2>
      <p>Dear ${data.carrier?.name || 'Carrier'},</p>
      <p>You have been assigned to load <strong>${data.loadNumber}</strong>.</p>
      <p><strong>Route:</strong> ${data.pickup?.city} → ${data.delivery?.city}</p>
      <p><strong>Rate:</strong> $${data.rate?.amount} ${data.rate?.currency}</p>
      <p><strong>Pickup:</strong> ${data.pickup?.address}, ${data.pickup?.city}</p>
      <p><strong>Delivery:</strong> ${data.delivery?.address}, ${data.delivery?.city}</p>
      <br/>
      <p>Please confirm your acceptance.</p>
      <p>CargoSync Team</p>
    `
  }),

  geofence_entered: (data) => ({
    subject: `Load Update — Truck arrived at ${data.location}`,
    html: `
      <h2>Location Update</h2>
      <p>Your shipment has arrived at <strong>${data.location}</strong>.</p>
      <p><strong>Load ID:</strong> ${data.loadId}</p>
      <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <br/>
      <p>CargoSync Team</p>
    `
  }),

  load_delivered: (data) => ({
    subject: `Delivered — Load ${data.loadNumber}`,
    html: `
      <h2>Delivery Confirmation</h2>
      <p>Load <strong>${data.loadNumber}</strong> has been delivered.</p>
      <p><strong>Delivered at:</strong> ${new Date().toLocaleString()}</p>
      <br/>
      <p>CargoSync Team</p>
    `
  })
};

const run = async () => {
  await consumer.connect();
  console.log('Kafka consumer connected');

  await consumer.subscribe({
    topics: ['load.created', 'geofence_entered', 'load.delivered'],
    fromBeginning: false
  });

  console.log('Subscribed to Kafka topics');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        console.log(`Received event: ${topic}`);
        console.log('Data:', data);

        const template = emailTemplates[topic.replace('.', '_')];

        if (!template) {
          console.log(`No template for topic: ${topic}`);
          return;
        }

        const { subject, html } = template(data);

        await sendEmail({
          to: data.email || 'test@cargosync.com',
          subject,
          html
        });

        console.log(`Email sent for event: ${topic}`);

      } catch (error) {
        console.error(`Error processing message: ${error.message}`);
      }
    }
  });
};

run().catch(console.error);