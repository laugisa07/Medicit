package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sv.medicit.app.DTOs.UsuarioCreacionDTO;
import sv.medicit.app.DTOs.UsuarioDTO;
import sv.medicit.app.DTOs.UsuarioLoginDTO;
import sv.medicit.app.Entidades.Usuarios;
import sv.medicit.app.Servicios.UsuariosService;

/**
 * RestController para la gestión de Usuarios.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/usuarios
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuariosRestController {

    @Autowired
    private UsuariosService usuariosService;

    /**
     * GET /api/usuarios
     * Obtener todos los usuarios con correo incluido.
     */
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerTodos() {
        List<UsuarioDTO> usuarios = usuariosService.obtenerTodosConCorreo();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    /**
     * GET /api/usuarios/{id}
     * Obtener un usuario por ID con correo incluido.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Integer id) {
        Optional<UsuarioDTO> usuario = usuariosService.obtenerPorIdConCorreo(id);
        if (usuario.isPresent()) {
            return new ResponseEntity<>(usuario.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/usuarios
     * Crear un nuevo usuario.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Usuarios usuario) {
        try {
            Usuarios usuarioCreado = usuariosService.crear(usuario);
            return new ResponseEntity<>(usuarioCreado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validación fallida", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST /api/usuarios/completo
     * Crear un nuevo usuario con contraseña, teléfono, correo y preguntas/respuestas.
     */
    @PostMapping("/completo")
    public ResponseEntity<?> crearCompleto(@RequestBody UsuarioCreacionDTO usuarioDTO) {
        try {
            Usuarios usuarioCreado = usuariosService.crearUsuarioCompleto(usuarioDTO);
            return new ResponseEntity<>(usuarioCreado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validación fallida", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PUT /api/usuarios/{id}
     * Actualizar un usuario existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Usuarios usuarioActualizado) {
        try {
            Usuarios usuarioUpdated = usuariosService.actualizar(id, usuarioActualizado);
            return new ResponseEntity<>(usuarioUpdated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * DELETE /api/usuarios/{id}
     * Marcar un usuario como inactivo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            Usuarios usuarioInactivo = usuariosService.eliminar(id);
            return new ResponseEntity<>(usuarioInactivo, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST /api/usuarios/{id}/especialidades
     * Asignar una o varias especialidades a un usuario (médico)
     * Body: [1, 2, 3] (lista de ids de especialidades)
     */
    @PostMapping("/{id}/especialidades")
    public ResponseEntity<?> asignarEspecialidades(@PathVariable("id") Integer id, @RequestBody List<Integer> idsEspecialidades) {
        try {
            Usuarios usuario = usuariosService.asignarEspecialidadesAUsuario(id, idsEspecialidades);
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /api/usuarios/{id}/especialidades/{idEspecialidad}
     * Asignar una sola especialidad al usuario
     */
    @PostMapping("/{id}/especialidades/{idEspecialidad}")
    public ResponseEntity<?> asignarEspecialidad(@PathVariable("id") Integer id, @PathVariable("idEspecialidad") Integer idEspecialidad) {
        try {
            Usuarios usuario = usuariosService.asignarEspecialidadAUsuario(id, idEspecialidad);
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /api/usuarios/{id}/especialidades/{idEspecialidad}
     * Eliminar una especialidad de un usuario
     */
    @DeleteMapping("/{id}/especialidades/{idEspecialidad}")
    public ResponseEntity<?> removerEspecialidad(@PathVariable("id") Integer id, @PathVariable("idEspecialidad") Integer idEspecialidad) {
        try {
            Usuarios usuario = usuariosService.removerEspecialidadDeUsuario(id, idEspecialidad);
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Clase interna para respuestas de error.
     */
    public static class ErrorResponse {
        public String tipo;
        public String mensaje;

        public ErrorResponse(String tipo, String mensaje) {
            this.tipo = tipo;
            this.mensaje = mensaje;
        }

        public String getTipo() {
            return tipo;
        }

        public String getMensaje() {
            return mensaje;
        }
    }

    /**
     * Clase interna para respuestas exitosas.
     */
    public static class SuccessResponse {
        public String mensaje;
        public Object dato;

        public SuccessResponse(String mensaje, Object dato) {
            this.mensaje = mensaje;
            this.dato = dato;
        }

        public String getMensaje() {
            return mensaje;
        }

        public Object getDato() {
            return dato;
        }
    }

    /**
     * POST /api/usuarios/login/{nombreUsuario}
     * Obtener información del usuario con contraseña para validar login.
     * El cliente comparará la contraseña proporcionada con la almacenada.
     */
    @PostMapping("/login/{nombreUsuario}")
    public ResponseEntity<?> obtenerUsuarioPorLogin(@PathVariable String nombreUsuario) {
        try {
            Optional<UsuarioLoginDTO> usuario = usuariosService.obtenerUsuarioPorLogin(nombreUsuario);
            if (usuario.isPresent()) {
                return new ResponseEntity<>(usuario.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    new ErrorResponse("No encontrado", "Usuario no encontrado: " + nombreUsuario),
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
