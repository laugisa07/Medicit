package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Telefonos;
import sv.medicit.app.Servicios.TelefonosService;

/**
 * RestController para la gestión de Telefonos.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/telefonos
 */
@RestController
@RequestMapping("/api/telefonos")
@CrossOrigin(origins = "*")
public class TelefonosRestController {

    @Autowired
    private TelefonosService telefonosService;

    /**
     * GET /api/telefonos
     * Obtener todos los teléfonos.
     */
    @GetMapping
    public ResponseEntity<List<Telefonos>> obtenerTodos() {
        List<Telefonos> telefonos = telefonosService.obtenerTodos();
        return new ResponseEntity<>(telefonos, HttpStatus.OK);
    }

    /**
     * GET /api/telefonos/{id}
     * Obtener un teléfono por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Telefonos> obtenerPorId(@PathVariable Integer id) {
        Optional<Telefonos> telefono = telefonosService.obtenerPorId(id);
        if (telefono.isPresent()) {
            return new ResponseEntity<>(telefono.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/telefonos
     * Crear un nuevo teléfono.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Telefonos telefono) {
        try {
            Telefonos telefonoCreado = telefonosService.crear(telefono);
            return new ResponseEntity<>(telefonoCreado, HttpStatus.CREATED);
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
     * PUT /api/telefonos/{id}
     * Actualizar un teléfono existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Telefonos telefonoActualizado) {
        try {
            Telefonos telefonoUpdated = telefonosService.actualizar(id, telefonoActualizado);
            return new ResponseEntity<>(telefonoUpdated, HttpStatus.OK);
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
     * DELETE /api/telefonos/{id}
     * Eliminar un teléfono por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            telefonosService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Teléfono eliminado exitosamente", id),
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
