package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Correos;
import sv.medicit.app.Repositorios.CorreosRepository;

/**
 * Servicio para la lógica de negocio de Correos.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class CorreosService {

    @Autowired
    private CorreosRepository correosRepository;

    /**
     * Obtener todos los correos.
     */
    public List<Correos> obtenerTodos() {
        return correosRepository.findAll();
    }

    /**
     * Obtener un correo por ID.
     */
    public Optional<Correos> obtenerPorId(Integer id) {
        return correosRepository.findById(id);
    }

    /**
     * Crear un nuevo correo.
     */
    public Correos crear(Correos correo) {
        if (correo.getUsuario() == null) {
            throw new IllegalArgumentException("El usuario es requerido");
        }
        if (correo.getCorreo() == null || correo.getCorreo().isEmpty()) {
            throw new IllegalArgumentException("El correo es requerido");
        }
        
        // Validar unicidad de correo
        if (correosRepository.findByCorreo(correo.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo '" + correo.getCorreo() + "' ya existe");
        }
        
        return correosRepository.save(correo);
    }

    /**
     * Actualizar un correo existente.
     */
    public Correos actualizar(Integer id, Correos correoActualizado) {
        Optional<Correos> correoExistente = correosRepository.findById(id);
        
        if (correoExistente.isPresent()) {
            Correos correo = correoExistente.get();
            
            if (correoActualizado.getUsuario() != null) {
                correo.setUsuario(correoActualizado.getUsuario());
            }
            if (correoActualizado.getCorreo() != null) {
                correo.setCorreo(correoActualizado.getCorreo());
            }
            
            return correosRepository.save(correo);
        } else {
            throw new RuntimeException("Correo no encontrado con ID: " + id);
        }
    }

    /**
     * Eliminar un correo por ID.
     */
    public void eliminar(Integer id) {
        if (!correosRepository.existsById(id)) {
            throw new RuntimeException("Correo no encontrado con ID: " + id);
        }
        correosRepository.deleteById(id);
    }
}
