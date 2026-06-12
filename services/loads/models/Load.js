import mongoose from 'mongoose';

const loadSchema = new mongoose.Schema({
  loadNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'assigned', 'in_transit', 'delivered', 'cancelled'],
    default: 'created'
  },
  shipper: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String }
  },
  carrier: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    assignedAt: { type: Date }
  },
  pickup: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    scheduledAt: { type: Date, required: true }
  },
  delivery: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    actualAt: { type: Date }
  },
  commodity: {
    description: { type: String, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, default: 'lbs' }
  },
  rate: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'CAD' }
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  statusHistory: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: mongoose.Schema.Types.ObjectId,
      note: String
    }
  ]
}, {
  timestamps: true
});

const Load=mongoose.model('Load', loadSchema);
export default Load