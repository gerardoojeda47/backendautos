import mongoose from 'mongoose'; 
 
const licenseSchema = new mongoose.Schema({ 
  nombreCompleto: { 
    type: String, 
    required: true 
  }, 
  numeroLicencia: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  email: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  password: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
}); 

export default mongoose.model('License', licenseSchema);