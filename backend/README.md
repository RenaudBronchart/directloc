# Directloc Backend

Backend del proyecto **Directloc** en Java 17, usando Spring Boot y PostgreSQL con autenticación JWT.

## 🚀 Tecnologías

- Java 17
- Spring Boot
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- Maven
- Docker
- Lombok

## 📦 Módulos

- `auth`: Registro, login, y generación de JWT.
- `user`: Entidad y repositorio del usuario.
- `config`: Seguridad y configuración general.

## 🐘 PostgreSQL vía Docker

```bash
docker-compose up -d
