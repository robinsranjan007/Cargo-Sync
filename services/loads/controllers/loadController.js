import Load from '../models/Load.js';
import { producer } from '../config/kafka.js';

// Generate load number like CS-4821
const generateLoadNumber = async () => {
  const count = await Load.countDocuments();
  return `CS-${String(count + 1).padStart(4, '0')}`;
};

// Create a new load
export const createLoad = async (req, res) => {
  try {
    const {
      shipper,
      pickup,
      delivery,
      commodity,
      rate
    } = req.body;

    const loadNumber = await generateLoadNumber();

    const load = await Load.create({
      loadNumber,
      shipper,
      pickup,
      delivery,
      commodity,
      rate,
      tenantId: req.user.tenantId,
      createdBy: req.user.userId,
      statusHistory: [{
        status: 'created',
        changedBy: req.user.userId,
        note: 'Load created'
      }]
    });


try {
 
  await producer.send({
    topic: 'load.created',
    messages: [
      {
        value: JSON.stringify({
          loadId: load._id,
          loadNumber: load.loadNumber,
          email: load.shipper.email,
          shipper: load.shipper,
          carrier: load.carrier,
          pickup: load.pickup,
          delivery: load.delivery,
          rate: load.rate
        })
      }
    ]
  });
  console.log(`Kafka event published: load.created for ${load.loadNumber}`);
} catch (kafkaError) {
  console.error('Kafka publish error:', kafkaError.message);
}


    res.status(201).json({
      success: true,
      load
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all loads for a tenant
export const getLoads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { tenantId: req.user.tenantId };
    if (status) filter.status = status;

    const loads = await Load.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Load.countDocuments(filter);

    res.json({
      success: true,
      loads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single load
export const getLoad = async (req, res) => {
  try {
    const load = await Load.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.json({ success: true, load });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update load status
export const updateLoadStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validTransitions = {
      created: ['assigned', 'cancelled'],
      assigned: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    const load = await Load.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Check if transition is valid
    const allowedStatuses = validTransitions[load.status];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${load.status} to ${status}`
      });
    }

    // Update status
    load.status = status;
    load.statusHistory.push({
      status,
      changedBy: req.user.userId,
      note: note || `Status updated to ${status}`
    });

    // If delivered set actual delivery time
    if (status === 'delivered') {
      load.delivery.actualAt = new Date();
    }

    await load.save();

    res.json({ success: true, load });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign carrier to load
export const assignCarrier = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const load = await Load.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });
    
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'created') {
      return res.status(400).json({
        message: 'Carrier can only be assigned to a newly created load'
      });
    }

    load.carrier = { name, email, phone, assignedAt: new Date() };
    load.status = 'assigned';
    load.statusHistory.push({
      status: 'assigned',
      changedBy: req.user.userId,
      note: `Carrier ${name} assigned`
    });

    await load.save();

    res.json({ success: true, load });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};