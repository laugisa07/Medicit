package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.DTOs.CitaSimpleDTO;
import sv.medicit.app.Entidades.Citas;
import sv.medicit.app.Servicios.CitasService;

/**
 * RestController para la gestión de Citas.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/citas
 */
@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitasRestController {

    @Autowired
    private CitasService citasService;

    /**
     * GET /api/citas
     * Obtener todas las citas.
     */
    @GetMapping
    public ResponseEntity<List<Citas>> obtenerTodos() {
        List<Citas> citas = citasService.obtenerTodos();
        return new ResponseEntity<>(citas, HttpStatus.OK);
    }

    /**
     * GET /api/citas/{id}
     * Obtener una cita por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Citas> obtenerPorId(@PathVariable Integer id) {
        Optional<Citas> cita = citasService.obtenerPorId(id);
        if (cita.isPresent()) {
            return new ResponseEntity<>(cita.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/citas
     * Crear una nueva cita.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Citas cita) {
        try {
            Citas citaCreada = citasService.crear(cita);
            return new ResponseEntity<>(citaCreada, HttpStatus.CREATED);
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
     * PUT /api/citas/{id}
     * Actualizar una cita existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Citas citaActualizada) {
        try {
            Citas citaUpdated = citasService.actualizar(id, citaActualizada);
            return new ResponseEntity<>(citaUpdated, HttpStatus.OK);
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
     * DELETE /api/citas/{id}
     * Eliminar una cita por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            citasService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Cita eliminada exitosamente", id),
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

    /**
     * GET /api/citas/paciente/{idPaciente}
     * Obtener todas las citas de un paciente específico en formato simplificado.
     */
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<?> obtenerCitasPorPaciente(@PathVariable Integer idPaciente) {
        try {
            List<CitaSimpleDTO> citas = citasService.obtenerCitasPorPaciente(idPaciente);
            // Retornar array vacío con OK en lugar de NOT_FOUND
            return new ResponseEntity<>(citas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/citas/medico/{idMedico}
     * Obtener todas las citas de un médico específico en formato simplificado.
     */
    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<?> obtenerCitasPorMedico(@PathVariable Integer idMedico) {
        try {
            List<CitaSimpleDTO> citas = citasService.obtenerCitasPorMedico(idMedico);
            // Retornar array vacío con OK en lugar de NOT_FOUND
            return new ResponseEntity<>(citas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
