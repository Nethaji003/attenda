package com.attenda.controller;

import com.attenda.model.Mark;
import com.attenda.model.Student;
import com.attenda.repository.MarkRepository;
import com.attenda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/marks")
@RequiredArgsConstructor
public class MarkController {

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Mark>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(markRepository.findByStudentId(studentId));
    }

    @GetMapping("/class/{standard}/{section}")
    public ResponseEntity<List<Mark>> getByClass(
            @PathVariable Integer standard,
            @PathVariable String section,
            @RequestParam String year) {
        return ResponseEntity.ok(markRepository.findByClassAndYear(standard, section, year));
    }

    @PostMapping
    public ResponseEntity<?> addMark(@RequestBody Mark mark) {
        try {
            if (mark.getSubject() == null || mark.getSubject().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject is required"));
            }
            if (mark.getMarksObtained() == null || mark.getMarksObtained() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot be negative or empty"));
            }
            if (mark.getMaxMarks() == null || mark.getMaxMarks() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum marks must be greater than zero"));
            }
            if (mark.getMarksObtained() > mark.getMaxMarks()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot exceed maximum marks (" + mark.getMaxMarks() + ")"));
            }
            if (mark.getExamType() == null || mark.getExamType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Exam type is required"));
            }
            if (mark.getAcademicYear() == null || mark.getAcademicYear().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Academic year is required"));
            }

            Long studentId = null;
            if (mark.getStudent() != null && mark.getStudent().getId() != null) {
                studentId = mark.getStudent().getId();
            }
            if (studentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student ID is required"));
            }

            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found with ID: " + studentId));
            }
            mark.setStudent(student);

            if (mark.getStandard() == null) {
                mark.setStandard(student.getStandard());
            }
            if (mark.getSection() == null) {
                mark.setSection(student.getSection());
            }
            if (mark.getPublished() == null) {
                mark.setPublished(true);
            }

            mark.setSubject(mark.getSubject().trim());
            mark.setExamType(mark.getExamType().trim());
            mark.setAcademicYear(mark.getAcademicYear().trim());

            // Check if duplicate entry already exists for student + subject + examType + academicYear
            List<Mark> existing = markRepository.findByStudentId(studentId);
            for (Mark em : existing) {
                if (em.getSubject().equalsIgnoreCase(mark.getSubject()) &&
                    em.getExamType().equalsIgnoreCase(mark.getExamType()) &&
                    em.getAcademicYear().equalsIgnoreCase(mark.getAcademicYear())) {
                    return ResponseEntity.badRequest().body(Map.of("error",
                        "Marks for " + mark.getSubject() + " (" + mark.getExamType() + " - " + mark.getAcademicYear() + ") already exist for this student. Use edit to update."));
                }
            }

            Mark saved = markRepository.save(mark);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to save mark"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMark(@PathVariable Long id, @RequestBody Mark updated) {
        return markRepository.findById(id).map(mark -> {
            try {
                if (updated.getSubject() != null && !updated.getSubject().trim().isEmpty()) {
                    mark.setSubject(updated.getSubject().trim());
                }
                if (updated.getMarksObtained() != null) {
                    if (updated.getMarksObtained() < 0) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot be negative"));
                    }
                    double max = updated.getMaxMarks() != null && updated.getMaxMarks() > 0 ? updated.getMaxMarks() : mark.getMaxMarks();
                    if (updated.getMarksObtained() > max) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot exceed maximum marks (" + max + ")"));
                    }
                    mark.setMarksObtained(updated.getMarksObtained());
                }
                if (updated.getMaxMarks() != null && updated.getMaxMarks() > 0) {
                    if (mark.getMarksObtained() != null && mark.getMarksObtained() > updated.getMaxMarks()) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Maximum marks cannot be less than obtained marks (" + mark.getMarksObtained() + ")"));
                    }
                    mark.setMaxMarks(updated.getMaxMarks());
                }
                if (updated.getExamType() != null && !updated.getExamType().trim().isEmpty()) {
                    mark.setExamType(updated.getExamType().trim());
                }
                if (updated.getAcademicYear() != null && !updated.getAcademicYear().trim().isEmpty()) {
                    mark.setAcademicYear(updated.getAcademicYear().trim());
                }
                if (updated.getPublished() != null) {
                    mark.setPublished(updated.getPublished());
                }

                Mark saved = markRepository.save(mark);
                return ResponseEntity.ok(saved);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to update mark"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<?> togglePublish(@PathVariable Long id, @RequestParam(required = false, defaultValue = "true") boolean publish) {
        return markRepository.findById(id).map(mark -> {
            mark.setPublished(publish);
            return ResponseEntity.ok(markRepository.save(mark));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/publish-bulk")
    public ResponseEntity<?> bulkPublish(
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam String examType,
            @RequestParam String academicYear,
            @RequestParam boolean published) {
        List<Mark> marks = markRepository.findByStandardAndSectionAndExamTypeAndAcademicYear(standard, section, examType, academicYear);
        for (Mark m : marks) {
            m.setPublished(published);
        }
        markRepository.saveAll(marks);
        return ResponseEntity.ok(Map.of(
                "updatedCount", marks.size(),
                "published", published,
                "message", "Successfully " + (published ? "published" : "unpublished") + " " + marks.size() + " marks"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMark(@PathVariable Long id) {
        if (!markRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        markRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Record deleted successfully."));
    }
}
