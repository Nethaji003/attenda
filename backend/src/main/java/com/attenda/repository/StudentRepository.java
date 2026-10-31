package com.attenda.repository;

import com.attenda.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByStandardAndSectionAndActiveTrue(Integer standard, String section);

    List<Student> findByActiveTrue();

    Optional<Student> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId);

    @Query("SELECT s FROM Student s WHERE s.active = true AND " +
           "(LOWER(s.studentName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "CAST(s.rollNumber AS string) LIKE CONCAT('%', :q, '%'))")
    List<Student> searchStudents(@Param("q") String query);

    @Query("SELECT s FROM Student s WHERE s.standard = :std AND s.section = :sec AND s.active = true AND " +
           "(LOWER(s.studentName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "CAST(s.rollNumber AS string) LIKE CONCAT('%', :q, '%'))")
    List<Student> searchInClass(@Param("std") Integer standard, @Param("sec") String section, @Param("q") String query);

    long countByActiveTrue();

    long countByStandardAndSectionAndActiveTrue(Integer standard, String section);
}
