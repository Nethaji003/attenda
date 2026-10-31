package com.attenda.repository;

import com.attenda.model.Attendance;
import com.attenda.model.Attendance.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStandardAndSectionAndAttendanceDate(Integer standard, String section, LocalDate date);

    Optional<Attendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate date);

    List<Attendance> findByStudentIdAndAttendanceDateBetween(Long studentId, LocalDate from, LocalDate to);

    List<Attendance> findByAttendanceDate(LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    long countPresentByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countTotalByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.attendanceDate = :date AND a.status = 'PRESENT'")
    long countPresentByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.attendanceDate = :date AND a.status = 'ABSENT'")
    long countAbsentByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT a.attendanceDate) FROM Attendance a WHERE a.standard = :std AND a.section = :sec " +
           "AND a.attendanceDate BETWEEN :from AND :to")
    long countWorkingDays(@Param("std") Integer standard, @Param("sec") String section,
                          @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.standard = :std AND a.section = :sec " +
           "AND a.attendanceDate BETWEEN :from AND :to ORDER BY a.attendanceDate DESC")
    List<Attendance> findByClassAndDateRange(@Param("std") Integer standard, @Param("sec") String section,
                                              @Param("from") LocalDate from, @Param("to") LocalDate to);

    boolean existsByStudentIdAndAttendanceDate(Long studentId, LocalDate date);
}
