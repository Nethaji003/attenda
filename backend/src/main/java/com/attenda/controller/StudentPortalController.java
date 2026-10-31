package com.attenda.controller;

import com.attenda.dto.StudentDTO;
import com.attenda.model.Attendance;
import com.attenda.model.Mark;
import com.attenda.model.Student;
import com.attenda.repository.AttendanceRepository;
import com.attenda.repository.MarkRepository;
import com.attenda.repository.StudentRepository;
import com.attenda.service.StudentPdfService;
import com.attenda.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller strictly for Authenticated Students (ROLE_STUDENT).
 * All endpoints rely on the server-authenticated security principal.
 * Students can NEVER view or mutate another student's data.
 */
@RestController
@RequestMapping("/student/me")
@RequiredArgsConstructor
public class StudentPortalController {

    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final StudentPdfService studentPdfService;

    private Student getAuthenticatedStudent(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized: No student identity found in session");
        }
        return studentRepository.findByStudentId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Student profile not found for ID: " + auth.getName()));
    }

    /**
     * Read-only student profile info.
     */
    @GetMapping
    public ResponseEntity<StudentDTO> getMyProfile(Authentication auth) {
        Student student = getAuthenticatedStudent(auth);
        return ResponseEntity.ok(studentService.toDTO(student));
    }

    /**
     * Overall attendance statistics & history for authenticated student.
     */
    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> getMyAttendance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication auth) {
        Student student = getAuthenticatedStudent(auth);

        long totalDays = attendanceRepository.countTotalByStudentId(student.getId());
        long presentDays = attendanceRepository.countPresentByStudentId(student.getId());
        long absentDays = Math.max(0, totalDays - presentDays);
        double percentage = totalDays > 0 ? Math.round((presentDays * 100.0 / totalDays) * 10.0) / 10.0 : 0.0;

        // Fetch detailed records
        LocalDate fromDate;
        LocalDate toDate;
        if (year != null && month != null) {
            fromDate = LocalDate.of(year, month, 1);
            toDate = fromDate.withDayOfMonth(fromDate.lengthOfMonth());
        } else {
            // Default to past 180 days
            toDate = LocalDate.now();
            fromDate = toDate.minusMonths(6);
        }

        List<Attendance> records = attendanceRepository.findByStudentIdAndAttendanceDateBetween(student.getId(), fromDate, toDate);

        List<Map<String, Object>> recordList = records.stream()
                .sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed())
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", a.getAttendanceDate().toString());
                    map.put("day", a.getAttendanceDate().getDayOfWeek().name());
                    map.put("status", a.getStatus().name());
                    map.put("remarks", a.getStatus() == Attendance.AttendanceStatus.PRESENT ? "Present in class" : "Absent / Leave");
                    return map;
                }).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalWorkingDays", totalDays);
        resp.put("presentDays", presentDays);
        resp.put("absentDays", absentDays);
        resp.put("attendancePercentage", percentage);
        resp.put("records", recordList);
        return ResponseEntity.ok(resp);
    }

    /**
     * Monthly attendance calendar data.
     */
    @GetMapping("/attendance/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyAttendance(
            @RequestParam int year,
            @RequestParam int month,
            Authentication auth) {
        Student student = getAuthenticatedStudent(auth);

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Attendance> monthRecords = attendanceRepository.findByStudentIdAndAttendanceDateBetween(student.getId(), start, end);

        Map<String, String> dayStatusMap = new HashMap<>();
        for (Attendance a : monthRecords) {
            dayStatusMap.put(a.getAttendanceDate().toString(), a.getStatus().name());
        }

        long presentCount = monthRecords.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        long totalMonthDays = monthRecords.size();
        double monthPct = totalMonthDays > 0 ? Math.round((presentCount * 100.0 / totalMonthDays) * 10.0) / 10.0 : 0.0;

        Map<String, Object> res = new HashMap<>();
        res.put("year", year);
        res.put("month", month);
        res.put("totalDaysRecorded", totalMonthDays);
        res.put("presentDays", presentCount);
        res.put("absentDays", totalMonthDays - presentCount);
        res.put("percentage", monthPct);
        res.put("calendar", dayStatusMap);

        return ResponseEntity.ok(res);
    }

    /**
     * Subject-wise marks list for authenticated student.
     */
    @GetMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> getMyMarks(
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String academicYear,
            Authentication auth) {
        Student student = getAuthenticatedStudent(auth);

        List<Mark> marks;
        if (examType != null && !examType.isBlank() && academicYear != null && !academicYear.isBlank()) {
            marks = markRepository.findByStudentIdAndExamTypeAndAcademicYearAndPublishedTrue(student.getId(), examType, academicYear);
        } else {
            marks = markRepository.findByStudentIdAndPublishedTrue(student.getId());
        }

        List<Map<String, Object>> list = marks.stream().map(m -> {
            Map<String, Object> item = new HashMap<>();
            double max = m.getMaxMarks() != null && m.getMaxMarks() > 0 ? m.getMaxMarks() : 100.0;
            double obt = m.getMarksObtained() != null ? m.getMarksObtained() : 0.0;
            double pct = Math.round((obt * 100.0 / max) * 10.0) / 10.0;
            String grade = studentPdfService.calculateGrade(pct);

            item.put("id", m.getId());
            item.put("subject", m.getSubject());
            item.put("examType", m.getExamType());
            item.put("academicYear", m.getAcademicYear());
            item.put("maxMarks", max);
            item.put("marksObtained", obt);
            item.put("percentage", pct);
            item.put("grade", grade);
            item.put("pass", pct >= 35);
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    /**
     * Examination results grouped by exams with overall aggregates.
     */
    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getMyResults(
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String academicYear,
            Authentication auth) {
        Student student = getAuthenticatedStudent(auth);

        List<Mark> marks = markRepository.findByStudentIdAndPublishedTrue(student.getId());

        // Extract available published exam types and academic years
        Set<String> availableExams = marks.stream().map(Mark::getExamType).collect(Collectors.toCollection(TreeSet::new));
        Set<String> availableYears = marks.stream().map(Mark::getAcademicYear).collect(Collectors.toCollection(TreeSet::new));

        // Filter if requested
        if (examType != null && !examType.isBlank()) {
            marks = marks.stream().filter(m -> m.getExamType().equalsIgnoreCase(examType.trim())).collect(Collectors.toList());
        }
        if (academicYear != null && !academicYear.isBlank()) {
            marks = marks.stream().filter(m -> m.getAcademicYear().equalsIgnoreCase(academicYear.trim())).collect(Collectors.toList());
        }

        double totalMax = marks.stream().mapToDouble(m -> m.getMaxMarks() != null ? m.getMaxMarks() : 100.0).sum();
        double totalObt = marks.stream().mapToDouble(m -> m.getMarksObtained() != null ? m.getMarksObtained() : 0.0).sum();
        double overallPct = totalMax > 0 ? Math.round((totalObt * 100.0 / totalMax) * 10.0) / 10.0 : 0.0;
        String overallGrade = studentPdfService.calculateGrade(overallPct);
        boolean passed = totalMax > 0 && marks.stream().allMatch(m -> {
            double max = m.getMaxMarks() != null && m.getMaxMarks() > 0 ? m.getMaxMarks() : 100.0;
            return (m.getMarksObtained() / max) >= 0.35;
        });

        List<Map<String, Object>> subjectMarks = marks.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            double max = m.getMaxMarks() != null && m.getMaxMarks() > 0 ? m.getMaxMarks() : 100.0;
            double obt = m.getMarksObtained() != null ? m.getMarksObtained() : 0.0;
            double pct = Math.round((obt * 100.0 / max) * 10.0) / 10.0;

            map.put("subject", m.getSubject());
            map.put("examType", m.getExamType());
            map.put("academicYear", m.getAcademicYear());
            map.put("maxMarks", max);
            map.put("marksObtained", obt);
            map.put("percentage", pct);
            map.put("grade", studentPdfService.calculateGrade(pct));
            map.put("pass", pct >= 35);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("availableExams", availableExams);
        resp.put("availableYears", availableYears);
        resp.put("totalMaxMarks", totalMax);
        resp.put("totalObtainedMarks", totalObt);
        resp.put("overallPercentage", overallPct);
        resp.put("overallGrade", overallGrade);
        resp.put("resultStatus", passed ? "PASS" : (totalMax > 0 ? "FAIL" : "NO_RECORDS"));
        resp.put("subjectMarks", subjectMarks);

        return ResponseEntity.ok(resp);
    }

    /**
     * Overall academic performance analytics, chart data, and attendance correlation.
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getMyPerformance(Authentication auth) {
        Student student = getAuthenticatedStudent(auth);

        List<Mark> marks = markRepository.findByStudentIdAndPublishedTrue(student.getId());

        // Attendance stats
        long totalDays = attendanceRepository.countTotalByStudentId(student.getId());
        long presentDays = attendanceRepository.countPresentByStudentId(student.getId());
        double attPct = totalDays > 0 ? Math.round((presentDays * 100.0 / totalDays) * 10.0) / 10.0 : 0.0;

        // Exam-wise aggregation
        Map<String, List<Mark>> examGroups = marks.stream().collect(Collectors.groupingBy(Mark::getExamType));
        List<Map<String, Object>> examProgressList = new ArrayList<>();

        for (Map.Entry<String, List<Mark>> entry : examGroups.entrySet()) {
            double examMax = entry.getValue().stream().mapToDouble(m -> m.getMaxMarks() != null ? m.getMaxMarks() : 100.0).sum();
            double examObt = entry.getValue().stream().mapToDouble(m -> m.getMarksObtained() != null ? m.getMarksObtained() : 0.0).sum();
            double examPct = examMax > 0 ? Math.round((examObt * 100.0 / examMax) * 10.0) / 10.0 : 0.0;

            Map<String, Object> progress = new HashMap<>();
            progress.put("examType", entry.getKey());
            progress.put("totalMax", examMax);
            progress.put("totalObtained", examObt);
            progress.put("percentage", examPct);
            progress.put("grade", studentPdfService.calculateGrade(examPct));
            examProgressList.add(progress);
        }

        // Subject-wise aggregation (average percentage per subject)
        Map<String, List<Mark>> subjectGroups = marks.stream().collect(Collectors.groupingBy(Mark::getSubject));
        List<Map<String, Object>> subjectChart = new ArrayList<>();

        for (Map.Entry<String, List<Mark>> entry : subjectGroups.entrySet()) {
            double sMax = entry.getValue().stream().mapToDouble(m -> m.getMaxMarks() != null ? m.getMaxMarks() : 100.0).sum();
            double sObt = entry.getValue().stream().mapToDouble(m -> m.getMarksObtained() != null ? m.getMarksObtained() : 0.0).sum();
            double sPct = sMax > 0 ? Math.round((sObt * 100.0 / sMax) * 10.0) / 10.0 : 0.0;

            Map<String, Object> sc = new HashMap<>();
            sc.put("subject", entry.getKey());
            sc.put("obtained", sObt);
            sc.put("max", sMax);
            sc.put("percentage", sPct);
            sc.put("grade", studentPdfService.calculateGrade(sPct));
            subjectChart.add(sc);
        }

        double totalMax = marks.stream().mapToDouble(m -> m.getMaxMarks() != null ? m.getMaxMarks() : 100.0).sum();
        double totalObt = marks.stream().mapToDouble(m -> m.getMarksObtained() != null ? m.getMarksObtained() : 0.0).sum();
        double overallPct = totalMax > 0 ? Math.round((totalObt * 100.0 / totalMax) * 10.0) / 10.0 : 0.0;
        String overallGrade = studentPdfService.calculateGrade(overallPct);

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalMaximumMarks", totalMax);
        resp.put("totalObtainedMarks", totalObt);
        resp.put("overallPercentage", overallPct);
        resp.put("overallGrade", overallGrade);
        resp.put("attendancePercentage", attPct);
        resp.put("examProgress", examProgressList);
        resp.put("subjectPerformance", subjectChart);

        return ResponseEntity.ok(resp);
    }

    /**
     * Downloads official PDF marksheet for the authenticated student.
     */
    @GetMapping("/marksheet")
    public ResponseEntity<byte[]> downloadMarksheet(
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String academicYear,
            Authentication auth) throws Exception {
        Student student = getAuthenticatedStudent(auth);

        byte[] pdfBytes = studentPdfService.generateStudentMarksheetPdf(student.getId(), examType, academicYear);

        String filename = "marksheet_" + student.getStudentId() +
                (examType != null ? "_" + examType.replaceAll("\\s+", "_") : "") + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }
}
