package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Especialidades;

@Repository
public interface EspecialidadesRepository extends JpaRepository<Especialidades, Integer> {
}
