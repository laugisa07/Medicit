-- Agregar columna descripcion a la tabla Antecedentes
ALTER TABLE Antecedentes ADD COLUMN descripcion LONGTEXT NULL AFTER antecedente;
