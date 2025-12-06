import type {
  UserData,
  LoginPayload,
  Usuario,
  Rol,
  Estado,
  Especialidad,
  Pregunta,
  Respuesta,
  Telefono,
  Correo,
  Antecedente,
  Cita,
  Permiso,
  CrearUsuarioCompletoPayload,
  ActualizarUsuarioPayload,
  CrearCitaPayload,
  ActualizarCitaPayload,
  ApiError,
} from "./types"

const BASE_URL = "http://localhost:80/api"
const TOKEN_KEY = "medicit_token"

// Helper para obtener nombreRol desde estructura plana o anidada
export function getNombreRol(usuario: Usuario): string {
  return usuario.nombreRol || usuario.rol?.nombreRol || ""
}

// Helper para normalizar usuario a estructura plana
export function normalizeUsuario(usuario: Usuario): Usuario {
  return {
    ...usuario,
    nombreRol: getNombreRol(usuario),
    nombreEstado: usuario.nombreEstado || usuario.estado?.estado || "",
    correo: usuario.correo || usuario.correo || "",
  }
}

// Función para convertir snake_case a camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// Función recursiva para convertir las claves de un objeto
function convertKeysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel)
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key)
      acc[camelKey] = convertKeysToCamel(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

class ApiService {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`
    const token = this.getToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }
    console.log('url', url)
    console.log('config', config)
    console.table(config.body)
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorData: ApiError = { message: "Error desconocido" }
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `Error ${response.status}: ${response.statusText}` }
      }
      throw { status: response.status, ...errorData }
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  // ==================== AUTH ====================
  async login(payload: LoginPayload): Promise<UserData> {
    const response = await this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    // Si viene envuelto en userData, extrae eso y convierte
    const userData = response.userData || response
    return convertKeysToCamel(userData) as UserData
  }

  // ==================== USUARIOS ====================
  async getUsuarios(): Promise<Usuario[]> {
    return this.request<Usuario[]>("/usuarios")
  }

  async getUsuario(id: number): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${id}`)
  }

  async crearUsuarioCompleto(payload: CrearUsuarioCompletoPayload): Promise<Usuario> {
    return this.request<Usuario>("/usuarios/completo", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarUsuario(id: number, payload: ActualizarUsuarioPayload): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  async eliminarUsuario(id: number): Promise<void> {
    return this.request<void>(`/usuarios/${id}`, {
      method: "DELETE",
    })
  }

  async asignarEspecialidades(idUsuario: number, especialidades: number[]): Promise<void> {
    return this.request<void>(`/usuarios/${idUsuario}/especialidades`, {
      method: "POST",
      body: JSON.stringify(especialidades),
    })
  }

  // ==================== ROLES ====================
  async getRoles(): Promise<Rol[]> {
    return this.request<Rol[]>("/roles")
  }

  async getRol(id: number): Promise<Rol> {
    return this.request<Rol>(`/roles/${id}`)
  }

  async crearRol(nombreRol: string): Promise<Rol> {
    return this.request<Rol>("/roles", {
      method: "POST",
      body: JSON.stringify({ nombreRol, descripcion: "ninguno" }),
    })
  }

  async actualizarRol(id: number, nombreRol: string): Promise<Rol> {
    return this.request<Rol>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombreRol, descripcion: "ninguno" }),
    })
  }

  async eliminarRol(id: number): Promise<void> {
    return this.request<void>(`/roles/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== ESTADOS ====================
  async getEstados(): Promise<Estado[]> {
    return this.request<Estado[]>("/estados")
  }

  async getEstado(id: number): Promise<Estado> {
    return this.request<Estado>(`/estados/${id}`)
  }

  async crearEstado(nombreEstado: string): Promise<Estado> {
    return this.request<Estado>("/estados", {
      method: "POST",
      body: JSON.stringify({ nombreEstado }),
    })
  }

  async actualizarEstado(id: number, nombreEstado: string): Promise<Estado> {
    return this.request<Estado>(`/estados/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombreEstado }),
    })
  }

  async eliminarEstado(id: number): Promise<void> {
    return this.request<void>(`/estados/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== ESPECIALIDADES ====================
  async getEspecialidades(): Promise<Especialidad[]> {
    return this.request<Especialidad[]>("/especialidades")
  }

  async getEspecialidad(id: number): Promise<Especialidad> {
    return this.request<Especialidad>(`/especialidades/${id}`)
  }

  async crearEspecialidad(nombreEspecialidad: string): Promise<Especialidad> {
    return this.request<Especialidad>("/especialidades", {
      method: "POST",
      body: JSON.stringify({ nombreEspecialidad, descripcion: "ninguno" }),
    })
  }

  async actualizarEspecialidad(id: number, nombreEspecialidad: string): Promise<Especialidad> {
    return this.request<Especialidad>(`/especialidades/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombreEspecialidad, descripcion: "ninguno" }),
    })
  }

  async eliminarEspecialidad(id: number): Promise<void> {
    return this.request<void>(`/especialidades/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== PREGUNTAS ====================
  async getPreguntas(): Promise<Pregunta[]> {
    return this.request<Pregunta[]>("/preguntas")
  }

  async getPregunta(id: number): Promise<Pregunta> {
    return this.request<Pregunta>(`/preguntas/${id}`)
  }

  async crearPregunta(pregunta: string): Promise<Pregunta> {
    return this.request<Pregunta>("/preguntas", {
      method: "POST",
      body: JSON.stringify({ pregunta }),
    })
  }

  async actualizarPregunta(id: number, pregunta: string): Promise<Pregunta> {
    return this.request<Pregunta>(`/preguntas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ pregunta }),
    })
  }

  async eliminarPregunta(id: number): Promise<void> {
    return this.request<void>(`/preguntas/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== RESPUESTAS ====================
  async getRespuestas(): Promise<Respuesta[]> {
    return this.request<Respuesta[]>("/respuestas")
  }

  async getRespuesta(id: number): Promise<Respuesta> {
    return this.request<Respuesta>(`/respuestas/${id}`)
  }

  async crearRespuesta(payload: Omit<Respuesta, "idRespuesta">): Promise<Respuesta> {
    return this.request<Respuesta>("/respuestas", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarRespuesta(id: number, respuesta: string): Promise<Respuesta> {
    return this.request<Respuesta>(`/respuestas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ respuesta }),
    })
  }

  async eliminarRespuesta(id: number): Promise<void> {
    return this.request<void>(`/respuestas/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== TELÉFONOS ====================
  async getTelefonos(): Promise<Telefono[]> {
    return this.request<Telefono[]>("/telefonos")
  }

  async getTelefono(id: number): Promise<Telefono> {
    return this.request<Telefono>(`/telefonos/${id}`)
  }

  async crearTelefono(payload: Omit<Telefono, "idTelefono">): Promise<Telefono> {
    return this.request<Telefono>("/telefonos", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarTelefono(id: number, numero: string): Promise<Telefono> {
    return this.request<Telefono>(`/telefonos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ numero }),
    })
  }

  async eliminarTelefono(id: number): Promise<void> {
    return this.request<void>(`/telefonos/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== CORREOS ====================
  async getCorreos(): Promise<Correo[]> {
    return this.request<Correo[]>("/correos")
  }

  async getCorreo(id: number): Promise<Correo> {
    return this.request<Correo>(`/correos/${id}`)
  }

  async crearCorreo(payload: Omit<Correo, "idCorreo">): Promise<Correo> {
    return this.request<Correo>("/correos", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarCorreo(id: number, correo: string): Promise<Correo> {
    return this.request<Correo>(`/correos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ correo }),
    })
  }

  async eliminarCorreo(id: number): Promise<void> {
    return this.request<void>(`/correos/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== CONTRASEÑAS ====================
  async cambiarContrasenia(id: number, contrasenia: string): Promise<void> {
    return this.request<void>(`/contrasenias/${id}`, {
      method: "PUT",
      body: JSON.stringify({ contrasenia }),
    })
  }

  // ==================== ANTECEDENTES ====================
  async getAntecedentes(): Promise<Antecedente[]> {
    return this.request<Antecedente[]>("/antecedentes")
  }

  async getAntecedente(id: number): Promise<Antecedente> {
    return this.request<Antecedente>(`/antecedentes/${id}`)
  }

  async crearAntecedente(payload: { idPaciente: number; tipo?: string; descripcion: string }): Promise<Antecedente> {
    return this.request<Antecedente>("/antecedentes", {
      method: "POST",
      body: JSON.stringify({
        usuario: { idUsuario: payload.idPaciente },
        antecedente: payload.tipo,
        descripcion: payload.descripcion,
      }),
    })
  }

  async actualizarAntecedente(
    id: number,
    payload: { antecedente?: string; descripcion?: string }
  ): Promise<Antecedente> {
    return this.request<Antecedente>(`/antecedentes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  async eliminarAntecedente(id: number): Promise<void> {
    return this.request<void>(`/antecedentes/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== CITAS ====================
  async getCitas(): Promise<Cita[]> {
    return this.request<Cita[]>("/citas")
  }

  async getCita(id: number): Promise<Cita> {
    return this.request<Cita>(`/citas/${id}`)
  }

  async getCitasPorMedico(idMedico: number): Promise<Cita[]> {
    return this.request<Cita[]>(`/citas/medico/${idMedico}`)
  }

  async getCitasPorPaciente(idPaciente: number): Promise<Cita[]> {
    return this.request<Cita[]>(`/citas/paciente/${idPaciente}`)
  }

  async crearCita(payload: CrearCitaPayload): Promise<Cita> {
    return this.request<Cita>("/citas", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarCita(id: number, payload: ActualizarCitaPayload): Promise<Cita> {
    return this.request<Cita>(`/citas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  async eliminarCita(id: number): Promise<void> {
    return this.request<void>(`/citas/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== PERMISOS ====================
  async getPermisos(): Promise<Permiso[]> {
    const response = await this.request<any[]>("/permisos")
    // Procesar permisos para extraer idRol del objeto rol anidado
    return response.map((permiso: any) => ({
      idPermiso: permiso.idPermiso || permiso.id_permiso,
      idRol: permiso.rol?.idRol || permiso.rol?.id_rol || permiso.idRol || permiso.id_rol,
      modulo: permiso.modulo,
      ver: permiso.ver,
      crear: permiso.crear,
      editar: permiso.editar,
      eliminar: permiso.eliminar,
      descargar: permiso.descargar,
    }))
  }

  async getPermiso(id: number): Promise<Permiso> {
    return this.request<Permiso>(`/permisos/${id}`)
  }

  async getPermisosPorRol(idRol: number): Promise<Permiso[]> {
    const response = await this.request<any[]>(`/permisos/rol/${idRol}`)
    return response.map((permiso: any) => ({
      idPermiso: permiso.idPermiso || permiso.id_permiso,
      idRol: permiso.rol?.idRol || permiso.rol?.id_rol || permiso.idRol || permiso.id_rol,
      modulo: permiso.modulo,
      ver: permiso.ver,
      crear: permiso.crear,
      editar: permiso.editar,
      eliminar: permiso.eliminar,
      descargar: permiso.descargar,
    }))
  }

  async crearPermiso(payload: Omit<Permiso, "idPermiso" | "nombreRol">): Promise<Permiso> {
    return this.request<Permiso>("/permisos", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async actualizarPermiso(id: number, payload: Partial<Permiso>): Promise<Permiso> {
    return this.request<Permiso>(`/permisos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  async eliminarPermiso(id: number): Promise<void> {
    return this.request<void>(`/permisos/${id}`, {
      method: "DELETE",
    })
  }
}

export const api = new ApiService()
