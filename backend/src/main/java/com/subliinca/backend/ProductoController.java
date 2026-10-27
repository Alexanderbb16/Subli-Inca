package com.subliinca.backend;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public List<Producto> obtenerProductos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {

        producto.setActivo(true);

        return productoRepository.save(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto producto) {

        Producto productoExistente =
                productoRepository.findById(id).orElse(null);

        if (productoExistente == null) {
            return null;
        }

        productoExistente.setNombre(producto.getNombre());
        productoExistente.setDescripcion(producto.getDescripcion());
        productoExistente.setPrecio(producto.getPrecio());
        productoExistente.setImagen(producto.getImagen());
        productoExistente.setCategoria(producto.getCategoria());
        productoExistente.setActivo(producto.getActivo());

        return productoRepository.save(productoExistente);
    }

    @PutMapping("/{id}/estado")
    public Producto cambiarEstadoProducto(
            @PathVariable Long id,
            @RequestBody Producto producto) {

        Producto productoExistente =
                productoRepository.findById(id).orElse(null);

        if (productoExistente == null) {
            return null;
        }

        productoExistente.setActivo(producto.getActivo());

        return productoRepository.save(productoExistente);
        }

@PostMapping("/imagen")
public String guardarImagen(@RequestParam("imagen") MultipartFile imagen)
        throws IOException {

    String carpeta = "../frontend/assets/";

    Path rutaCarpeta = Paths.get(carpeta);

    if (!Files.exists(rutaCarpeta)) {
        Files.createDirectories(rutaCarpeta);
    }

    Path rutaArchivo =
            rutaCarpeta.resolve(imagen.getOriginalFilename());

    Files.write(rutaArchivo, imagen.getBytes());

    return imagen.getOriginalFilename();
}

@DeleteMapping("/{id}")
public void eliminarProducto(@PathVariable Long id) throws IOException {

    Producto producto = productoRepository.findById(id).orElse(null);

    if (producto == null) {
        return;
    }

    String nombreImagen = producto.getImagen();

    productoRepository.deleteById(id);

    if (nombreImagen != null && !nombreImagen.isEmpty()) {

        Path rutaImagen =
                Paths.get("../frontend/assets/" + nombreImagen);

        Files.deleteIfExists(rutaImagen);
    }
}

    }

