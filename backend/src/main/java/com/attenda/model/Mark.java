package com.attenda.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject", "exam_type", "academic_year"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "marks", "attendances"})
    private Student student;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private Double marksObtained;

    @Column(nullable = false)
    private Double maxMarks;

    @Column(nullable = false)
    private String examType; // FA1, FA2, SA1, SA2, etc.

    @Column(nullable = false)
    private String academicYear; // e.g., "2024-25"

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 1)
    private String section;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @JsonProperty("studentId")
    public Long getStudentIdValue() {
        return student != null ? student.getId() : null;
    }

    @JsonProperty("studentName")
    public String getStudentNameValue() {
        return student != null ? student.getStudentName() : null;
    }
}
