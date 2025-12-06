package sv.medicit.app.Repositorios;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Correos;

/**
 * Repositorio para la entidad Correos.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface CorreosRepository extends JpaRepository<Correos, Integer> {
    
    // Métodos personalizados
    Optional<Correos> findByCorreo(String correo);
}
