package sv.medicit.app.Servicios;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.DTOs.LoginResponseDTO;
import sv.medicit.app.DTOs.LoginResponseDTO.PermisosDTO;
import sv.medicit.app.DTOs.LoginResponseDTO.UserDataDTO;
import sv.medicit.app.Entidades.Permisos;
import sv.medicit.app.Entidades.Usuarios;
import sv.medicit.app.Repositorios.PermisosRepository;
import sv.medicit.app.Repositorios.UsuariosRepository;
import sv.medicit.app.Utilidades.EncriptacionUtil;

/**
 * Servicio para manejar la autenticación y obtención de datos consolidados de login.
 */
@Service
public class LoginService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private PermisosRepository permisosRepository;

    @Autowired
    private EncriptacionUtil encriptacionUtil;

    /**
     * Autenticar usuario y obtener toda su información consolidada (usuario + permisos).
     * Retorna un LoginResponseDTO con toda la información necesaria en una sola respuesta.
     */
    public Optional<LoginResponseDTO> autenticar(String nombreUsuario, String contrasenaIngresada) {
        // 1. Buscar el usuario
        Optional<Usuarios> usuarioOpt = usuariosRepository.findByNombreUsuario(nombreUsuario);
        if (!usuarioOpt.isPresent()) {
            return Optional.empty();
        }

        Usuarios usuario = usuarioOpt.get();

        // 2. Obtener la contraseña del usuario
        if (usuario.getContrasenias() == null || usuario.getContrasenias().isEmpty()) {
            return Optional.empty();
        }

        String contraseniaGuardada = usuario.getContrasenias().get(0).getContrasenia();

        // 3. Verificar contraseña
        if (!encriptacionUtil.verificarContrasenia(contrasenaIngresada, contraseniaGuardada)) {
            return Optional.empty();
        }

        // 4. Obtener permisos del rol
        List<Permisos> permisosList = permisosRepository.findByRolIdRol(usuario.getRol().getIdRol());

        // 5. Convertir permisos a estructura de Map
        Map<String, PermisosDTO> permisosMap = new HashMap<>();
        for (Permisos permiso : permisosList) {
            PermisosDTO permisoDTO = new PermisosDTO(
                permiso.getVer(),
                permiso.getCrear(),
                permiso.getEditar(),
                permiso.getEliminar(),
                permiso.getDescargar()
            );
            permisosMap.put(permiso.getModulo(), permisoDTO);
        }

        // 6. Construir la respuesta
        UserDataDTO userData = new UserDataDTO(
            usuario.getIdUsuario(),
            usuario.getCorreos() != null && !usuario.getCorreos().isEmpty() ? usuario.getCorreos().get(0).getCorreo() : "",
            contraseniaGuardada,
            usuario.getNombreUsuario(),
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getRol().getIdRol(),
            usuario.getRol().getNombreRol(),
            permisosMap
        );

        LoginResponseDTO response = new LoginResponseDTO(true, userData);
        return Optional.of(response);
    }

    /**
     * Obtener información consolidada de un usuario sin validación de contraseña.
     * Útil para obtener datos después del login.
     */
    public Optional<LoginResponseDTO> obtenerUsuarioConsolidado(Integer idUsuario) {
        Optional<Usuarios> usuarioOpt = usuariosRepository.findById(idUsuario);
        if (!usuarioOpt.isPresent()) {
            return Optional.empty();
        }

        Usuarios usuario = usuarioOpt.get();

        // Obtener contraseña
        String contrasenia = usuario.getContrasenias() != null && !usuario.getContrasenias().isEmpty()
            ? usuario.getContrasenias().get(0).getContrasenia()
            : "";

        // Obtener permisos
        List<Permisos> permisosList = permisosRepository.findByRolIdRol(usuario.getRol().getIdRol());
        Map<String, PermisosDTO> permisosMap = new HashMap<>();
        for (Permisos permiso : permisosList) {
            PermisosDTO permisoDTO = new PermisosDTO(
                permiso.getVer(),
                permiso.getCrear(),
                permiso.getEditar(),
                permiso.getEliminar(),
                permiso.getDescargar()
            );
            permisosMap.put(permiso.getModulo(), permisoDTO);
        }

        UserDataDTO userData = new UserDataDTO(
            usuario.getIdUsuario(),
            usuario.getCorreos() != null && !usuario.getCorreos().isEmpty() ? usuario.getCorreos().get(0).getCorreo() : "",
            contrasenia,
            usuario.getNombreUsuario(),
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getRol().getIdRol(),
            usuario.getRol().getNombreRol(),
            permisosMap
        );

        LoginResponseDTO response = new LoginResponseDTO(true, userData);
        return Optional.of(response);
    }
}
