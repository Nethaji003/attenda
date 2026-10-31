package com.attenda.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SaveAttendanceRequest {
    private Integer standard;
    private String section;
    private LocalDate date;
    private List<AttendanceEntry> entries;
    private String markedBy;

    @Data
    public static class AttendanceEntry {
        private Long studentId;
        private String status; // "PRESENT" or "ABSENT"
    }
}
