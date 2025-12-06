package sv.medicit.app.Repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sv.medicit.app.DTOs.CitaSimpleDTO;
import sv.medicit.app.Entidades.Citas;

/**
 * Repositorio para la entidad Citas.
 * Proporciona métodos CRUD y operaciones de base de datos.
 */
@Repository
public interface CitasRepository extends JpaRepository<Citas, Integer> {
    
    // Obtener todas las citas de un paciente específico
    List<Citas> findByPacienteIdUsuario(Integer idPaciente);
    
    // Obtener todas las citas de un médico específico
    List<Citas> findByMedicoIdUsuario(Integer idMedico);
    
    /**
     * Obtener citas en formato simplificado para un paciente.
     * Retorna solo los datos necesarios sin incluir objetos completos de Usuario.
     */
    @Query("SELECT new sv.medicit.app.DTOs.CitaSimpleDTO(" +
           "c.idCita, c.paciente.idUsuario, CONCAT(c.paciente.nombres, ' ', c.paciente.apellidos), " +
           "c.medico.idUsuario, CONCAT(c.medico.nombres, ' ', c.medico.apellidos), c.fechaHora, c.motivo, c.estado.estado) " +
           "FROM Citas c WHERE c.paciente.idUsuario = :idPaciente")
    List<CitaSimpleDTO> obtenerCitasPacienteSimplificadas(@Param("idPaciente") Integer idPaciente);
    
    /**
     * Obtener citas en formato simplificado para un médico.
     * Retorna solo los datos necesarios sin incluir objetos completos de Usuario.
     */
    @Query("SELECT new sv.medicit.app.DTOs.CitaSimpleDTO(" +
           "c.idCita, c.paciente.idUsuario, CONCAT(c.paciente.nombres, ' ', c.paciente.apellidos), " +
           "c.medico.idUsuario, CONCAT(c.medico.nombres, ' ', c.medico.apellidos), c.fechaHora, c.motivo, c.estado.estado) " +
           "FROM Citas c WHERE c.medico.idUsuario = :idMedico")
    List<CitaSimpleDTO> obtenerCitasMedicoSimplificadas(@Param("idMedico") Integer idMedico);
}
