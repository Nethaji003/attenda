package com.attenda.controller;

import com.attenda.dto.AttendanceDTO;
import com.attenda.dto.SaveAttendanceRequest;
import com.attenda.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/sheet")
    public ResponseEntity<List<AttendanceDTO>> getSheet(
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceSheet(standard, section, date));
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveAttendance(@RequestBody SaveAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.saveAttendance(request));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(attendanceService.getDashboardStats());
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<Map<String, Object>> getStudentSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId));
    }

    @GetMapping("/report/daily")
    public ResponseEntity<List<AttendanceDTO>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyReport(date));
    }

    @GetMapping("/report/monthly")
    public ResponseEntity<List<AttendanceDTO>> getMonthlyReport(
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlyReport(standard, section, year, month));
    }
}
