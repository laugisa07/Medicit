package sv.medicit.app.Controladores;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sv.medicit.app.DTOs.LoginResponseDTO;
import sv.medicit.app.Servicios.LoginService;

/**
 * RestController para manejar la autenticación y obtención de datos consolidados.
 * Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class LoginRestController {

    @Autowired
    private LoginService loginService;

    /**
     * POST /api/auth/login
     * Autenticar usuario y obtener toda la información consolidada en una sola respuesta.
     * 
     * Body esperado:
     * {
     *   "nombreUsuario": "usuario123",
     *   "contrasenia": "password123"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            Optional<LoginResponseDTO> response = loginService.autenticar(request.getNombreUsuario(), request.getContrasenia());
            
            if (response.isPresent()) {
                return new ResponseEntity<>(response.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    new ErrorResponse(false, "Credenciales inválidas"),
                    HttpStatus.UNAUTHORIZED
                );
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse(false, "Error en la autenticación: " + e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /api/auth/usuario/{idUsuario}
     * Obtener información consolidada de un usuario sin validación de contraseña.
     * Útil para refrescar datos después del login.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerUsuarioConsolidado(@PathVariable Integer idUsuario) {
        try {
            Optional<LoginResponseDTO> response = loginService.obtenerUsuarioConsolidado(idUsuario);
            
            if (response.isPresent()) {
                return new ResponseEntity<>(response.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    new ErrorResponse(false, "Usuario no encontrado"),
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse(false, "Error: " + e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Clase interna para la solicitud de login.
     */
    public static class LoginRequestDTO {
        private String nombreUsuario;
        private String contrasenia;

        public String getNombreUsuario() {
            return nombreUsuario;
        }

        public void setNombreUsuario(String nombreUsuario) {
            this.nombreUsuario = nombreUsuario;
        }

        public String getContrasenia() {
            return contrasenia;
        }

        public void setContrasenia(String contrasenia) {
            this.contrasenia = contrasenia;
        }
    }

    /**
     * Clase interna para respuestas de error.
     */
    public static class ErrorResponse {
        private Boolean success;
        private String message;

        public ErrorResponse(Boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public Boolean getSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}
