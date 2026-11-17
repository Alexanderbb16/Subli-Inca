package com.subliinca.backend;

import java.util.List;
import java.util.Arrays;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.boot.web.server.Cookie;
import org.springframework.boot.web.server.servlet.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    private static final String DEFAULT_FRONTEND_ORIGINS =
            "http://127.0.0.1:5500,http://localhost:5500,http://192.168.100.28:5500";

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ServletContextInitializer sessionCookieSettings(
            @Value("${server.servlet.session.cookie.secure:false}") boolean secureCookie) {
        return servletContext -> {
            servletContext.getSessionCookieConfig().setHttpOnly(true);
            servletContext.getSessionCookieConfig().setSecure(secureCookie);
        };
    }

    @Bean
    public CookieSameSiteSupplier sessionCookieSameSiteSupplier(Environment environment) {
        String sameSite = environment.getProperty("server.servlet.session.cookie.same-site", "lax");
        Cookie.SameSite sameSiteValue = Cookie.SameSite.valueOf(
                sameSite.trim().toUpperCase(Locale.ROOT));
        return CookieSameSiteSupplier.of(sameSiteValue).whenHasName("JSESSIONID");
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService(
            PasswordEncoder passwordEncoder,
            @Value("${SUBLI_ADMIN_USERNAME:}") String adminUsername,
            @Value("${SUBLI_ADMIN_PASSWORD:}") String adminPassword) {

        if (adminUsername.isBlank()) {
            throw new IllegalStateException("Falta configurar SUBLI_ADMIN_USERNAME");
        }
        if (adminPassword.length() < 16) {
            throw new IllegalStateException(
                    "SUBLI_ADMIN_PASSWORD debe tener al menos 16 caracteres");
        }

        UserDetails admin = User.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(Environment environment) {
        String allowedOrigins = environment.getProperty(
                "SUBLI_CORS_ALLOWED_ORIGINS", DEFAULT_FRONTEND_ORIGINS);
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
        if (origins.isEmpty() || origins.contains("*")) {
            throw new IllegalStateException(
                    "SUBLI_CORS_ALLOWED_ORIGINS debe contener orígenes explícitos; no se permite '*'");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/admin.html",
                                "/css/**",
                                "/js/**",
                                "/assets/**")
                        .permitAll()
                        .requestMatchers("/api/auth/csrf", "/api/auth/login")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/productos")
                        .permitAll()
                        .requestMatchers("/api/**")
                        .hasRole("ADMIN")
                        .anyRequest()
                        .permitAll())
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) ->
                                response.setStatus(HttpServletResponse.SC_NO_CONTENT))
                        .failureHandler((request, response, exception) ->
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED)))
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(HttpServletResponse.SC_NO_CONTENT)))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED)));

        return http.build();
    }
}
