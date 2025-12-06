package sv.medicit.app.Repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Respuestas;

/**
 * Repositorio para la entidad Respuestas.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface RespuestasRepository extends JpaRepository<Respuestas, Integer> {
    
    // Obtener todas las respuestas de un usuario específico
    List<Respuestas> findByUsuarioIdUsuario(Integer idUsuario);
}
