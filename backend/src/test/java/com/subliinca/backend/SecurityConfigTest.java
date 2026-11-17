package com.subliinca.backend;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(
        controllers = AuthController.class,
        properties = {
                "SUBLI_ADMIN_USERNAME=test-admin",
                "SUBLI_ADMIN_PASSWORD=test-only-password-12345",
                "SUBLI_CORS_ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500"
        })
@Import(SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicCatalogueDoesNotRequireAnAdminSession() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isNotFound());
    }

    @Test
    void csrfEndpointProvidesTheTokenNeededByTheJavaScriptClient() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"));
    }

    @Test
    void csrfTokenFromEndpointCanBeSubmittedToLogin() throws Exception {
        MvcResult tokenResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody = tokenResult.getResponse().getContentAsString();
        Matcher tokenMatcher = Pattern.compile("\"token\":\"([^\"]+)\"")
                .matcher(responseBody);
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find());
        String token = tokenMatcher.group(1);
        MockHttpSession session = (MockHttpSession) tokenResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .header("X-CSRF-TOKEN", token)
                        .param("username", "test-admin")
                        .param("password", "test-only-password-12345"))
                .andExpect(status().isNoContent());
    }

    @Test
    void administrativeReadRequiresAnAdminSession() throws Exception {
        mockMvc.perform(get("/api/productos/admin"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void allAdministrativeMutationRoutesRequireAnAdminSession() throws Exception {
        mockMvc.perform(post("/api/productos").with(csrf()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/productos/1").with(csrf()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/productos/1/estado").with(csrf()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/productos/1").with(csrf()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/productos/imagen").with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void csrfIsRequiredForAdministrativeMutationRoutes() throws Exception {
        mockMvc.perform(post("/api/productos"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidCredentialsAreRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "test-admin")
                        .param("password", "wrong-password"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void successfulLoginCreatesAnAuthenticatedSession() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "test-admin")
                        .param("password", "test-only-password-12345"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/auth/session").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("test-admin"));
    }

    @Test
    void authenticatedAdminCanReachProtectedProductRoutes() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "test-admin")
                        .param("password", "test-only-password-12345"))
                .andExpect(status().isNoContent())
                .andReturn();
        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/productos/admin").session(session))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/productos").session(session).with(csrf()))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/productos/1").session(session).with(csrf()))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/productos/1/estado").session(session).with(csrf()))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/productos/1").session(session).with(csrf()))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/productos/imagen").session(session).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void logoutInvalidatesTheAuthenticatedSession() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "test-admin")
                        .param("password", "test-only-password-12345"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post("/logout").session(session).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/session").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsConfiguredFrontendWithCredentials() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:5500")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string("Access-Control-Allow-Origin", "http://localhost:5500"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void corsRejectsUnlistedFrontendOrigins() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://unlisted.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
