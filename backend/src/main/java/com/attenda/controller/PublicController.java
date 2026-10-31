package com.attenda.controller;

import com.attenda.dto.StudentDTO;
import com.attenda.model.Student;
import com.attenda.repository.StudentRepository;
import com.attenda.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Public endpoints — no authentication required.
 * Used by the Student Register page on the login screen.
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final StudentRepository studentRepository;
    private final StudentService studentService;

    /**
     * Returns basic student info (no sensitive data) for the public register.
     * Fields: name, standard, section, mobile number, roll number.
     */
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getPublicStudentList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer standard,
            @RequestParam(required = false) String section) {

        List<Student> students = new ArrayList<>(studentRepository.findByActiveTrue());

        // Filter by standard
        if (standard != null) {
            students = students.stream()
                    .filter(s -> s.getStandard().equals(standard))
                    .collect(Collectors.toList());
        }
        // Filter by section
        if (section != null && !section.isBlank()) {
            students = students.stream()
                    .filter(s -> s.getSection().equalsIgnoreCase(section))
                    .collect(Collectors.toList());
        }
        // Search filter
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            students = students.stream()
                    .filter(s -> s.getStudentName().toLowerCase().contains(q)
                            || s.getStudentId().toLowerCase().contains(q)
                            || String.valueOf(s.getRollNumber()).contains(q))
                    .collect(Collectors.toList());
        }

        // Sort by standard → section → roll number
        students.sort(Comparator
                .comparingInt(Student::getStandard)
                .thenComparing(Student::getSection)
                .thenComparingInt(Student::getRollNumber));

        // Map to safe public fields using HashMap (avoids Java type-inference issues with Map.of())
        List<Map<String, Object>> result = students.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",           s.getId());
            map.put("studentName",  s.getStudentName());
            map.put("studentId",    s.getStudentId());
            map.put("rollNumber",   s.getRollNumber());
            map.put("standard",     s.getStandard());
            map.put("section",      s.getSection());
            map.put("dateOfBirth",  s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
            map.put("parentName",   s.getParentName() != null ? s.getParentName() : "");
            map.put("address",      s.getAddress() != null ? s.getAddress() : "");
            String photo = s.getPhotoPath() != null ? s.getPhotoPath() : "";
            if (!photo.isBlank() && !photo.startsWith("/api") && !photo.startsWith("http")) {
                photo = "/api" + photo;
            }
            map.put("photoPath",    photo);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Public student registration endpoint — allows open Google-Form admission without login.
     */
    @PostMapping(value = "/students", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerStudent(
            @RequestPart("student") StudentDTO dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            return ResponseEntity.ok(studentService.createStudent(dto, photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/students", consumes = {"application/json"})
    public ResponseEntity<?> registerStudentJson(@RequestBody StudentDTO dto) {
        try {
            return ResponseEntity.ok(studentService.createStudent(dto, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
