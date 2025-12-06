package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Especialidades;
import sv.medicit.app.Servicios.EspecialidadesService;

@RestController
@RequestMapping("/api/especialidades")
@CrossOrigin(origins = "*")
public class EspecialidadesRestController {

    @Autowired
    private EspecialidadesService especialidadesService;

    @GetMapping
    public ResponseEntity<List<Especialidades>> obtenerTodos() {
        List<Especialidades> especialidades = especialidadesService.obtenerTodos();
        return new ResponseEntity<>(especialidades, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especialidades> obtenerPorId(@PathVariable Integer id) {
        Optional<Especialidades> especialidad = especialidadesService.obtenerPorId(id);
        if (especialidad.isPresent()) {
            return new ResponseEntity<>(especialidad.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Especialidades especialidad) {
        try {
            Especialidades especialidadCreada = especialidadesService.crear(especialidad);
            return new ResponseEntity<>(especialidadCreada, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Especialidades especialidadActualizada) {
        try {
            Especialidades especialidad = especialidadesService.actualizar(id, especialidadActualizada);
            return new ResponseEntity<>(especialidad, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            especialidadesService.eliminar(id);
            return new ResponseEntity<>(new SuccessResponse("Especialidad eliminada", id), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    public static class ErrorResponse {
        public String tipo;
        public String mensaje;
        public ErrorResponse(String tipo, String mensaje) {
            this.tipo = tipo;
            this.mensaje = mensaje;
        }
    }

    public static class SuccessResponse {
        public String mensaje;
        public Object dato;
        public SuccessResponse(String mensaje, Object dato) {
            this.mensaje = mensaje;
            this.dato = dato;
        }
    }
}
