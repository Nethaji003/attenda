package com.attenda.controller;

import com.attenda.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily/pdf")
    public ResponseEntity<byte[]> dailyPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) throws Exception {
        byte[] pdf = reportService.generateDailyAttendancePdf(date);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=attendance_" + date + ".pdf")
                .body(pdf);
    }

    @GetMapping("/daily/excel")
    public ResponseEntity<byte[]> dailyExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) throws Exception {
        byte[] excel = reportService.generateDailyAttendanceExcel(date);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=attendance_" + date + ".xlsx")
                .body(excel);
    }

    @GetMapping("/student/{studentId}/pdf")
    public ResponseEntity<byte[]> studentPdf(@PathVariable Long studentId) throws Exception {
        byte[] pdf = reportService.generateStudentReportPdf(studentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=student_" + studentId + "_report.pdf")
                .body(pdf);
    }
}
