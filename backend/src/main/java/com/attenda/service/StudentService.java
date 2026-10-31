package com.attenda.service;

import com.attenda.dto.StudentDTO;
import com.attenda.model.Student;
import com.attenda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findByActiveTrue().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByClass(Integer standard, String section) {
        return studentRepository.findByStandardAndSectionAndActiveTrue(standard, section)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public StudentDTO createStudent(StudentDTO dto, MultipartFile photo) throws IOException {
        if (dto.getStudentId() == null || dto.getStudentId().trim().isEmpty()) {
            dto.setStudentId("STU" + (System.currentTimeMillis() % 1000000));
        }
        if (dto.getRollNumber() == null || dto.getRollNumber() <= 0) {
            List<Student> existing = studentRepository.findByStandardAndSectionAndActiveTrue(dto.getStandard(), dto.getSection());
            int nextRoll = existing.stream().mapToInt(Student::getRollNumber).max().orElse(0) + 1;
            dto.setRollNumber(nextRoll);
        }
        if (studentRepository.existsByStudentId(dto.getStudentId())) {
            throw new RuntimeException("Student ID already exists: " + dto.getStudentId());
        }
        Student student = toEntity(dto);
        if (photo != null && !photo.isEmpty()) {
            student.setPhotoPath(savePhoto(photo, dto.getStudentId()));
        }
        return toDTO(studentRepository.save(student));
    }

    public StudentDTO updateStudent(Long id, StudentDTO dto, MultipartFile photo) throws IOException {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setStudentName(dto.getStudentName());
        student.setRollNumber(dto.getRollNumber());
        student.setStandard(dto.getStandard());
        student.setSection(dto.getSection());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setParentName(dto.getParentName());
        student.setMobileNumber(dto.getMobileNumber());
        student.setAddress(dto.getAddress());
        student.setBloodGroup(dto.getBloodGroup());
        student.setAdmissionDate(dto.getAdmissionDate());
        student.setEmail(dto.getEmail());

        if (photo != null && !photo.isEmpty()) {
            student.setPhotoPath(savePhoto(photo, student.getStudentId()));
        }
        return toDTO(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setActive(false);
        studentRepository.save(student);
    }

    public List<StudentDTO> searchStudents(String query) {
        return studentRepository.searchStudents(query).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<StudentDTO> searchInClass(Integer standard, String section, String query) {
        return studentRepository.searchInClass(standard, section, query).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public long getTotalCount() {
        return studentRepository.countByActiveTrue();
    }

    private String savePhoto(MultipartFile file, String studentId) throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse(".jpg");
        String filename = "student_" + studentId + "_" + System.currentTimeMillis() + ext;
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/photos/" + filename;
    }

    public StudentDTO toDTO(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        dto.setStudentId(s.getStudentId());
        dto.setStudentName(s.getStudentName());
        dto.setRollNumber(s.getRollNumber());
        dto.setStandard(s.getStandard());
        dto.setSection(s.getSection());
        dto.setDateOfBirth(s.getDateOfBirth());
        dto.setGender(s.getGender());
        dto.setParentName(s.getParentName());
        dto.setMobileNumber(s.getMobileNumber());
        dto.setAddress(s.getAddress());
        dto.setBloodGroup(s.getBloodGroup());
        dto.setAdmissionDate(s.getAdmissionDate());
        dto.setEmail(s.getEmail());
        String photo = s.getPhotoPath();
        if (photo != null && !photo.isBlank() && !photo.startsWith("/api") && !photo.startsWith("http")) {
            photo = "/api" + photo;
        }
        dto.setPhotoPath(photo);
        dto.setActive(s.getActive());
        return dto;
    }

    private Student toEntity(StudentDTO dto) {
        return Student.builder()
                .studentName(dto.getStudentName())
                .studentId(dto.getStudentId())
                .rollNumber(dto.getRollNumber())
                .standard(dto.getStandard())
                .section(dto.getSection())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .parentName(dto.getParentName())
                .mobileNumber(dto.getMobileNumber())
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .admissionDate(dto.getAdmissionDate())
                .email(dto.getEmail())
                .active(true)
                .build();
    }
}
