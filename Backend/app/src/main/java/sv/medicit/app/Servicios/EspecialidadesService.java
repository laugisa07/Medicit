package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Especialidades;
import sv.medicit.app.Repositorios.EspecialidadesRepository;

@Service
public class EspecialidadesService {

    @Autowired
    private EspecialidadesRepository especialidadesRepository;

    public List<Especialidades> obtenerTodos() {
        return especialidadesRepository.findAll();
    }

    public Optional<Especialidades> obtenerPorId(Integer id) {
        return especialidadesRepository.findById(id);
    }

    public Especialidades crear(Especialidades especialidad) {
        if (especialidad.getNombreEspecialidad() == null || especialidad.getNombreEspecialidad().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la especialidad es requerido");
        }
        return especialidadesRepository.save(especialidad);
    }

    public Especialidades actualizar(Integer id, Especialidades especialidadActualizada) {
        Optional<Especialidades> especialidadExistente = especialidadesRepository.findById(id);
        
        if (especialidadExistente.isPresent()) {
            Especialidades especialidad = especialidadExistente.get();
            if (especialidadActualizada.getNombreEspecialidad() != null) {
                especialidad.setNombreEspecialidad(especialidadActualizada.getNombreEspecialidad());
            }
            if (especialidadActualizada.getDescripcion() != null) {
                especialidad.setDescripcion(especialidadActualizada.getDescripcion());
            }
            return especialidadesRepository.save(especialidad);
        } else {
            throw new RuntimeException("Especialidad no encontrada con ID: " + id);
        }
    }

    public void eliminar(Integer id) {
        if (!especialidadesRepository.existsById(id)) {
            throw new RuntimeException("Especialidad no encontrada con ID: " + id);
        }
        especialidadesRepository.deleteById(id);
    }
}
