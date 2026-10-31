package com.attenda.controller;

import com.attenda.dto.StudentDTO;
import com.attenda.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(studentService.searchStudents(search));
        }
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/class/{standard}/{section}")
    public ResponseEntity<List<StudentDTO>> getByClass(
            @PathVariable Integer standard,
            @PathVariable String section,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(studentService.searchInClass(standard, section, search));
        }
        return ResponseEntity.ok(studentService.getStudentsByClass(standard, section));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestPart("student") StudentDTO dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            return ResponseEntity.ok(studentService.createStudent(dto, photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<?> createJson(@RequestBody StudentDTO dto) {
        try {
            return ResponseEntity.ok(studentService.createStudent(dto, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestPart("student") StudentDTO dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            return ResponseEntity.ok(studentService.updateStudent(id, dto, photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        return ResponseEntity.ok(Map.of("total", studentService.getTotalCount()));
    }
}
