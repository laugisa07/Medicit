package sv.medicit.app.Entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Entidad JPA que representa la tabla `correos`.
 * Almacena las direcciones de correo electrónico asociadas a los usuarios.
 */
@Entity
@Table(name = "Correos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Correos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_correo")
    private Integer idCorreo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", referencedColumnName = "id_usuario", nullable = false)
    @JsonIgnore(false)
    @JsonProperty("usuario")
    private Usuarios usuario;

    @Column(name = "correo", length = 100, nullable = false, unique = true)
    private String correo;
}
