package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Preguntas;
import sv.medicit.app.Repositorios.PreguntasRepository;

/**
 * Servicio para la lógica de negocio de Preguntas.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class PreguntasService {

    @Autowired
    private PreguntasRepository preguntasRepository;

    /**
     * Obtener todas las preguntas.
     */
    public List<Preguntas> obtenerTodos() {
        return preguntasRepository.findAll();
    }

    /**
     * Obtener una pregunta por ID.
     */
    public Optional<Preguntas> obtenerPorId(Integer id) {
        return preguntasRepository.findById(id);
    }

    /**
     * Crear una nueva pregunta.
     */
    public Preguntas crear(Preguntas pregunta) {
        if (pregunta.getPregunta() == null || pregunta.getPregunta().isEmpty()) {
            throw new IllegalArgumentException("La pregunta es requerida");
        }
        if (pregunta.getCreado() == null) {
            throw new IllegalArgumentException("La fecha de creación es requerida");
        }
        if (pregunta.getCreadoPor() == null || pregunta.getCreadoPor().isEmpty()) {
            throw new IllegalArgumentException("El autor es requerido");
        }
        return preguntasRepository.save(pregunta);
    }

    /**
     * Actualizar una pregunta existente.
     */
    public Preguntas actualizar(Integer id, Preguntas preguntaActualizada) {
        Optional<Preguntas> preguntaExistente = preguntasRepository.findById(id);
        
        if (preguntaExistente.isPresent()) {
            Preguntas pregunta = preguntaExistente.get();
            
            if (preguntaActualizada.getPregunta() != null) {
                pregunta.setPregunta(preguntaActualizada.getPregunta());
            }
            if (preguntaActualizada.getCreado() != null) {
                pregunta.setCreado(preguntaActualizada.getCreado());
            }
            if (preguntaActualizada.getCreadoPor() != null) {
                pregunta.setCreadoPor(preguntaActualizada.getCreadoPor());
            }
            
            return preguntasRepository.save(pregunta);
        } else {
            throw new RuntimeException("Pregunta no encontrada con ID: " + id);
        }
    }

    /**
     * Eliminar una pregunta por ID.
     */
    public void eliminar(Integer id) {
        if (!preguntasRepository.existsById(id)) {
            throw new RuntimeException("Pregunta no encontrada con ID: " + id);
        }
        preguntasRepository.deleteById(id);
    }
}
