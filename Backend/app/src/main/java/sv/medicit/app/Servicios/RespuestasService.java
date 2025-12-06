package sv.medicit.app.Servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sv.medicit.app.Entidades.Respuestas;
import sv.medicit.app.Repositorios.RespuestasRepository;

/**
 * Servicio para la lógica de negocio de Respuestas.
 * Proporciona métodos CRUD y validaciones.
 */
@Service
public class RespuestasService {

    @Autowired
    private RespuestasRepository respuestasRepository;

    /**
     * Obtener todas las respuestas.
     */
    public List<Respuestas> obtenerTodos() {
        return respuestasRepository.findAll();
    }

    /**
     * Obtener una respuesta por ID.
     */
    public Optional<Respuestas> obtenerPorId(Integer id) {
        return respuestasRepository.findById(id);
    }

    /**
     * Crear una nueva respuesta.
     */
    public Respuestas crear(Respuestas respuesta) {
        if (respuesta.getUsuario() == null) {
            throw new IllegalArgumentException("El usuario es requerido");
        }
        if (respuesta.getPregunta() == null) {
            throw new IllegalArgumentException("La pregunta es requerida");
        }
        if (respuesta.getRespuesta() == null || respuesta.getRespuesta().isEmpty()) {
            throw new IllegalArgumentException("La respuesta es requerida");
        }
        return respuestasRepository.save(respuesta);
    }

    /**
     * Actualizar una respuesta existente.
     */
    public Respuestas actualizar(Integer id, Respuestas respuestaActualizada) {
        Optional<Respuestas> respuestaExistente = respuestasRepository.findById(id);
        
        if (respuestaExistente.isPresent()) {
            Respuestas respuesta = respuestaExistente.get();
            
            if (respuestaActualizada.getUsuario() != null) {
                respuesta.setUsuario(respuestaActualizada.getUsuario());
            }
            if (respuestaActualizada.getPregunta() != null) {
                respuesta.setPregunta(respuestaActualizada.getPregunta());
            }
            if (respuestaActualizada.getRespuesta() != null) {
                respuesta.setRespuesta(respuestaActualizada.getRespuesta());
            }
            
            return respuestasRepository.save(respuesta);
        } else {
            throw new RuntimeException("Respuesta no encontrada con ID: " + id);
        }
    }

    /**
     * Eliminar una respuesta por ID.
     */
    public void eliminar(Integer id) {
        if (!respuestasRepository.existsById(id)) {
            throw new RuntimeException("Respuesta no encontrada con ID: " + id);
        }
        respuestasRepository.deleteById(id);
    }

    /**
     * Obtener todas las respuestas de un usuario específico (incluyendo preguntas).
     */
    public List<Respuestas> obtenerPorUsuarioId(Integer idUsuario) {
        return respuestasRepository.findByUsuarioIdUsuario(idUsuario);
    }
}
