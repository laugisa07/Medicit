package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Estados;
import sv.medicit.app.Repositorios.EstadosRepository;

@Service
public class EstadosService {

    @Autowired
    private EstadosRepository estadosRepository;

    public List<Estados> obtenerTodos() {
        return estadosRepository.findAll();
    }

    public Optional<Estados> obtenerPorId(Integer id) {
        return estadosRepository.findById(id);
    }

    public Estados crear(Estados estado) {
        if (estado.getEstado() == null || estado.getEstado().isEmpty()) {
            throw new IllegalArgumentException("El estado es requerido");
        }
        return estadosRepository.save(estado);
    }

    public Estados actualizar(Integer id, Estados estadoActualizado) {
        Optional<Estados> estadoExistente = estadosRepository.findById(id);
        
        if (estadoExistente.isPresent()) {
            Estados estado = estadoExistente.get();
            if (estadoActualizado.getEstado() != null) {
                estado.setEstado(estadoActualizado.getEstado());
            }
            if (estadoActualizado.getDescripcion() != null) {
                estado.setDescripcion(estadoActualizado.getDescripcion());
            }
            return estadosRepository.save(estado);
        } else {
            throw new RuntimeException("Estado no encontrado con ID: " + id);
        }
    }

    public void eliminar(Integer id) {
        if (!estadosRepository.existsById(id)) {
            throw new RuntimeException("Estado no encontrado con ID: " + id);
        }
        estadosRepository.deleteById(id);
    }
}
