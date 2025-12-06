package sv.medicit.app.Entidades;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinTable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA que representa la tabla `usuarios`.
 * Esta clase fue adaptada para mapear columnas y permitir que JPA/Hibernate
 * cree/actualice la tabla desde las entidades (ddl-auto=update).
 */
@Entity
@Table(name = "Usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "nombre_usuario", length = 15, nullable = false, unique = true)
    private String nombreUsuario;

    @Column(name = "nombres", length = 35, nullable = false)
    private String nombres;

    @Column(name = "apellidos", length = 35, nullable = false)
    private String apellidos;

    @Column(name = "dui", length = 10, nullable = true, unique = true)
    private String dui;

    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_nacimiento", nullable = false)
    private Date fechaNacimiento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", referencedColumnName = "id_rol", nullable = false)
    private Roles rol;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estado", referencedColumnName = "id_estado", nullable = false)
    private Estados estado;

    // Relación ManyToMany con Especialidades (lado propietario)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "Usuario_especialidad",
        joinColumns = @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario"),
        inverseJoinColumns = @JoinColumn(name = "id_especialidad", referencedColumnName = "id_especialidad")
    )
    private List<Especialidades> especialidades;

    // Relación OneToMany con Contrasenias
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Contrasenias> contrasenias;

    // Relación OneToMany con Correos
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Correos> correos;
}
