package sv.medicit.app.DTOs;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para las citas.
 * Contiene la información simplificada de una cita para mostrar en el listado.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaSimpleDTO {

    private Integer idCita;

    private Integer idPaciente;

    private String nombrePaciente;

    private Integer idMedico;

    private String nombreMedico;

    private LocalDateTime fechaHora;

    private String motivo;

    private String estadoCita;

}
