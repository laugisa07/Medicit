package sv.medicit.app.Repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Permisos;

/**
 * Repositorio para la entidad Permisos.
 * Proporciona métodos para obtener permisos por rol.
 */
@Repository
public interface PermisosRepository extends JpaRepository<Permisos, Integer> {
    
    /**
     * Obtener todos los permisos de un rol específico.
     */
    List<Permisos> findByRolIdRol(Integer idRol);
}
