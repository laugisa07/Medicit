package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Preguntas;

/**
 * Repositorio para la entidad Preguntas.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface PreguntasRepository extends JpaRepository<Preguntas, Integer> {
    
    // Métodos personalizados (opcional, se pueden agregar según necesidad)
}
