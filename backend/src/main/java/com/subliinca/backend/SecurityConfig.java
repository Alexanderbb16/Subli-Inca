package com.subliinca.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
public InMemoryUserDetailsManager userDetailsService(PasswordEncoder passwordEncoder) {
    String claveAdmin = System.getenv("SUBLI_ADMIN_PASSWORD");

    if (claveAdmin == null || claveAdmin.isBlank()) {
        throw new IllegalStateException(
            "Falta configurar la variable SUBLI_ADMIN_PASSWORD"
        );
    }

    UserDetails usuario = User.builder()
        .username("admin")
        .password(passwordEncoder.encode(claveAdmin))
        .roles("ADMIN")
        .build();

    return new InMemoryUserDetailsManager(usuario);
}

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(request -> {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(
    java.util.List.of(
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://192.168.100.28:5500"
    )
);

    configuration.setAllowedMethods(
        java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
    );

    configuration.setAllowedHeaders(
        java.util.List.of("*")
    );

    return configuration;
}))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/css/**",
                    "/js/**",
                    "/assets/**"
                ).permitAll()

                .requestMatchers("/api/productos")
                .permitAll()

                .requestMatchers("/api/productos/**")
                .hasRole("ADMIN")
                .anyRequest()
                .permitAll()
            )

            .httpBasic(httpBasic -> {});

        return http.build();
    }
}