package sv.medicit.app.Entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad intermedia que relaciona Rol, Permiso y Modulo.
 * Tabla: rol_permiso_modulo
 * Permite asignar permisos específicos de módulos a cada rol.
 */
@Entity
@Table(name = "Rol_Permiso_Modulo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolPermisoModulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol_permiso_modulo")
    private Integer idRolPermisoModulo;

    // Relación ManyToOne con Roles
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", referencedColumnName = "id_rol", nullable = false)
    private Roles rol;

    // Relación ManyToOne con Permisos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_permiso", referencedColumnName = "id_permiso", nullable = false)
    private Permisos permiso;


    // Relación ManyToOne con Modulos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo", referencedColumnName = "id_modulo", nullable = false)
    private Modulos modulo;
}
