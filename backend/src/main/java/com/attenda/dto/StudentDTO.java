package com.attenda.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StudentDTO {
    private Long id;
    private String studentName;
    private String studentId;
    private Integer rollNumber;
    private Integer standard;
    private String section;
    private LocalDate dateOfBirth;
    private String gender;
    private String parentName;
    private String mobileNumber;
    private String address;
    private String bloodGroup;
    private LocalDate admissionDate;
    private String email;
    private String photoPath;
    private Boolean active;
}
