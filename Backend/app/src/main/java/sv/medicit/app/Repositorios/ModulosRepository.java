package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Modulos;

@Repository
public interface ModulosRepository extends JpaRepository<Modulos, Integer> {
}
