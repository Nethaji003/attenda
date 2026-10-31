package com.attenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String studentName;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String studentId;

    @NotNull
    @Column(nullable = false)
    private Integer rollNumber;

    @NotNull
    @Min(1) @Max(12)
    @Column(nullable = false)
    private Integer standard;

    @NotBlank
    @Pattern(regexp = "[A-D]")
    @Column(nullable = false, length = 1)
    private String section;

    @NotNull
    private LocalDate dateOfBirth;

    @NotBlank
    @Pattern(regexp = "Male|Female|Other")
    private String gender;

    @NotBlank
    private String parentName;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    @Column(nullable = false, length = 10)
    private String mobileNumber;

    @Column(length = 5)
    private String bloodGroup;

    private LocalDate admissionDate;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String photoPath;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
