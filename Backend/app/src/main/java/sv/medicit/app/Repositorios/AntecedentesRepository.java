package sv.medicit.app.Repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sv.medicit.app.DTOs.AntecedenteSimpleDTO;
import sv.medicit.app.Entidades.Antecedentes;

/**
 * Repositorio para la entidad Antecedentes.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface AntecedentesRepository extends JpaRepository<Antecedentes, Integer> {
    
    // Obtener todos los antecedentes de un usuario
    List<Antecedentes> findByUsuarioIdUsuario(Integer idUsuario);
    
    // Obtener antecedentes simplificados (solo ID y antecedente) sin datos del usuario
    @Query("SELECT new sv.medicit.app.DTOs.AntecedenteSimpleDTO(a.idAntecedente, a.antecedente) " +
           "FROM Antecedentes a WHERE a.usuario.idUsuario = :idUsuario")
    List<AntecedenteSimpleDTO> obtenerAntecedentesSimplePorUsuarioId(@Param("idUsuario") Integer idUsuario);
}
