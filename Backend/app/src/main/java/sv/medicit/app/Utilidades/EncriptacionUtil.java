package sv.medicit.app.Utilidades;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utilidad para encriptación de contraseñas usando BCrypt.
 * Proporciona métodos para encriptar y verificar contraseñas.
 */
@Component
public class EncriptacionUtil {
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Encriptar una contraseña en texto plano.
     * 
     * @param contraseniaPlana La contraseña en texto plano
     * @return La contraseña encriptada
     */
    public String encriptarContrasenia(String contraseniaPlana) {
        return passwordEncoder.encode(contraseniaPlana);
    }
    
    /**
     * Verificar si una contraseña en texto plano coincide con una contraseña encriptada.
     * 
     * @param contraseniaPlana La contraseña en texto plano
     * @param contraseniaEncriptada La contraseña encriptada almacenada
     * @return true si coinciden, false en caso contrario
     */
    public boolean verificarContrasenia(String contraseniaPlana, String contraseniaEncriptada) {
        return passwordEncoder.matches(contraseniaPlana, contraseniaEncriptada);
    }
}
