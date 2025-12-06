package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Telefonos;

/**
 * Repositorio para la entidad Telefonos.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface TelefonosRepository extends JpaRepository<Telefonos, Integer> {
    
    // Métodos personalizados (opcional, se pueden agregar según necesidad)
}
