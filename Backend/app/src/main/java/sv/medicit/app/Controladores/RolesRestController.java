package sv.medicit.app.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sv.medicit.app.Entidades.Roles;
import sv.medicit.app.Servicios.RolesService;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolesRestController {

    @Autowired
    private RolesService rolesService;

    @GetMapping
    public ResponseEntity<List<Roles>> obtenerTodos() {
        List<Roles> roles = rolesService.obtenerTodos();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Roles> obtenerPorId(@PathVariable Integer id) {
        Optional<Roles> rol = rolesService.obtenerPorId(id);
        if (rol.isPresent()) {
            return new ResponseEntity<>(rol.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Roles rol) {
        try {
            Roles rolCreado = rolesService.crear(rol);
            return new ResponseEntity<>(rolCreado, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Roles rolActualizado) {
        try {
            Roles rol = rolesService.actualizar(id, rolActualizado);
            return new ResponseEntity<>(rol, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            rolesService.eliminar(id);
            return new ResponseEntity<>(new SuccessResponse("Rol eliminado", id), HttpStatus.OK);
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
