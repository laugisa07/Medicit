package sv.medicit.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO simplificado para Antecedentes.
 * Retorna solo el ID y la descripción del antecedente sin incluir información del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AntecedenteSimpleDTO {

    private Integer idAntecedente;

    private String antecedente;

}
