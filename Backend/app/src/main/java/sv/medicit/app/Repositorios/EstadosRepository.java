package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Estados;

@Repository
public interface EstadosRepository extends JpaRepository<Estados, Integer> {
}
