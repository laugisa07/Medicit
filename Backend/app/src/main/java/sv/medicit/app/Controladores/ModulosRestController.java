package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Modulos;
import sv.medicit.app.Servicios.ModulosService;

@RestController
@RequestMapping("/api/modulos")
@CrossOrigin(origins = "*")
public class ModulosRestController {

    @Autowired
    private ModulosService modulosService;

    @GetMapping
    public ResponseEntity<List<Modulos>> obtenerTodos() {
        List<Modulos> modulos = modulosService.obtenerTodos();
        return new ResponseEntity<>(modulos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modulos> obtenerPorId(@PathVariable Integer id) {
        Optional<Modulos> modulo = modulosService.obtenerPorId(id);
        if (modulo.isPresent()) {
            return new ResponseEntity<>(modulo.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Modulos modulo) {
        try {
            Modulos moduloCreado = modulosService.crear(modulo);
            return new ResponseEntity<>(moduloCreado, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Modulos moduloActualizado) {
        try {
            Modulos modulo = modulosService.actualizar(id, moduloActualizado);
            return new ResponseEntity<>(modulo, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            modulosService.eliminar(id);
            return new ResponseEntity<>(new SuccessResponse("Módulo eliminado", id), HttpStatus.OK);
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
