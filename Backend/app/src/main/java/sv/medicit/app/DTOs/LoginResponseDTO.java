package sv.medicit.app.DTOs;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para login consolidado.
 * Retorna toda la información del usuario con sus permisos en una única respuesta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

    @JsonProperty("success")
    private Boolean success = true;

    @JsonProperty("userData")
    private UserDataDTO userData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDataDTO {

        @JsonProperty("id_usuario")
        private Integer idUsuario;

        @JsonProperty("correo")
        private String correo;

        @JsonProperty("contrasena")
        private String contrasena;

        @JsonProperty("nombre_usuario")
        private String nombreUsuario;

        @JsonProperty("nombres")
        private String nombres;

        @JsonProperty("apellidos")
        private String apellidos;

        @JsonProperty("id_rol")
        private Integer idRol;

        @JsonProperty("nombre_rol")
        private String nombreRol;

        @JsonProperty("permisos")
        private Map<String, PermisosDTO> permisos;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermisosDTO {

        @JsonProperty("ver")
        private Boolean ver;

        @JsonProperty("crear")
        private Boolean crear;

        @JsonProperty("editar")
        private Boolean editar;

        @JsonProperty("eliminar")
        private Boolean eliminar;

        @JsonProperty("descargar")
        private Boolean descargar;
    }
}
