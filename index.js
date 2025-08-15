import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Necesitarás instalar este paquete
import userRoutes from './routers/user.js';
import licenciaRoutes from './routers/licencia.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/licencias', licenciaRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((error) => console.error('Error de conexión:', error));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
