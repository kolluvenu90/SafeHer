
package com.safeher.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DataSource dataSource;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody Map<String, String> user) {

        String name = user.get("name");
        String phone = user.get("phone");
        String email = user.get("email");
        String password = user.get("password");

        if (isBlank(name) || isBlank(phone)
                || isBlank(email) || isBlank(password)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "All fields are required"));
        }

        email = email.trim().toLowerCase();

        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Enter a valid email address"));
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Password must contain at least 8 characters"));
        }

        if (password.length() > 72) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Password must not exceed 72 characters"));
        }

        String createTable = """
                CREATE TABLE IF NOT EXISTS safeher_users (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    phone VARCHAR(30) NOT NULL,
                    email VARCHAR(254) NOT NULL UNIQUE,
                    password_hash VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;

        String insertUser = """
                INSERT INTO safeher_users (name, phone, email, password_hash)
                VALUES (?, ?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection()) {

            try (PreparedStatement statement =
                         connection.prepareStatement(createTable)) {
                statement.execute();
            }

            try (PreparedStatement statement =
                         connection.prepareStatement(insertUser)) {

                statement.setString(1, name.trim());
                statement.setString(2, phone.trim());
                statement.setString(3, email);
                statement.setString(4, passwordEncoder.encode(password));

                statement.executeUpdate();
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("message", "Registration successful"));

        } catch (SQLException exception) {
            if ("23505".equals(exception.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        Map.of("message", "This email is already registered"));
            }

            exception.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "Could not register user. Check database settings."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> user) {

        String email = user.get("email");
        String password = user.get("password");

        if (isBlank(email) || isBlank(password)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required"));
        }

        String sql = """
                SELECT password_hash
                FROM safeher_users
                WHERE email = ?
                """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, email.trim().toLowerCase());

            try (ResultSet result = statement.executeQuery()) {
                if (result.next() &&
                        passwordEncoder.matches(
                                password, result.getString("password_hash"))) {

                    return ResponseEntity.ok(
                            Map.of("message", "Login successful"));
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password"));

        } catch (SQLException exception) {
            exception.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "Database error during login"));
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
