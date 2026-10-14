package com.safeher.backend;

import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final JdbcTemplate jdbcTemplate;

    public IncidentController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> reportIncident(
            @RequestBody Map<String, String> incident) {

        String category = incident.get("category");
        String description = incident.get("description");

        if (category == null || category.isBlank()
                || description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Category and description are required"));
        }

        jdbcTemplate.update(
            "INSERT INTO incident_reports (incident_type, description) VALUES (?, ?)",
            category, description
        );

        return ResponseEntity.ok(
                Map.of("message", "Incident report saved successfully"));
    }


@GetMapping
public ResponseEntity<List<Map<String, Object>>> getIncidents() {
    List<Map<String, Object>> incidents = jdbcTemplate.queryForList(
        "SELECT * FROM incident_reports ORDER BY id DESC"
    );
    return ResponseEntity.ok(incidents);
}
}

