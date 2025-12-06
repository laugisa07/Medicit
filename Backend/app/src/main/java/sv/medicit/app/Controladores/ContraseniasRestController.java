package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Contrasenias;
import sv.medicit.app.Servicios.ContraseniasService;

/**
 * RestController para la gestión de Contrasenias.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/contrasenias
 */
@RestController
@RequestMapping("/api/contrasenias")
@CrossOrigin(origins = "*")
public class ContraseniasRestController {

    @Autowired
    private ContraseniasService contraseniasService;

    /**
     * GET /api/contrasenias
     * Obtener todas las contraseñas.
     */
    @GetMapping
    public ResponseEntity<List<Contrasenias>> obtenerTodos() {
        List<Contrasenias> contrasenias = contraseniasService.obtenerTodos();
        return new ResponseEntity<>(contrasenias, HttpStatus.OK);
    }

    /**
     * GET /api/contrasenias/{id}
     * Obtener una contraseña por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Contrasenias> obtenerPorId(@PathVariable Integer id) {
        Optional<Contrasenias> contrasenia = contraseniasService.obtenerPorId(id);
        if (contrasenia.isPresent()) {
            return new ResponseEntity<>(contrasenia.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/contrasenias
     * Crear una nueva contraseña.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Contrasenias contrasenia) {
        try {
            Contrasenias contraseniaCreada = contraseniasService.crear(contrasenia);
            return new ResponseEntity<>(contraseniaCreada, HttpStatus.CREATED);
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
     * PUT /api/contrasenias/{id}
     * Actualizar una contraseña existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Contrasenias contraseniaActualizada) {
        try {
            Contrasenias contraseniaUpdated = contraseniasService.actualizar(id, contraseniaActualizada);
            return new ResponseEntity<>(contraseniaUpdated, HttpStatus.OK);
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
     * DELETE /api/contrasenias/{id}
     * Eliminar una contraseña por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            contraseniasService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Contraseña eliminada exitosamente", id),
                HttpStatus.OK
            );
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
     * GET /api/contrasenias/usuario/{idUsuario}
     * Obtener la contraseña de un usuario específico por ID de usuario.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerPorUsuarioId(@PathVariable Integer idUsuario) {
        try {
            Optional<Contrasenias> contrasenia = contraseniasService.obtenerPorUsuarioId(idUsuario);
            if (contrasenia.isPresent()) {
                return new ResponseEntity<>(contrasenia.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    new ErrorResponse("No encontrado", "No existe contraseña para el usuario con ID: " + idUsuario),
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
}
