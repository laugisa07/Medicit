package sv.medicit.app.Servicios;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.DTOs.UsuarioCreacionDTO;
import sv.medicit.app.DTOs.UsuarioDTO;
import sv.medicit.app.DTOs.UsuarioLoginDTO;
import sv.medicit.app.Entidades.Contrasenias;
import sv.medicit.app.Entidades.Correos;
import sv.medicit.app.Entidades.Estados;
import sv.medicit.app.Entidades.Especialidades;
import sv.medicit.app.Entidades.Preguntas;
import sv.medicit.app.Entidades.Respuestas;
import sv.medicit.app.Entidades.Telefonos;
import sv.medicit.app.Entidades.Usuarios;
import sv.medicit.app.Repositorios.EspecialidadesRepository;
import sv.medicit.app.Repositorios.EstadosRepository;
import sv.medicit.app.Repositorios.RolesRepository;
import sv.medicit.app.Repositorios.UsuariosRepository;
import sv.medicit.app.Repositorios.CorreosRepository;

/**
 * Servicio para la lógica de negocio de Usuarios.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class UsuariosService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private EstadosRepository estadosRepository;

    @Autowired
    private EspecialidadesRepository especialidadesRepository;

    @Autowired
    private CorreosRepository correosRepository;

    @Autowired
    private ContraseniasService contraseniasService;

    @Autowired
    private TelefonosService telefonosService;

    @Autowired
    private CorreosService correosService;

    @Autowired
    private PreguntasService preguntasService;

    @Autowired
    private RespuestasService respuestasService;

    /**
     * Obtener todos los usuarios.
     */
    public List<Usuarios> obtenerTodos() {
        return usuariosRepository.findAll();
    }

    /**
     * Obtener un usuario por ID.
     */
    public Optional<Usuarios> obtenerPorId(Integer id) {
        return usuariosRepository.findById(id);
    }

    /**
     * Crear un nuevo usuario.
     */
    public Usuarios crear(Usuarios usuario) {
        // Validaciones básicas
        if (usuario.getNombreUsuario() == null || usuario.getNombreUsuario().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es requerido");
        }
        if (usuario.getNombres() == null || usuario.getNombres().isEmpty()) {
            throw new IllegalArgumentException("Los nombres son requeridos");
        }
        
        // Validar unicidad de nombreUsuario
        if (usuariosRepository.findByNombreUsuario(usuario.getNombreUsuario()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario '" + usuario.getNombreUsuario() + "' ya existe");
        }
        
        // Validar unicidad de DUI si está presente
        if (usuario.getDui() != null && !usuario.getDui().isEmpty()) {
            if (usuariosRepository.findByDui(usuario.getDui()).isPresent()) {
                throw new IllegalArgumentException("El DUI '" + usuario.getDui() + "' ya existe");
            }
        }
        
        return usuariosRepository.save(usuario);
    }

    /**
     * Crear un nuevo usuario con contraseña, teléfono, correo y preguntas/respuestas.
     * Este método maneja la creación completa de un usuario con todos sus datos relacionados.
     */
    public Usuarios crearUsuarioCompleto(UsuarioCreacionDTO usuarioDTO) {
        // Validaciones básicas
        if (usuarioDTO.getNombreUsuario() == null || usuarioDTO.getNombreUsuario().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es requerido");
        }
        if (usuarioDTO.getNombres() == null || usuarioDTO.getNombres().isEmpty()) {
            throw new IllegalArgumentException("Los nombres son requeridos");
        }
        if (usuarioDTO.getContrasenia() == null || usuarioDTO.getContrasenia().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }
        if (usuarioDTO.getTelefono() == null || usuarioDTO.getTelefono().isEmpty()) {
            throw new IllegalArgumentException("El teléfono es requerido");
        }
        if (usuarioDTO.getCorreo() == null || usuarioDTO.getCorreo().isEmpty()) {
            throw new IllegalArgumentException("El correo es requerido");
        }
        
        // Validar unicidad de nombreUsuario
        if (usuariosRepository.findByNombreUsuario(usuarioDTO.getNombreUsuario()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario '" + usuarioDTO.getNombreUsuario() + "' ya existe");
        }
        
        // Validar unicidad de DUI si está presente
        if (usuarioDTO.getDui() != null && !usuarioDTO.getDui().isEmpty()) {
            if (usuariosRepository.findByDui(usuarioDTO.getDui()).isPresent()) {
                throw new IllegalArgumentException("El DUI '" + usuarioDTO.getDui() + "' ya existe");
            }
        }
        
        // Validar unicidad de correo
        if (correosRepository.findByCorreo(usuarioDTO.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo '" + usuarioDTO.getCorreo() + "' ya existe");
        }
        
        // Crear usuario base
        Usuarios usuario = new Usuarios();
        usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        usuario.setNombres(usuarioDTO.getNombres());
        usuario.setApellidos(usuarioDTO.getApellidos());
        usuario.setDui(usuarioDTO.getDui());
        usuario.setFechaNacimiento(usuarioDTO.getFechaNacimiento());
        
        // Asignar Rol y Estado si están disponibles
        if (usuarioDTO.getIdRol() != null) {
            usuario.setRol(rolesRepository.findById(usuarioDTO.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + usuarioDTO.getIdRol())));
        }
        
        if (usuarioDTO.getIdEstado() != null) {
            usuario.setEstado(estadosRepository.findById(usuarioDTO.getIdEstado())
                .orElseThrow(() -> new RuntimeException("Estado no encontrado con ID: " + usuarioDTO.getIdEstado())));
        }
        
        // Guardar usuario
        Usuarios usuarioGuardado = usuariosRepository.save(usuario);
        
        // Crear contraseña
        try {
            Contrasenias contrasenia = new Contrasenias();
            contrasenia.setUsuario(usuarioGuardado);
            contrasenia.setContrasenia(usuarioDTO.getContrasenia());
            contraseniasService.crear(contrasenia);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear contraseña: " + e.getMessage());
        }
        
        // Crear teléfono
        try {
            Telefonos telefono = new Telefonos();
            telefono.setUsuario(usuarioGuardado);
            telefono.setTelefono(usuarioDTO.getTelefono());
            telefonosService.crear(telefono);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear teléfono: " + e.getMessage());
        }
        
        // Crear correo
        try {
            Correos correo = new Correos();
            correo.setUsuario(usuarioGuardado);
            correo.setCorreo(usuarioDTO.getCorreo());
            correosService.crear(correo);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear correo: " + e.getMessage());
        }
        
        // Crear preguntas y respuestas
        if (usuarioDTO.getPreguntasRespuestas() != null && !usuarioDTO.getPreguntasRespuestas().isEmpty()) {
            try {
                for (UsuarioCreacionDTO.PreguntaRespuestaDTO pR : usuarioDTO.getPreguntasRespuestas()) {
                    // Crear pregunta
                    Preguntas pregunta = new Preguntas();
                    pregunta.setPregunta(pR.getPregunta());
                    pregunta.setCreado(LocalDateTime.now());
                    pregunta.setCreadoPor(usuarioDTO.getNombreUsuario());
                    Preguntas preguntaGuardada = preguntasService.crear(pregunta);
                    
                    // Crear respuesta asociada
                    Respuestas respuesta = new Respuestas();
                    respuesta.setUsuario(usuarioGuardado);
                    respuesta.setPregunta(preguntaGuardada);
                    respuesta.setRespuesta(pR.getRespuesta());
                    respuestasService.crear(respuesta);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error al crear preguntas y respuestas: " + e.getMessage());
            }
        }

        // Asignar especialidades si fueron incluidas en el DTO
        if (usuarioDTO.getIdEspecialidades() != null && !usuarioDTO.getIdEspecialidades().isEmpty()) {
            asignarEspecialidadesAUsuario(usuarioGuardado.getIdUsuario(), usuarioDTO.getIdEspecialidades());
        }
        
        return usuarioGuardado;
    }

    /**
     * Asignar una o varias especialidades a un usuario (medico).
     * Recibe una lista de ids de especialidades y las asocia al usuario.
     */
    public Usuarios asignarEspecialidadesAUsuario(Integer idUsuario, List<Integer> idsEspecialidades) {
        Usuarios usuario = usuariosRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        // Opcional: verificar que el usuario sea médico (asumimos que el nombre del rol esté en el campo "nombreRol")
        if (usuario.getRol() == null || usuario.getRol().getNombreRol() == null ||
            !usuario.getRol().getNombreRol().equalsIgnoreCase("Medico")) {
            throw new RuntimeException("El usuario no es médico y no puede tener especialidades");
        }

        List<Especialidades> especialidadesEncontradas = especialidadesRepository.findAllById(idsEspecialidades);
        if (especialidadesEncontradas.size() != idsEspecialidades.size()) {
            throw new RuntimeException("Alguna(s) especialidad(es) no fue encontrada");
        }

        // Reemplazar completamente la lista de especialidades
        usuario.setEspecialidades(especialidadesEncontradas);

        return usuariosRepository.save(usuario);
    }

    /**
     * Asignar una sola especialidad a un usuario.
     */
    public Usuarios asignarEspecialidadAUsuario(Integer idUsuario, Integer idEspecialidad) {
        return asignarEspecialidadesAUsuario(idUsuario, java.util.List.of(idEspecialidad));
    }

    /**
     * Eliminar una especialidad de un usuario.
     */
    public Usuarios removerEspecialidadDeUsuario(Integer idUsuario, Integer idEspecialidad) {
        Usuarios usuario = usuariosRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        if (usuario.getEspecialidades() == null || usuario.getEspecialidades().isEmpty()) {
            throw new RuntimeException("El usuario no tiene especialidades asignadas");
        }

        usuario.getEspecialidades().removeIf(e -> e.getIdEspecialidad().equals(idEspecialidad));

        return usuariosRepository.save(usuario);
    }

    /**
     * Actualizar un usuario existente.
     */
    public Usuarios actualizar(Integer id, Usuarios usuarioActualizado) {
        Optional<Usuarios> usuarioExistente = usuariosRepository.findById(id);
        
        if (usuarioExistente.isPresent()) {
            Usuarios usuario = usuarioExistente.get();
            
            // Validar unicidad de nombreUsuario si está siendo actualizado
            if (usuarioActualizado.getNombreUsuario() != null && 
                !usuarioActualizado.getNombreUsuario().equals(usuario.getNombreUsuario())) {
                if (usuariosRepository.findByNombreUsuario(usuarioActualizado.getNombreUsuario()).isPresent()) {
                    throw new IllegalArgumentException("El nombre de usuario '" + usuarioActualizado.getNombreUsuario() + "' ya existe");
                }
                usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
            }
            
            // Validar unicidad de DUI si está siendo actualizado
            if (usuarioActualizado.getDui() != null && 
                !usuarioActualizado.getDui().equals(usuario.getDui())) {
                if (usuariosRepository.findByDui(usuarioActualizado.getDui()).isPresent()) {
                    throw new IllegalArgumentException("El DUI '" + usuarioActualizado.getDui() + "' ya existe");
                }
                usuario.setDui(usuarioActualizado.getDui());
            }
            
            if (usuarioActualizado.getNombres() != null) {
                usuario.setNombres(usuarioActualizado.getNombres());
            }
            if (usuarioActualizado.getApellidos() != null) {
                usuario.setApellidos(usuarioActualizado.getApellidos());
            }
            if (usuarioActualizado.getFechaNacimiento() != null) {
                usuario.setFechaNacimiento(usuarioActualizado.getFechaNacimiento());
            }
            if (usuarioActualizado.getRol() != null) {
                usuario.setRol(usuarioActualizado.getRol());
            }
            if (usuarioActualizado.getEstado() != null) {
                usuario.setEstado(usuarioActualizado.getEstado());
            }
            if (usuarioActualizado.getEspecialidades() != null) {
                usuario.setEspecialidades(usuarioActualizado.getEspecialidades());
            }
            
            return usuariosRepository.save(usuario);
        } else {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
    }

    /**
     * Eliminar un usuario por ID (cambiar estado a inactivo).
     * En lugar de eliminar el registro, cambia el estado del usuario a inactivo.
     */
    public Usuarios eliminar(Integer id) {
        Optional<Usuarios> usuarioExistente = usuariosRepository.findById(id);
        
        if (usuarioExistente.isPresent()) {
            Usuarios usuario = usuarioExistente.get();
            
            // Buscar el estado "Inactivo" (asumiendo que tiene idEstado = 2 o similar)
            // Si no existe, buscar por nombre
            Estados estadoInactivo = null;
            try {
                // Intenta encontrar un estado con nombre "Inactivo" o similar
                List<Estados> estados = estadosRepository.findAll();
                for (Estados e : estados) {
                    if (e.getEstado() != null && 
                        (e.getEstado().equalsIgnoreCase("Inactivo") || 
                         e.getEstado().equalsIgnoreCase("Inactiva"))) {
                        estadoInactivo = e;
                        break;
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Error al buscar estado inactivo: " + e.getMessage());
            }
            
            if (estadoInactivo == null) {
                throw new RuntimeException("Estado 'Inactivo' no encontrado en la base de datos");
            }
            
            // Cambiar estado a inactivo
            usuario.setEstado(estadoInactivo);
            usuariosRepository.save(usuario);
            
            return usuario;
        } else {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
    }

    /**
     * Obtener usuario con información de login (incluye contraseña).
     * Se usa para validar credenciales de login.
     */
    public Optional<UsuarioLoginDTO> obtenerUsuarioPorLogin(String nombreUsuario) {
        return usuariosRepository.obtenerUsuarioPorLogin(nombreUsuario);
    }

    /**
     * Obtener el correo principal de un usuario.
     * El correo principal es el primero en la lista de correos asociados.
     */
    private String obtenerCorreoDelUsuario(Integer idUsuario) {
        List<Correos> correos = correosRepository.findAll();
        for (Correos c : correos) {
            if (c.getUsuario() != null && c.getUsuario().getIdUsuario().equals(idUsuario)) {
                return c.getCorreo();
            }
        }
        return null; // Si no hay correo, retorna null
    }

    /**
     * Convertir una entidad Usuarios a UsuarioDTO con correo incluido.
     */
    private UsuarioDTO usuarioADTO(Usuarios usuario) {
        String correo = obtenerCorreoDelUsuario(usuario.getIdUsuario());
        return new UsuarioDTO(
            usuario.getIdUsuario(),
            usuario.getNombreUsuario(),
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getDui(),
            usuario.getFechaNacimiento(),
            correo,
            usuario.getRol(),
            usuario.getEstado(),
            usuario.getEspecialidades()
        );
    }

    /**
     * Obtener todos los usuarios con correo (como DTOs).
     */
    public List<UsuarioDTO> obtenerTodosConCorreo() {
        List<Usuarios> usuarios = usuariosRepository.findAll();
        return usuarios.stream()
            .map(this::usuarioADTO)
            .toList();
    }

    /**
     * Obtener un usuario por ID con correo (como DTO).
     */
    public Optional<UsuarioDTO> obtenerPorIdConCorreo(Integer id) {
        Optional<Usuarios> usuario = usuariosRepository.findById(id);
        return usuario.map(this::usuarioADTO);
    }
}
