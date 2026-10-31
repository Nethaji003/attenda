package com.attenda.repository;

import com.attenda.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByStudentIdAndPublishedTrue(Long studentId);
    List<Mark> findByStudentIdAndExamTypeAndAcademicYearAndPublishedTrue(Long studentId, String examType, String academicYear);
    List<Mark> findByStandardAndSectionAndExamTypeAndAcademicYear(
            Integer standard, String section, String examType, String academicYear);

    @Query("SELECT m FROM Mark m WHERE m.standard = :std AND m.section = :sec AND m.academicYear = :year")
    List<Mark> findByClassAndYear(@Param("std") Integer standard,
                                   @Param("sec") String section,
                                   @Param("year") String academicYear);
}
