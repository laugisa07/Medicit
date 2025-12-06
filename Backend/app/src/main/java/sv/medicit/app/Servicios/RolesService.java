package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Roles;
import sv.medicit.app.Repositorios.RolesRepository;

@Service
public class RolesService {

    @Autowired
    private RolesRepository rolesRepository;

    public List<Roles> obtenerTodos() {
        return rolesRepository.findAll();
    }

    public Optional<Roles> obtenerPorId(Integer id) {
        return rolesRepository.findById(id);
    }

    public Roles crear(Roles rol) {
        if (rol.getNombreRol() == null || rol.getNombreRol().isEmpty()) {
            throw new IllegalArgumentException("El nombre del rol es requerido");
        }
        return rolesRepository.save(rol);
    }

    public Roles actualizar(Integer id, Roles rolActualizado) {
        Optional<Roles> rolExistente = rolesRepository.findById(id);
        
        if (rolExistente.isPresent()) {
            Roles rol = rolExistente.get();
            if (rolActualizado.getNombreRol() != null) {
                rol.setNombreRol(rolActualizado.getNombreRol());
            }
            if (rolActualizado.getDescripcion() != null) {
                rol.setDescripcion(rolActualizado.getDescripcion());
            }
            return rolesRepository.save(rol);
        } else {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
    }

    public void eliminar(Integer id) {
        if (!rolesRepository.existsById(id)) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        rolesRepository.deleteById(id);
    }
}
