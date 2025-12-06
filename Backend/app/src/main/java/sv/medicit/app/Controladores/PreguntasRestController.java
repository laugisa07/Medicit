package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Preguntas;
import sv.medicit.app.Servicios.PreguntasService;

/**
 * RestController para la gestión de Preguntas.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/preguntas
 */
@RestController
@RequestMapping("/api/preguntas")
@CrossOrigin(origins = "*")
public class PreguntasRestController {

    @Autowired
    private PreguntasService preguntasService;

    /**
     * GET /api/preguntas
     * Obtener todas las preguntas.
     */
    @GetMapping
    public ResponseEntity<List<Preguntas>> obtenerTodos() {
        List<Preguntas> preguntas = preguntasService.obtenerTodos();
        return new ResponseEntity<>(preguntas, HttpStatus.OK);
    }

    /**
     * GET /api/preguntas/{id}
     * Obtener una pregunta por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Preguntas> obtenerPorId(@PathVariable Integer id) {
        Optional<Preguntas> pregunta = preguntasService.obtenerPorId(id);
        if (pregunta.isPresent()) {
            return new ResponseEntity<>(pregunta.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/preguntas
     * Crear una nueva pregunta.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Preguntas pregunta) {
        try {
            Preguntas preguntaCreada = preguntasService.crear(pregunta);
            return new ResponseEntity<>(preguntaCreada, HttpStatus.CREATED);
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
     * PUT /api/preguntas/{id}
     * Actualizar una pregunta existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Preguntas preguntaActualizada) {
        try {
            Preguntas preguntaUpdated = preguntasService.actualizar(id, preguntaActualizada);
            return new ResponseEntity<>(preguntaUpdated, HttpStatus.OK);
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
     * DELETE /api/preguntas/{id}
     * Eliminar una pregunta por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            preguntasService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Pregunta eliminada exitosamente", id),
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
