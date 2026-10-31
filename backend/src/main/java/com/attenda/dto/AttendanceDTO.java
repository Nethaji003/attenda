package com.attenda.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentIdCode;
    private Integer rollNumber;
    private String status;
    private LocalDate attendanceDate;
    private Integer standard;
    private String section;
    private String mobileNumber;
    private String parentName;
    private String photoPath;
}
