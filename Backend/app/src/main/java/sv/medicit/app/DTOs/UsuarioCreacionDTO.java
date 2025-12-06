package sv.medicit.app.DTOs;

import java.util.Date;
import java.util.List;

/**
 * DTO para la creación de Usuario con datos relacionados.
 * Permite enviar usuario, contraseña, teléfono, correo y preguntas/respuestas en una sola petición.
 */
public class UsuarioCreacionDTO {
    
    // Datos del Usuario
    private String nombreUsuario;
    private String nombres;
    private String apellidos;
    private String dui;
    private Date fechaNacimiento;
    private Integer idRol;
    private Integer idEstado;
    private List<Integer> idEspecialidades;
    
    // Datos de Contraseña
    private String contrasenia;
    
    // Datos de Teléfono
    private String telefono;
    
    // Datos de Correo
    private String correo;
    
    // Datos de Preguntas y Respuestas
    private List<PreguntaRespuestaDTO> preguntasRespuestas;
    
    // Getters y Setters
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
    
    public Integer getIdRol() {
        return idRol;
    }
    
    public void setIdRol(Integer idRol) {
        this.idRol = idRol;
    }
    
    public Integer getIdEstado() {
        return idEstado;
    }
    
    public void setIdEstado(Integer idEstado) {
        this.idEstado = idEstado;
    }

    public List<Integer> getIdEspecialidades() {
        return idEspecialidades;
    }

    public void setIdEspecialidades(List<Integer> idEspecialidades) {
        this.idEspecialidades = idEspecialidades;
    }
    
    public String getContrasenia() {
        return contrasenia;
    }
    
    public void setContrasenia(String contrasenia) {
        this.contrasenia = contrasenia;
    }
    
    public String getTelefono() {
        return telefono;
    }
    
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public String getCorreo() {
        return correo;
    }
    
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public List<PreguntaRespuestaDTO> getPreguntasRespuestas() {
        return preguntasRespuestas;
    }
    
    public void setPreguntasRespuestas(List<PreguntaRespuestaDTO> preguntasRespuestas) {
        this.preguntasRespuestas = preguntasRespuestas;
    }
    
    /**
     * DTO interno para Preguntas y Respuestas
     */
    public static class PreguntaRespuestaDTO {
        private String pregunta;
        private String respuesta;
        
        public PreguntaRespuestaDTO() {
        }
        
        public PreguntaRespuestaDTO(String pregunta, String respuesta) {
            this.pregunta = pregunta;
            this.respuesta = respuesta;
        }
        
        public String getPregunta() {
            return pregunta;
        }
        
        public void setPregunta(String pregunta) {
            this.pregunta = pregunta;
        }
        
        public String getRespuesta() {
            return respuesta;
        }
        
        public void setRespuesta(String respuesta) {
            this.respuesta = respuesta;
        }
    }
}
