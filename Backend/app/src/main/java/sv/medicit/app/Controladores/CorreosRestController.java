package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Correos;
import sv.medicit.app.Servicios.CorreosService;

/**
 * RestController para la gestión de Correos.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/correos
 */
@RestController
@RequestMapping("/api/correos")
@CrossOrigin(origins = "*")
public class CorreosRestController {

    @Autowired
    private CorreosService correosService;

    /**
     * GET /api/correos
     * Obtener todos los correos.
     */
    @GetMapping
    public ResponseEntity<List<Correos>> obtenerTodos() {
        List<Correos> correos = correosService.obtenerTodos();
        return new ResponseEntity<>(correos, HttpStatus.OK);
    }

    /**
     * GET /api/correos/{id}
     * Obtener un correo por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Correos> obtenerPorId(@PathVariable Integer id) {
        Optional<Correos> correo = correosService.obtenerPorId(id);
        if (correo.isPresent()) {
            return new ResponseEntity<>(correo.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/correos
     * Crear un nuevo correo.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Correos correo) {
        try {
            Correos correoCreado = correosService.crear(correo);
            return new ResponseEntity<>(correoCreado, HttpStatus.CREATED);
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
     * PUT /api/correos/{id}
     * Actualizar un correo existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Correos correoActualizado) {
        try {
            Correos correoUpdated = correosService.actualizar(id, correoActualizado);
            return new ResponseEntity<>(correoUpdated, HttpStatus.OK);
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
     * DELETE /api/correos/{id}
     * Eliminar un correo por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            correosService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Correo eliminado exitosamente", id),
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
