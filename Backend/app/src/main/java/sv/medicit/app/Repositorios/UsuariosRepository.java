package sv.medicit.app.Repositorios;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sv.medicit.app.DTOs.UsuarioLoginDTO;
import sv.medicit.app.Entidades.Usuarios;

/**
 * Repositorio para la entidad Usuarios.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {
    
    // Métodos personalizados
    Optional<Usuarios> findByNombreUsuario(String nombreUsuario);
    Optional<Usuarios> findByDui(String dui);
    
    /**
     * Obtener información del usuario con su contraseña para login.
     * Proyecta solo los campos necesarios para validación de login.
     */
    @Query("SELECT new sv.medicit.app.DTOs.UsuarioLoginDTO(" +
           "u.idUsuario, u.nombreUsuario, u.nombres, u.apellidos, u.dui, " +
           "c.contrasenia, co.correo, r.nombreRol, r.idRol) " +
           "FROM Usuarios u " +
           "LEFT JOIN Contrasenias c ON u.idUsuario = c.usuario.idUsuario " +
           "LEFT JOIN Correos co ON u.idUsuario = co.usuario.idUsuario " +
           "LEFT JOIN Roles r ON u.rol.idRol = r.idRol " +
           "WHERE u.nombreUsuario = :nombreUsuario")
    Optional<UsuarioLoginDTO> obtenerUsuarioPorLogin(@Param("nombreUsuario") String nombreUsuario);
}
