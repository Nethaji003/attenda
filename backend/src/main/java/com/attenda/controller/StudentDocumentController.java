package com.attenda.controller;

import com.attenda.service.StudentDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/students/{studentId}/documents")
@RequiredArgsConstructor
public class StudentDocumentController {

    private final StudentDocumentService documentService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDocuments(@PathVariable Long studentId) {
        return ResponseEntity.ok(documentService.getDocuments(studentId));
    }

    @PostMapping
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long studentId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(documentService.uploadDocument(studentId, documentType, description, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long studentId, @PathVariable Long docId) {
        try {
            documentService.deleteDocument(docId);
            return ResponseEntity.ok(Map.of("message", "Document deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
