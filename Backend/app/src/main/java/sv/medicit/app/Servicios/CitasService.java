package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.DTOs.CitaSimpleDTO;
import sv.medicit.app.Entidades.Citas;
import sv.medicit.app.Repositorios.CitasRepository;

/**
 * Servicio para la lógica de negocio de Citas.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class CitasService {

    @Autowired
    private CitasRepository citasRepository;

    /**
     * Obtener todas las citas.
     */
    public List<Citas> obtenerTodos() {
        return citasRepository.findAll();
    }

    /**
     * Obtener una cita por ID.
     */
    public Optional<Citas> obtenerPorId(Integer id) {
        return citasRepository.findById(id);
    }

    /**
     * Crear una nueva cita.
     */
    public Citas crear(Citas cita) {
        if (cita.getPaciente() == null) {
            throw new IllegalArgumentException("El paciente es requerido");
        }
        if (cita.getMedico() == null) {
            throw new IllegalArgumentException("El médico es requerido");
        }
        if (cita.getFechaHora() == null) {
            throw new IllegalArgumentException("La fecha y hora son requeridas");
        }
        if (cita.getMotivo() == null || cita.getMotivo().isEmpty()) {
            throw new IllegalArgumentException("El motivo es requerido");
        }
        return citasRepository.save(cita);
    }

    /**
     * Actualizar una cita existente.
     */
    public Citas actualizar(Integer id, Citas citaActualizada) {
        Optional<Citas> citaExistente = citasRepository.findById(id);
        
        if (citaExistente.isPresent()) {
            Citas cita = citaExistente.get();
            
            if (citaActualizada.getPaciente() != null) {
                cita.setPaciente(citaActualizada.getPaciente());
            }
            if (citaActualizada.getMedico() != null) {
                cita.setMedico(citaActualizada.getMedico());
            }
            if (citaActualizada.getFechaHora() != null) {
                cita.setFechaHora(citaActualizada.getFechaHora());
            }
            if (citaActualizada.getMotivo() != null) {
                cita.setMotivo(citaActualizada.getMotivo());
            }
            if (citaActualizada.getEstado() != null) {
                cita.setEstado(citaActualizada.getEstado());
            }
            
            return citasRepository.save(cita);
        } else {
            throw new RuntimeException("Cita no encontrada con ID: " + id);
        }
    }

    /**
     * Eliminar una cita por ID.
     */
    public void eliminar(Integer id) {
        if (!citasRepository.existsById(id)) {
            throw new RuntimeException("Cita no encontrada con ID: " + id);
        }
        citasRepository.deleteById(id);
    }

    /**
     * Obtener citas simplificadas de un paciente.
     * Retorna solo los datos necesarios sin objetos completos de Usuario.
     */
    public List<CitaSimpleDTO> obtenerCitasPorPaciente(Integer idPaciente) {
        return citasRepository.obtenerCitasPacienteSimplificadas(idPaciente);
    }

    /**
     * Obtener citas simplificadas de un médico.
     * Retorna solo los datos necesarios sin objetos completos de Usuario.
     */
    public List<CitaSimpleDTO> obtenerCitasPorMedico(Integer idMedico) {
        return citasRepository.obtenerCitasMedicoSimplificadas(idMedico);
    }
}
