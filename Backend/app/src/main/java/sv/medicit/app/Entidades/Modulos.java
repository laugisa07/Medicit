package sv.medicit.app.Entidades;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table; 
import jakarta.persistence.FetchType; 
import jakarta.persistence.OneToMany;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad JPA que representa la tabla `usuarios`.
 * Esta clase fue adaptada para mapear columnas y permitir que JPA/Hibernate
 * cree/actualice la tabla desde las entidades (ddl-auto=update).
 */
@Entity
@Table(name = "Modulos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Modulos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "nombre_modulo", length = 30, nullable = false)
    private String nombreModulo;

    @Column(name = "descripcion", length = 200, nullable = false)
    private String descripcion;

    // Relación inversa - lista de RolPermisoModulo para este módulo
    @OneToMany(mappedBy = "modulo", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<RolPermisoModulo> rolesPermisosModulos;
}
