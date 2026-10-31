package com.attenda.controller;

import com.attenda.model.Mark;
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
            if (mark.getMarksObtained() == null || mark.getMarksObtained() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot be negative"));
            }
            if (mark.getMaxMarks() == null || mark.getMaxMarks() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum marks must be greater than zero"));
            }
            if (mark.getMarksObtained() > mark.getMaxMarks()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot exceed maximum marks (" + mark.getMaxMarks() + ")"));
            }
            if (mark.getPublished() == null) {
                mark.setPublished(true);
            }
            return ResponseEntity.ok(markRepository.save(mark));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMark(@PathVariable Long id, @RequestBody Mark updated) {
        return markRepository.findById(id).map(mark -> {
            if (updated.getMarksObtained() != null) {
                if (updated.getMarksObtained() < 0) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot be negative"));
                }
                double max = updated.getMaxMarks() != null ? updated.getMaxMarks() : mark.getMaxMarks();
                if (updated.getMarksObtained() > max) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Marks obtained cannot exceed maximum marks"));
                }
                mark.setMarksObtained(updated.getMarksObtained());
            }
            if (updated.getMaxMarks() != null && updated.getMaxMarks() > 0) mark.setMaxMarks(updated.getMaxMarks());
            if (updated.getSubject() != null) mark.setSubject(updated.getSubject());
            if (updated.getExamType() != null) mark.setExamType(updated.getExamType());
            if (updated.getPublished() != null) mark.setPublished(updated.getPublished());
            return ResponseEntity.ok(markRepository.save(mark));
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
        markRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
