// ==================== TIPOS BASE ====================
export interface Usuario {
  idUsuario: number
  nombreUsuario: string
  nombres: string
  apellidos: string
  correo?: string
  dui?: string
  fechaNacimiento?: string
  idRol?: number
  nombreRol?: string
  idEstado?: number
  nombreEstado?: string
  // Soporte para estructura anidada del endpoint /api/users
  rol?: {
    idRol: number
    nombreRol: string
    descripcion?: string
    rolesPermisosModulos?: any[]
  }
  estado?: {
    idEstado: number
    estado: string
    descripcion?: string
  }
  especialidades?: Array<{
    idEspecialidad: number
    nombreEspecialidad: string
    descripcion?: string
  }>
}

export interface PermisoModulo {
  ver: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
  descargar: boolean
}

export interface Permisos {
  modulo_usuarios?: PermisoModulo
  modulo_citas?: PermisoModulo
  modulo_medico?: PermisoModulo
  modulo_administrativo?: PermisoModulo
  modulo_catalogos?: PermisoModulo
  modulo_configuracion?: PermisoModulo
  modulo_dashboard?: PermisoModulo
  modulo_inicio?: PermisoModulo
  [key: string]: PermisoModulo | undefined
}

export interface UserData extends Usuario {
  permisos: Permisos
}

// ==================== ENTIDADES ====================
export interface Rol {
  idRol: number
  nombreRol: string
}

export interface Estado {
  idEstado: number
  estado: string
  nombreEstado?: string
  descripcion?: string
}

export interface Especialidad {
  idEspecialidad: number
  nombreEspecialidad: string
}

export interface Pregunta {
  idPregunta: number
  pregunta: string
}

export interface Respuesta {
  idRespuesta: number
  respuesta: string
  idPregunta: number
  idUsuario: number
}

export interface PreguntaRespuesta {
  idPregunta: number
  respuesta: string
}

export interface Telefono {
  idTelefono?: number
  numero: string
  usuario: { idUsuario: number }
  idUsuario?: number
}

export interface Correo {
  idCorreo?: number
  correo: string
  usuario: { idUsuario: number }
  idUsuario?: number
}

export interface Antecedente {
  idAntecedente: number
  antecedente?: string
  descripcion?: string
  tipo?: string
  usuario?: Usuario
  idPaciente?: number
  paciente?: Usuario
}

export interface Cita {
  idCita: number
  fechaHora: string
  motivo: string
  // Respuesta flat del backend
  idPaciente?: number
  nombrePaciente?: string
  idMedico?: number
  nombreMedico?: string
  estadoCita?: string
  // Respuesta con objetos anidados (compatibilidad)
  paciente?: Usuario
  medico?: Usuario
  estado?: Estado
}

export interface Permiso {
  idPermiso: number
  idRol?: number
  nombreRol?: string
  modulo: string
  ver: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
  descargar: boolean
  // Soporte para estructura anidada del backend
  rol?: {
    idRol: number
    nombreRol?: string
  }
}

// ==================== PAYLOADS ====================
export interface LoginPayload {
  nombreUsuario: string
  contrasenia: string
}

export interface CrearUsuarioCompletoPayload {
  nombreUsuario: string
  contrasenia: string
  nombres: string
  apellidos: string
  dui: string
  fechaNacimiento: string
  correo: string
  telefono: string
  idRol: number
  idEstado: number
  especialidades?: number[]
  preguntasRespuestas?: PreguntaRespuesta[]
}

export interface ActualizarUsuarioPayload {
  nombreUsuario?: string
  nombres?: string
  apellidos?: string
  correo?: string
  idRol?: number
  idEstado?: number
}

export interface CrearCitaPayload {
  paciente: { idUsuario: number }
  medico: { idUsuario: number }
  fechaHora: string
  motivo: string
  estado: { idEstado: number }
}

export interface ActualizarCitaPayload {
  fechaHora?: string
  motivo?: string
  estado?: { idEstado: number }
}

// ==================== RESPUESTAS API ====================
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
