package sv.medicit.app.DTOs;

import java.util.Date;
import java.util.List;

import sv.medicit.app.Entidades.Especialidades;
import sv.medicit.app.Entidades.Estados;
import sv.medicit.app.Entidades.Roles;

/**
 * DTO para Usuario que incluye el correo principal.
 * Se usa para retornar usuarios con toda su información desde los endpoints GET.
 */
public class UsuarioDTO {
    private Integer idUsuario;
    private String nombreUsuario;
    private String nombres;
    private String apellidos;
    private String dui;
    private Date fechaNacimiento;
    private String correo;  // Correo principal del usuario
    private Roles rol;
    private Estados estado;
    private List<Especialidades> especialidades;

    public UsuarioDTO() {}

    public UsuarioDTO(Integer idUsuario, String nombreUsuario, String nombres, String apellidos, 
                      String dui, Date fechaNacimiento, String correo, Roles rol, 
                      Estados estado, List<Especialidades> especialidades) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.dui = dui;
        this.fechaNacimiento = fechaNacimiento;
        this.correo = correo;
        this.rol = rol;
        this.estado = estado;
        this.especialidades = especialidades;
    }

    // Getters y Setters
    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getDui() {
        return dui;
    }

    public void setDui(String dui) {
        this.dui = dui;
    }

    public Date getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(Date fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Roles getRol() {
        return rol;
    }

    public void setRol(Roles rol) {
        this.rol = rol;
    }

    public Estados getEstado() {
        return estado;
    }

    public void setEstado(Estados estado) {
        this.estado = estado;
    }

    public List<Especialidades> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(List<Especialidades> especialidades) {
        this.especialidades = especialidades;
    }
}
