package com.subliinca.backend;

import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        Map<String, String> detalles = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            detalles.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                "Revisa los campos enviados.",
                request,
                detalles);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MissingServletRequestPartException.class,
            MultipartException.class
    })
    public ResponseEntity<ApiError> manejarSolicitudInvalida(
            Exception exception,
            HttpServletRequest request) {
        String mensaje = exception instanceof MissingServletRequestPartException
                ? "Falta adjuntar el archivo requerido."
                : "La solicitud o el archivo enviado no es válido.";
        return crearRespuesta(HttpStatus.BAD_REQUEST, mensaje, request, Map.of());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> manejarEstadoEsperado(
            ResponseStatusException exception,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String message = exception.getReason() == null
                ? status.getReasonPhrase()
                : exception.getReason();
        return crearRespuesta(status, message, request, Map.of());
    }

    private ResponseEntity<ApiError> crearRespuesta(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> details) {
        ApiError body = new ApiError(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                details);
        return ResponseEntity.status(status).body(body);
    }
}
