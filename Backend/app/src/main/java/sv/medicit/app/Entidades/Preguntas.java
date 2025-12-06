package sv.medicit.app.Entidades;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA que representa la tabla `preguntas`.
 * Almacena las preguntas frecuentes o de la comunidad.
 */
@Entity
@Table(name = "Preguntas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Preguntas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pregunta")
    private Integer idPregunta;

    @Column(name = "pregunta", length = 255, nullable = false)
    private String pregunta;

    @Column(name = "creado", nullable = false)
    private LocalDateTime creado;

    @Column(name = "creado_por", length = 50, nullable = false)
    private String creadoPor;
}
