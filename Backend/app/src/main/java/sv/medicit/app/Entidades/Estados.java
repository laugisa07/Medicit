package sv.medicit.app.Entidades;

import java.util.List;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data; 
import lombok.NoArgsConstructor; 

/**
 * Entidad JPA que representa la tabla `Estado`.
 * Esta clase fue adaptada para mapear columnas y permitir que JPA/Hibernate
 * cree/actualice la tabla desde las entidades (ddl-auto=update).
 */
@Entity
@Table(name = "Estados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estados {

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado")
    private Integer idEstado;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @Column(name = "descripcion", length = 200, nullable = false)
    private String descripcion;

    // Relación inversa (opcional) - lista de usuarios que referencian este estado
    @OneToMany(mappedBy = "estado", fetch = FetchType.LAZY)
    
    @JsonIgnore
    private List<Usuarios> usuarios;

    // Relación inversa (opcional) - lista de usuarios que referencian este estado
    @OneToMany(mappedBy = "estado", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Citas> citas;
}
