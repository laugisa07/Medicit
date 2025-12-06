package sv.medicit.app.Repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Contrasenias;

/**
 * Repositorio para la entidad Contrasenias.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface ContraseniasRepository extends JpaRepository<Contrasenias, Integer> {
    
    // Obtener la contraseña de un usuario específico
    Optional<Contrasenias> findByUsuarioIdUsuario(Integer idUsuario);
}
