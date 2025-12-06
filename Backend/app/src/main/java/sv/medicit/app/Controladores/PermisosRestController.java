package sv.medicit.app.Controladores;

import java.util.List;
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
import sv.medicit.app.Entidades.Permisos;
import sv.medicit.app.Repositorios.PermisosRepository;

/**
 * REST Controller para gestionar Permisos
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/permisos")
public class PermisosRestController {

    @Autowired
    private PermisosRepository permisosRepository;

    /**
     * Obtener todos los permisos
     */
    @GetMapping
    public ResponseEntity<List<Permisos>> obtenerTodos() {
        List<Permisos> permisos = permisosRepository.findAll();
        return new ResponseEntity<>(permisos, HttpStatus.OK);
    }

    /**
     * Obtener un permiso por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Permisos> obtenerPorId(@PathVariable Integer id) {
        return permisosRepository.findById(id)
                .map(permiso -> new ResponseEntity<>(permiso, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Crear un nuevo permiso
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Permisos permiso) {
        try {
            // Validar que el rol esté presente
            if (permiso.getRol() == null || permiso.getRol().getIdRol() == null) {
                return new ResponseEntity<>(
                    new ErrorResponse("Validación fallida", "El rol es requerido"),
                    HttpStatus.BAD_REQUEST
                );
            }
            // Validar que el módulo esté presente
            if (permiso.getModulo() == null || permiso.getModulo().isEmpty()) {
                return new ResponseEntity<>(
                    new ErrorResponse("Validación fallida", "El módulo es requerido"),
                    HttpStatus.BAD_REQUEST
                );
            }
            Permisos permisoGuardado = permisosRepository.save(permiso);
            return new ResponseEntity<>(permisoGuardado, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Actualizar un permiso existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Permisos> actualizar(
            @PathVariable Integer id,
            @RequestBody Permisos permisoActualizado) {
        return permisosRepository.findById(id)
                .map(permiso -> {
                    // Actualizar rol solo si viene en el payload
                    if (permisoActualizado.getRol() != null && permisoActualizado.getRol().getIdRol() != null) {
                        permiso.setRol(permisoActualizado.getRol());
                    }
                    // Actualizar módulo si viene
                    if (permisoActualizado.getModulo() != null) {
                        permiso.setModulo(permisoActualizado.getModulo());
                    }
                    // Actualizar booleanos
                    if (permisoActualizado.getVer() != null) {
                        permiso.setVer(permisoActualizado.getVer());
                    }
                    if (permisoActualizado.getCrear() != null) {
                        permiso.setCrear(permisoActualizado.getCrear());
                    }
                    if (permisoActualizado.getEditar() != null) {
                        permiso.setEditar(permisoActualizado.getEditar());
                    }
                    if (permisoActualizado.getEliminar() != null) {
                        permiso.setEliminar(permisoActualizado.getEliminar());
                    }
                    if (permisoActualizado.getDescargar() != null) {
                        permiso.setDescargar(permisoActualizado.getDescargar());
                    }
                    Permisos permisoGuardado = permisosRepository.save(permiso);
                    return new ResponseEntity<>(permisoGuardado, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Eliminar un permiso
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (permisosRepository.existsById(id)) {
            permisosRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Obtener permisos por rol
     */
    @GetMapping("/rol/{idRol}")
    public ResponseEntity<List<Permisos>> obtenerPorRol(@PathVariable Integer idRol) {
        List<Permisos> permisos = permisosRepository.findByRolIdRol(idRol);
        return new ResponseEntity<>(permisos, HttpStatus.OK);
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
}
