package sv.medicit.app.Configuracion;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Configuración de seguridad para la aplicación.
 * Define los beans necesarios para encriptación de contraseñas.
 */
@Configuration
public class ConfiguracionSeguridad {
    
    /**
     * Bean para BCryptPasswordEncoder.
     * Se utiliza para encriptar y verificar contraseñas.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
