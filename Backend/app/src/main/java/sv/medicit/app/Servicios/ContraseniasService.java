package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Contrasenias;
import sv.medicit.app.Repositorios.ContraseniasRepository;
import sv.medicit.app.Utilidades.EncriptacionUtil;

/**
 * Servicio para la lógica de negocio de Contrasenias.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class ContraseniasService {

    @Autowired
    private ContraseniasRepository contraseniasRepository;

    @Autowired
    private EncriptacionUtil encriptacionUtil;

    /**
     * Obtener todas las contraseñas.
     */
    public List<Contrasenias> obtenerTodos() {
        return contraseniasRepository.findAll();
    }

    /**
     * Obtener una contraseña por ID.
     */
    public Optional<Contrasenias> obtenerPorId(Integer id) {
        return contraseniasRepository.findById(id);
    }

    /**
     * Crear una nueva contraseña (encriptada).
     */
    public Contrasenias crear(Contrasenias contrasenia) {
        if (contrasenia.getUsuario() == null) {
            throw new IllegalArgumentException("El usuario es requerido");
        }
        if (contrasenia.getContrasenia() == null || contrasenia.getContrasenia().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }
        
        // Encriptar la contraseña antes de guardar
        String contraseniaEncriptada = encriptacionUtil.encriptarContrasenia(contrasenia.getContrasenia());
        contrasenia.setContrasenia(contraseniaEncriptada);
        
        return contraseniasRepository.save(contrasenia);
    }

    /**
     * Actualizar una contraseña existente (encriptará la nueva contraseña).
     */
    public Contrasenias actualizar(Integer id, Contrasenias contraseniaActualizada) {
        Optional<Contrasenias> contraseniaExistente = contraseniasRepository.findById(id);
        
        if (contraseniaExistente.isPresent()) {
            Contrasenias contrasenia = contraseniaExistente.get();
            
            if (contraseniaActualizada.getUsuario() != null) {
                contrasenia.setUsuario(contraseniaActualizada.getUsuario());
            }
            if (contraseniaActualizada.getContrasenia() != null) {
                // Encriptar la contraseña antes de guardar
                String contraseniaEncriptada = encriptacionUtil.encriptarContrasenia(contraseniaActualizada.getContrasenia());
                contrasenia.setContrasenia(contraseniaEncriptada);
            }
            
            return contraseniasRepository.save(contrasenia);
        } else {
            throw new RuntimeException("Contraseña no encontrada con ID: " + id);
        }
    }

    /**
     * Eliminar una contraseña por ID.
     */
    public void eliminar(Integer id) {
        if (!contraseniasRepository.existsById(id)) {
            throw new RuntimeException("Contraseña no encontrada con ID: " + id);
        }
        contraseniasRepository.deleteById(id);
    }

    /**
     * Obtener la contraseña de un usuario específico.
     */
    public Optional<Contrasenias> obtenerPorUsuarioId(Integer idUsuario) {
        return contraseniasRepository.findByUsuarioIdUsuario(idUsuario);
    }
}
