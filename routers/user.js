import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const router = express.Router();

// Crear usuario con confirmación de contraseña
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contraseña, confirmarContraseña } = req.body;

    // Validar campos obligatorios
    if (!nombre || !correo || !contraseña || !confirmarContraseña) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios',
        camposFaltantes: {
          nombre: !nombre,
          correo: !correo,
          contraseña: !contraseña,
          confirmarContraseña: !confirmarContraseña
        }
      });
    }

    // Validar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden',
        mensaje: 'La contraseña y la confirmación deben ser iguales'
      });
    }

    // Validar longitud mínima de contraseña
    if (contraseña.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await User.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El correo electrónico ya está registrado',
        mensaje: 'Intenta con otro correo o inicia sesión'
      });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      correo,
      contraseña: hash
    });

    const usuarioGuardado = await nuevoUsuario.save();
    
    // Respuesta de éxito
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuarioGuardado._id,
        nombre: usuarioGuardado.nombre,
        correo: usuarioGuardado.correo,
        fechaCreacion: usuarioGuardado.createdAt
      },
      notificacion: '¡Bienvenido! Tu cuenta ha sido creada correctamente'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Error al crear usuario', 
      detalle: error.message 
    });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar campos obligatorios
    if (!correo || !contraseña) {
      return res.status(400).json({ 
        error: 'Correo y contraseña son obligatorios',
        camposFaltantes: {
          correo: !correo,
          contraseña: !contraseña
        }
      });
    }

    // Buscar usuario por correo
    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'El correo o la contraseña son incorrectos'
      });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'El correo o la contraseña son incorrectos'
      });
    }

    // Login exitoso
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fechaCreacion: usuario.createdAt
      },
      notificacion: `¡Bienvenido de vuelta, ${usuario.nombre}!`
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Error en el inicio de sesión', 
      detalle: error.message 
    });
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-contraseña');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, correo, contraseña, confirmarContraseña } = req.body;
    const datosActualizados = { nombre, correo };

    // Si se va a cambiar la contraseña, validar confirmación
    if (contraseña) {
      if (!confirmarContraseña) {
        return res.status(400).json({ 
          error: 'Debe confirmar la nueva contraseña' 
        });
      }
      
      if (contraseña !== confirmarContraseña) {
        return res.status(400).json({ 
          error: 'Las contraseñas no coinciden' 
        });
      }

      if (contraseña.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      datosActualizados.contraseña = await bcrypt.hash(contraseña, 10);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id, 
      datosActualizados, 
      { new: true }
    ).select('-contraseña');
    
    if (!usuarioActualizado) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ 
      mensaje: 'Usuario eliminado correctamente',
      notificacion: 'El usuario ha sido eliminado de la base de datos'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
