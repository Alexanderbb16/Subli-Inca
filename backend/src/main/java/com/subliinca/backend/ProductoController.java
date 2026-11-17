package com.subliinca.backend;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final long MAX_IMAGE_PIXELS = 40_000_000L;
    private static final Map<String, String> MIME_BY_EXTENSION = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp");

    private final ProductoRepository productoRepository;

    @Value("${subli.product-image-dir:../frontend/assets}")
    private String imageDirectory;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public List<Producto> obtenerProductos() {
        return productoRepository.findByActivoTrue();
    }

    @GetMapping("/admin")
    public List<Producto> obtenerProductosParaAdministracion() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto guardarProducto(@Valid @RequestBody Producto producto) {
        producto.setActivo(true);
        return productoRepository.save(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody Producto producto) {
        Producto productoExistente = buscarProducto(id);
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
        Producto productoExistente = buscarProducto(id);
        productoExistente.setActivo(producto.getActivo());
        return productoRepository.save(productoExistente);
    }

    @PostMapping("/imagen")
    public String guardarImagen(@RequestParam("imagen") MultipartFile imagen) throws IOException {
        byte[] contenido = validarImagen(imagen);
        String extension = obtenerExtensionPermitida(imagen.getOriginalFilename());
        String nombreSeguro = UUID.randomUUID() + "." + extension;

        Path carpetaImagenes = obtenerCarpetaImagenes();
        Files.createDirectories(carpetaImagenes);
        Path rutaArchivo = carpetaImagenes.resolve(nombreSeguro).normalize();
        if (!carpetaImagenes.equals(rutaArchivo.getParent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de imagen no es válido.");
        }
        Files.write(rutaArchivo, contenido, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        return nombreSeguro;
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) throws IOException {
        Producto producto = buscarProducto(id);
        String nombreImagen = producto.getImagen();
        productoRepository.deleteById(id);

        if (nombreImagen != null && !nombreImagen.isBlank()) {
            Path carpetaImagenes = obtenerCarpetaImagenes();
            Path rutaImagen = carpetaImagenes.resolve(nombreImagen).normalize();
            if (carpetaImagenes.equals(rutaImagen.getParent())) {
                Files.deleteIfExists(rutaImagen);
            }
        }
    }

    private Producto buscarProducto(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No se encontró el producto solicitado."));
    }

    private byte[] validarImagen(MultipartFile imagen) throws IOException {
        if (imagen == null || imagen.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una imagen no vacía.");
        }
        if (imagen.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La imagen supera el límite de 5 MB.");
        }

        String extension = obtenerExtensionPermitida(imagen.getOriginalFilename());
        byte[] contenido = imagen.getBytes();
        String mimeReal = detectarMimeReal(contenido);
        if (mimeReal == null || !MIME_BY_EXTENSION.get(extension).equals(mimeReal)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El contenido real de la imagen no coincide con su extensión.");
        }

        String mimeDeclarado = normalizarMime(imagen.getContentType());
        if (mimeDeclarado != null && !mimeDeclarado.equals(mimeReal)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo MIME declarado no coincide con el contenido real de la imagen.");
        }

        if (!"image/webp".equals(mimeReal)) {
            validarImagenDecodificable(contenido);
        }
        return contenido;
    }

    private String obtenerExtensionPermitida(String nombreOriginal) {
        if (nombreOriginal == null || nombreOriginal.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "El archivo debe tener una extensión de imagen permitida.");
        }
        String nombre = nombreOriginal.replace('\\', '/');
        nombre = nombre.substring(nombre.lastIndexOf('/') + 1);
        int punto = nombre.lastIndexOf('.');
        if (punto < 0 || punto == nombre.length() - 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "El archivo debe tener una extensión de imagen permitida.");
        }
        String extension = nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
        if (!MIME_BY_EXTENSION.containsKey(extension)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Solo se permiten imágenes JPEG, PNG o WEBP.");
        }
        return extension;
    }

    private String normalizarMime(String mime) {
        if (mime == null || mime.isBlank()) {
            return null;
        }
        String normalizado = mime.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        return "image/jpg".equals(normalizado) ? "image/jpeg" : normalizado;
    }

    private String detectarMimeReal(byte[] bytes) {
        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47
                && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return "image/png";
        }
        if (bytes.length >= 20
                && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P'
                && (coincideChunk(bytes, "VP8 ")
                        || coincideChunk(bytes, "VP8L")
                        || coincideChunk(bytes, "VP8X"))) {
            long longitudRiff = (bytes[4] & 0xFFL)
                    | ((bytes[5] & 0xFFL) << 8)
                    | ((bytes[6] & 0xFFL) << 16)
                    | ((bytes[7] & 0xFFL) << 24);
            long longitudChunk = (bytes[16] & 0xFFL)
                    | ((bytes[17] & 0xFFL) << 8)
                    | ((bytes[18] & 0xFFL) << 16)
                    | ((bytes[19] & 0xFFL) << 24);
            long finChunk = 12 + longitudChunk + (longitudChunk & 1L);
            if (longitudChunk > 0
                    && longitudRiff >= finChunk
                    && longitudRiff + 8 <= bytes.length) {
                return "image/webp";
            }
        }
        return null;
    }

    private boolean coincideChunk(byte[] bytes, String chunk) {
        for (int index = 0; index < 4; index++) {
            if (bytes[12 + index] != (byte) chunk.charAt(index)) {
                return false;
            }
        }
        return true;
    }

    private void validarImagenDecodificable(byte[] contenido) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(contenido))) {
            if (input == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no es una imagen válida.");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no es una imagen JPEG o PNG válida.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int ancho = reader.getWidth(0);
                int alto = reader.getHeight(0);
                if (ancho <= 0 || alto <= 0 || (long) ancho * alto > MAX_IMAGE_PIXELS) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Las dimensiones de la imagen no son válidas o son demasiado grandes.");
                }
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no es una imagen válida.", exception);
        }
    }

    private Path obtenerCarpetaImagenes() {
        return Paths.get(imageDirectory).toAbsolutePath().normalize();
    }
}
