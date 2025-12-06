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
 * Entidad simplificada que representa los permisos de un rol para un módulo.
 * 
 * Tabla: permisos
 * Una fila por combinación de rol y módulo con acciones booleanas.
 */
@Entity
@Table(name = "Permisos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permisos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Integer idPermiso;

    // Relación ManyToOne con Roles
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", referencedColumnName = "id_rol", nullable = false)
    private Roles rol;

    @Column(name = "modulo", length = 50, nullable = false)
    private String modulo;

    @Column(name = "ver", nullable = false)
    private Boolean ver = false;

    @Column(name = "crear", nullable = false)
    private Boolean crear = false;

    @Column(name = "editar", nullable = false)
    private Boolean editar = false;

    @Column(name = "eliminar", nullable = false)
    private Boolean eliminar = false;

    @Column(name = "descargar", nullable = false)
    private Boolean descargar = false;
}
