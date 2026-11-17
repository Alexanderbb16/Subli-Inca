package com.subliinca.backend;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/csrf")
    public CsrfToken csrfToken(CsrfToken csrfToken) {
        return csrfToken;
    }

    @GetMapping("/session")
    public Map<String, Object> session(Authentication authentication) {
        return Map.of(
                "authenticated", true,
                "username", authentication.getName());
    }
}
