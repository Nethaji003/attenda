package com.attenda.service;

import com.attenda.model.Student;
import com.attenda.model.StudentDocument;
import com.attenda.repository.StudentDocumentRepository;
import com.attenda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentDocumentService {

    private final StudentDocumentRepository documentRepository;
    private final StudentRepository studentRepository;

    @Value("${app.upload.dir:./uploads/photos}")
    private String uploadDir;

    public List<Map<String, Object>> getDocuments(Long studentId) {
        List<StudentDocument> docs = documentRepository.findByStudentIdOrderByUploadedAtDesc(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (StudentDocument d : docs) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", d.getId());
            map.put("documentType", d.getDocumentType());
            map.put("fileName", d.getFileName());
            map.put("filePath", d.getFilePath());
            map.put("description", d.getDescription() != null ? d.getDescription() : "");
            map.put("uploadedAt", d.getUploadedAt());
            result.add(map);
        }
        return result;
    }

    public StudentDocument uploadDocument(Long studentId, String documentType, String description, MultipartFile file) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Save file to docs sub-directory
        Path docsDir = Paths.get(uploadDir).resolve("docs").toAbsolutePath().normalize();
        Files.createDirectories(docsDir);

        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
        String savedName = "doc_" + studentId + "_" + System.currentTimeMillis() + ext;
        Path dest = docsDir.resolve(savedName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        StudentDocument doc = StudentDocument.builder()
                .student(student)
                .documentType(documentType)
                .fileName(originalName != null ? originalName : savedName)
                .filePath("/uploads/docs/" + savedName)
                .description(description)
                .build();

        return documentRepository.save(doc);
    }

    public void deleteDocument(Long docId) {
        StudentDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        // Delete physical file
        try {
            Path docsDir = Paths.get(uploadDir).resolve("docs").toAbsolutePath().normalize();
            Path file = docsDir.resolve(Paths.get(doc.getFilePath()).getFileName());
            Files.deleteIfExists(file);
        } catch (IOException ignored) {}
        documentRepository.delete(doc);
    }
}
