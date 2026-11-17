package com.subliinca.backend;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = ProductoController.class,
        properties = {
                "SUBLI_ADMIN_USERNAME=test-admin",
                "SUBLI_ADMIN_PASSWORD=test-only-password-12345",
                "SUBLI_CORS_ALLOWED_ORIGINS=http://localhost:5500"
        })
@Import(SecurityConfig.class)
class ProductoVisibilityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoRepository productoRepository;

    private Producto activo;
    private Producto inactivo;

    @BeforeEach
    void setUp() {
        activo = producto(1L, "Producto visible", true);
        inactivo = producto(2L, "Producto oculto", false);
        when(productoRepository.findByActivoTrue()).thenReturn(List.of(activo));
        when(productoRepository.findAll()).thenReturn(List.of(activo, inactivo));
    }

    @Test
    void publicCatalogueReturnsOnlyActiveProducts() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Producto visible"));

        verify(productoRepository).findByActivoTrue();
    }

    @Test
    void administrativeCatalogueRequiresAdminAndIncludesInactiveProducts() throws Exception {
        mockMvc.perform(get("/api/productos/admin"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/productos/admin").with(user("test-admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$[0].activo").value(true))
                .andExpect(jsonPath("$[1].activo").value(false));

        verify(productoRepository).findAll();
    }

    private Producto producto(Long id, String nombre, boolean activo) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setActivo(activo);
        producto.setPrecio(10.0);
        return producto;
    }
}
