package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Modulos;
import sv.medicit.app.Repositorios.ModulosRepository;

@Service
public class ModulosService {

    @Autowired
    private ModulosRepository modulosRepository;

    public List<Modulos> obtenerTodos() {
        return modulosRepository.findAll();
    }

    public Optional<Modulos> obtenerPorId(Integer id) {
        return modulosRepository.findById(id);
    }

    public Modulos crear(Modulos modulo) {
        if (modulo.getNombreModulo() == null || modulo.getNombreModulo().isEmpty()) {
            throw new IllegalArgumentException("El nombre del módulo es requerido");
        }
        return modulosRepository.save(modulo);
    }

    public Modulos actualizar(Integer id, Modulos moduloActualizado) {
        Optional<Modulos> moduloExistente = modulosRepository.findById(id);
        
        if (moduloExistente.isPresent()) {
            Modulos modulo = moduloExistente.get();
            if (moduloActualizado.getNombreModulo() != null) {
                modulo.setNombreModulo(moduloActualizado.getNombreModulo());
            }
            if (moduloActualizado.getDescripcion() != null) {
                modulo.setDescripcion(moduloActualizado.getDescripcion());
            }
            return modulosRepository.save(modulo);
        } else {
            throw new RuntimeException("Módulo no encontrado con ID: " + id);
        }
    }

    public void eliminar(Integer id) {
        if (!modulosRepository.existsById(id)) {
            throw new RuntimeException("Módulo no encontrado con ID: " + id);
        }
        modulosRepository.deleteById(id);
    }
}
