import express from 'express';
import bcrypt from 'bcryptjs';
import License from '../models/license.js';

const router = express.Router();

// Obtener todas las licencias
router.get('/', async (req, res) => {
  try {
    const licenses = await License.find();
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las licencias: ' + error.message });
  }
});

// Crear una nueva licencia
router.post('/', async (req, res) => {
  try {
    const { nombreCompleto, numeroLicencia, email, password, confirmarPassword } = req.body;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden. Por favor, verifica que sean iguales.' });
    }
    
    // Verificar si el número de licencia ya existe
    const licenciaExistente = await License.findOne({ numeroLicencia });
    if (licenciaExistente) {
      return res.status(400).json({ message: 'El número de licencia ya está registrado. Por favor, utiliza otro número.' });
    }
    
    // Verificar si el email ya existe
    const emailExistente = await License.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado. Por favor, utiliza otro correo.' });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const license = new License({
      nombreCompleto,
      numeroLicencia,
      email,
      password: hashedPassword
    });

    const newLicense = await license.save();
    res.status(201).json({
      message: '¡Licencia creada correctamente!',
      licencia: newLicense
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la licencia: ' + error.message });
  }
});

// Obtener una licencia específica
router.get('/:id', async (req, res) => {
  try {
    const license = await License.findById(req.params.id);
    if (license) {
      res.json(license);
    } else {
      res.status(404).json({ message: 'Licencia no encontrada. El ID proporcionado no existe.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar la licencia: ' + error.message });
  }
});

// Actualizar una licencia
router.patch('/:id', async (req, res) => {
  try {
    const license = await License.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ message: 'Licencia no encontrada. El ID proporcionado no existe.' });
    }
    
    // Verificar si el número de licencia ya existe (solo si se está actualizando)
    if (req.body.numeroLicencia && req.body.numeroLicencia !== license.numeroLicencia) {
      const licenciaExistente = await License.findOne({ numeroLicencia: req.body.numeroLicencia });
      if (licenciaExistente) {
        return res.status(400).json({ message: 'El número de licencia ya está registrado. Por favor, utiliza otro número.' });
      }
    }
    
    // Verificar si el email ya existe (solo si se está actualizando)
    if (req.body.email && req.body.email !== license.email) {
      const emailExistente = await License.findOne({ email: req.body.email });
      if (emailExistente) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado. Por favor, utiliza otro correo.' });
      }
    }
    
    if (req.body.nombreCompleto) license.nombreCompleto = req.body.nombreCompleto;
    if (req.body.numeroLicencia) license.numeroLicencia = req.body.numeroLicencia;
    if (req.body.email) license.email = req.body.email;
    
    // Manejar actualización de contraseña con encriptación
    if (req.body.password && req.body.confirmarPassword) {
      // Verificar que las contraseñas coincidan
      if (req.body.password !== req.body.confirmarPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden. Por favor, verifica que sean iguales.' });
      }
      
      // Encriptar la nueva contraseña
      license.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedLicense = await license.save();
    res.json({
      message: '¡Licencia actualizada correctamente!',
      licencia: updatedLicense
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la licencia: ' + error.message });
  }
});

// Eliminar una licencia
router.delete('/:id', async (req, res) => {
  try {
    const deletedLicense = await License.findByIdAndDelete(req.params.id);
    if (deletedLicense) {
      res.json({ message: '¡Licencia eliminada correctamente!' });
    } else {
      res.status(404).json({ message: 'Licencia no encontrada. El ID proporcionado no existe.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la licencia: ' + error.message });
  }
});

export default router;