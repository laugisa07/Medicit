package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Respuestas;
import sv.medicit.app.Servicios.RespuestasService;

/**
 * RestController para la gestión de Respuestas.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/respuestas
 */
@RestController
@RequestMapping("/api/respuestas")
@CrossOrigin(origins = "*")
public class RespuestasRestController {

    @Autowired
    private RespuestasService respuestasService;

    /**
     * GET /api/respuestas
     * Obtener todas las respuestas.
     */
    @GetMapping
    public ResponseEntity<List<Respuestas>> obtenerTodos() {
        List<Respuestas> respuestas = respuestasService.obtenerTodos();
        return new ResponseEntity<>(respuestas, HttpStatus.OK);
    }

    /**
     * GET /api/respuestas/{id}
     * Obtener una respuesta por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Respuestas> obtenerPorId(@PathVariable Integer id) {
        Optional<Respuestas> respuesta = respuestasService.obtenerPorId(id);
        if (respuesta.isPresent()) {
            return new ResponseEntity<>(respuesta.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/respuestas
     * Crear una nueva respuesta.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Respuestas respuesta) {
        try {
            Respuestas respuestaCreada = respuestasService.crear(respuesta);
            return new ResponseEntity<>(respuestaCreada, HttpStatus.CREATED);
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
     * PUT /api/respuestas/{id}
     * Actualizar una respuesta existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Respuestas respuestaActualizada) {
        try {
            Respuestas respuestaUpdated = respuestasService.actualizar(id, respuestaActualizada);
            return new ResponseEntity<>(respuestaUpdated, HttpStatus.OK);
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
     * DELETE /api/respuestas/{id}
     * Eliminar una respuesta por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            respuestasService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Respuesta eliminada exitosamente", id),
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
     * GET /api/respuestas/usuario/{idUsuario}
     * Obtener todas las respuestas/preguntas de un usuario específico con el ID del usuario incluido.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerPorUsuarioId(@PathVariable Integer idUsuario) {
        try {
            List<Respuestas> respuestas = respuestasService.obtenerPorUsuarioId(idUsuario);
            if (respuestas.isEmpty()) {
                return new ResponseEntity<>(
                    new ErrorResponse("No encontrado", "El usuario no tiene respuestas registradas"),
                    HttpStatus.NOT_FOUND
                );
            }
            return new ResponseEntity<>(respuestas, HttpStatus.OK);
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
