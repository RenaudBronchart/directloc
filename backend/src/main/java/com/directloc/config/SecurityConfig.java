// src/main/java/com/directloc/config/SecurityConfig.java
package com.directloc.config;

import com.directloc.auth.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---- Auth endpoints (públicos) ----
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/test").permitAll()
                        // Debe requerir JWT
                        .requestMatchers("/api/auth/me").authenticated()

                        // ---- Users ----
                        .requestMatchers("/api/users/**").authenticated()

                        // ---- Properties ----
                        .requestMatchers(HttpMethod.GET, "/api/properties/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/properties").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**").authenticated()

                        // ---- Calendar ----
                        // Público: usado por la ficha para pintar días ocupados
                        .requestMatchers(HttpMethod.GET, "/api/calendar/property/**").permitAll()
                        // Privado: vistas de calendario de huésped y anfitrión
                        .requestMatchers(HttpMethod.GET, "/api/calendar/guest").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/calendar/host").authenticated()

                        // ---- Bookings ----
                        .requestMatchers(HttpMethod.GET,   "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.POST,  "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/bookings/**").authenticated()

                        // ---- Profile ----
                        .requestMatchers(HttpMethod.GET, "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/profile/avatar").authenticated()

                        // ---- Messaging ----
                        .requestMatchers("/api/messages/**").authenticated()

                        // ---- Static uploads (público GET) ----
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Default: requiere auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Ajusta orígenes a los que realmente usas
        config.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "https://ton-frontend.com"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // Si necesitas exponer cabeceras personalizadas:
        // config.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }
}
