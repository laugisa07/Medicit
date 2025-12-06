package sv.medicit.app.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sv.medicit.app.Entidades.Roles;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {
}
