package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Telefonos;
import sv.medicit.app.Repositorios.TelefonosRepository;

/**
 * Servicio para la lógica de negocio de Telefonos.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class TelefonosService {

    @Autowired
    private TelefonosRepository telefonosRepository;

    /**
     * Obtener todos los teléfonos.
     */
    public List<Telefonos> obtenerTodos() {
        return telefonosRepository.findAll();
    }

    /**
     * Obtener un teléfono por ID.
     */
    public Optional<Telefonos> obtenerPorId(Integer id) {
        return telefonosRepository.findById(id);
    }

    /**
     * Crear un nuevo teléfono.
     */
    public Telefonos crear(Telefonos telefono) {
        if (telefono.getUsuario() == null) {
            throw new IllegalArgumentException("El usuario es requerido");
        }
        if (telefono.getTelefono() == null || telefono.getTelefono().isEmpty()) {
            throw new IllegalArgumentException("El teléfono es requerido");
        }
        return telefonosRepository.save(telefono);
    }

    /**
     * Actualizar un teléfono existente.
     */
    public Telefonos actualizar(Integer id, Telefonos telefonoActualizado) {
        Optional<Telefonos> telefonoExistente = telefonosRepository.findById(id);
        
        if (telefonoExistente.isPresent()) {
            Telefonos telefono = telefonoExistente.get();
            
            if (telefonoActualizado.getUsuario() != null) {
                telefono.setUsuario(telefonoActualizado.getUsuario());
            }
            if (telefonoActualizado.getTelefono() != null) {
                telefono.setTelefono(telefonoActualizado.getTelefono());
            }
            
            return telefonosRepository.save(telefono);
        } else {
            throw new RuntimeException("Teléfono no encontrado con ID: " + id);
        }
    }

    /**
     * Eliminar un teléfono por ID.
     */
    public void eliminar(Integer id) {
        if (!telefonosRepository.existsById(id)) {
            throw new RuntimeException("Teléfono no encontrado con ID: " + id);
        }
        telefonosRepository.deleteById(id);
    }
}
