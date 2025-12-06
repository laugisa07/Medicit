package sv.medicit.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de login.
 * Incluye la información del usuario con la contraseña para validación en el cliente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioLoginDTO {

    private Integer idUsuario;

    private String nombreUsuario;

    private String nombres;

    private String apellidos;

    private String dui;

    private String contrasenia;

    private String correo;

    private String nombreRol;

    private Integer idRol;

}

