package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Estados;
import sv.medicit.app.Servicios.EstadosService;

@RestController
@RequestMapping("/api/estados")
@CrossOrigin(origins = "*")
public class EstadosRestController {

    @Autowired
    private EstadosService estadosService;

    @GetMapping
    public ResponseEntity<List<Estados>> obtenerTodos() {
        List<Estados> estados = estadosService.obtenerTodos();
        return new ResponseEntity<>(estados, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estados> obtenerPorId(@PathVariable Integer id) {
        Optional<Estados> estado = estadosService.obtenerPorId(id);
        if (estado.isPresent()) {
            return new ResponseEntity<>(estado.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Estados estado) {
        try {
            Estados estadoCreado = estadosService.crear(estado);
            return new ResponseEntity<>(estadoCreado, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Estados estadoActualizado) {
        try {
            Estados estado = estadosService.actualizar(id, estadoActualizado);
            return new ResponseEntity<>(estado, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            estadosService.eliminar(id);
            return new ResponseEntity<>(new SuccessResponse("Estado eliminado", id), HttpStatus.OK);
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
