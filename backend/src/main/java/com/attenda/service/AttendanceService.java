package com.attenda.service;

import com.attenda.dto.AttendanceDTO;
import com.attenda.dto.SaveAttendanceRequest;
import com.attenda.model.*;
import com.attenda.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SmsService smsService;

    /**
     * Returns attendance sheet for a class on a given date.
     * If no record exists, defaults to ABSENT.
     */
    public List<AttendanceDTO> getAttendanceSheet(Integer standard, String section, LocalDate date) {
        List<Student> students = studentRepository.findByStandardAndSectionAndActiveTrue(standard, section);
        List<Attendance> existing = attendanceRepository.findByStandardAndSectionAndAttendanceDate(standard, section, date);

        Map<Long, Attendance> attendanceMap = existing.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        return students.stream().map(student -> {
            AttendanceDTO dto = new AttendanceDTO();
            dto.setStudentId(student.getId());
            dto.setStudentName(student.getStudentName());
            dto.setStudentIdCode(student.getStudentId());
            dto.setRollNumber(student.getRollNumber());
            dto.setStandard(standard);
            dto.setSection(section);
            dto.setAttendanceDate(date);
            dto.setMobileNumber(student.getMobileNumber());
            dto.setParentName(student.getParentName());
            dto.setPhotoPath(student.getPhotoPath());

            Attendance att = attendanceMap.get(student.getId());
            dto.setStatus(att != null ? att.getStatus().name() : null);
            if (att != null) dto.setId(att.getId());

            return dto;
        }).sorted(Comparator.comparing(AttendanceDTO::getRollNumber))
          .collect(Collectors.toList());
    }

    /**
     * Saves/updates attendance for entire class and triggers SMS.
     */
    @Transactional
    public Map<String, Object> saveAttendance(SaveAttendanceRequest request) {
        List<SmsLog> smsResults = new ArrayList<>();
        int saved = 0;

        for (SaveAttendanceRequest.AttendanceEntry entry : request.getEntries()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + entry.getStudentId()));

            Optional<Attendance> existing = attendanceRepository
                    .findByStudentIdAndAttendanceDate(student.getId(), request.getDate());

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(Attendance.AttendanceStatus.valueOf(entry.getStatus()));
            } else {
                attendance = Attendance.builder()
                        .student(student)
                        .attendanceDate(request.getDate())
                        .status(Attendance.AttendanceStatus.valueOf(entry.getStatus()))
                        .standard(request.getStandard())
                        .section(request.getSection())
                        .markedBy(request.getMarkedBy())
                        .build();
            }
            attendance = attendanceRepository.save(attendance);
            saved++;

            // Send SMS asynchronously (still in transaction for safety)
            try {
                SmsLog log = smsService.sendAttendanceSms(attendance);
                if (log != null) smsResults.add(log);
            } catch (Exception e) {
                log.error("SMS error for student {}: {}", student.getStudentName(), e.getMessage());
            }
        }

        long smsSent = smsResults.stream().filter(s -> s.getStatus() == SmsLog.SmsStatus.SENT).count();
        long smsSimulated = smsResults.stream().filter(s -> s.getStatus() == SmsLog.SmsStatus.SIMULATED).count();
        long smsFailed = smsResults.stream().filter(s -> s.getStatus() == SmsLog.SmsStatus.FAILED).count();

        Map<String, Object> result = new HashMap<>();
        result.put("savedCount", saved);
        result.put("smsSent", smsSent);
        result.put("smsSimulated", smsSimulated);
        result.put("smsFailed", smsFailed);
        result.put("message", "Attendance saved successfully for " + saved + " students.");
        return result;
    }

    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();
        long total = studentRepository.countByActiveTrue();
        long present = attendanceRepository.countPresentByDate(today);
        long absent = attendanceRepository.countAbsentByDate(today);
        double pct = total > 0 ? Math.round((present * 100.0 / total) * 10.0) / 10.0 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", total);
        stats.put("presentToday", present);
        stats.put("absentToday", absent);
        stats.put("attendancePercentage", pct);
        stats.put("totalClasses", 48);
        return stats;
    }

    public Map<String, Object> getStudentAttendanceSummary(Long studentId) {
        long totalDays = attendanceRepository.countTotalByStudentId(studentId);
        long presentDays = attendanceRepository.countPresentByStudentId(studentId);
        long absentDays = totalDays - presentDays;
        double pct = totalDays > 0 ? Math.round((presentDays * 100.0 / totalDays) * 10.0) / 10.0 : 0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalDays", totalDays);
        summary.put("presentDays", presentDays);
        summary.put("absentDays", absentDays);
        summary.put("percentage", pct);
        return summary;
    }

    public List<AttendanceDTO> getDailyReport(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getMonthlyReport(Integer standard, String section, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return attendanceRepository.findByClassAndDateRange(standard, section, from, to)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private AttendanceDTO toDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setStudentId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getStudentName());
        dto.setStudentIdCode(a.getStudent().getStudentId());
        dto.setRollNumber(a.getStudent().getRollNumber());
        dto.setStatus(a.getStatus().name());
        dto.setAttendanceDate(a.getAttendanceDate());
        dto.setStandard(a.getStandard());
        dto.setSection(a.getSection());
        dto.setMobileNumber(a.getStudent().getMobileNumber());
        dto.setParentName(a.getStudent().getParentName());
        dto.setPhotoPath(a.getStudent().getPhotoPath());
        return dto;
    }
}
