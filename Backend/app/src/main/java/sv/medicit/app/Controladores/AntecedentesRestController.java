package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.DTOs.AntecedenteSimpleDTO;
import sv.medicit.app.Entidades.Antecedentes;
import sv.medicit.app.Servicios.AntecedentesService;

/**
 * RestController para la gestión de Antecedentes.
 * Proporciona endpoints REST para operaciones CRUD.
 * Base URL: /api/antecedentes
 */
@RestController
@RequestMapping("/api/antecedentes")
@CrossOrigin(origins = "*")
public class AntecedentesRestController {

    @Autowired
    private AntecedentesService antecedentesService;

    /**
     * GET /api/antecedentes
     * Obtener todos los antecedentes.
     */
    @GetMapping
    public ResponseEntity<List<Antecedentes>> obtenerTodos() {
        List<Antecedentes> antecedentes = antecedentesService.obtenerTodos();
        return new ResponseEntity<>(antecedentes, HttpStatus.OK);
    }

    /**
     * GET /api/antecedentes/{id}
     * Obtener un antecedente por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Antecedentes> obtenerPorId(@PathVariable Integer id) {
        Optional<Antecedentes> antecedente = antecedentesService.obtenerPorId(id);
        if (antecedente.isPresent()) {
            return new ResponseEntity<>(antecedente.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/antecedentes
     * Crear un nuevo antecedente.
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Antecedentes antecedente) {
        try {
            Antecedentes antecedenteCreado = antecedentesService.crear(antecedente);
            return new ResponseEntity<>(antecedenteCreado, HttpStatus.CREATED);
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
     * PUT /api/antecedentes/{id}
     * Actualizar un antecedente existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Antecedentes antecedenteActualizado) {
        try {
            Antecedentes antecedenteUpdated = antecedentesService.actualizar(id, antecedenteActualizado);
            return new ResponseEntity<>(antecedenteUpdated, HttpStatus.OK);
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
     * DELETE /api/antecedentes/{id}
     * Eliminar un antecedente por ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            antecedentesService.eliminar(id);
            return new ResponseEntity<>(
                new SuccessResponse("Antecedente eliminado exitosamente", id),
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
     * GET /api/antecedentes/usuario/{idUsuario}
     * Obtener los antecedentes de un usuario específico en formato simplificado.
     * Retorna solo el ID del antecedente y la descripción, sin incluir información del usuario.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerAntecedentesDelUsuario(@PathVariable Integer idUsuario) {
        try {
            List<AntecedenteSimpleDTO> antecedentes = antecedentesService.obtenerAntecedentesSimplePorUsuarioId(idUsuario);
            if (antecedentes.isEmpty()) {
                return new ResponseEntity<>(
                    new ErrorResponse("No encontrado", "El usuario no tiene antecedentes registrados"),
                    HttpStatus.NOT_FOUND
                );
            }
            return new ResponseEntity<>(antecedentes, HttpStatus.OK);
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
