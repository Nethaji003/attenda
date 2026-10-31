package com.attenda.config;

import com.attenda.model.User;
import com.attenda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .email("admin@attenda.edu")
                    .role(User.Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin user created: admin / admin123");
        }

        if (!userRepository.existsByUsername("teacher")) {
            User teacher = User.builder()
                    .username("teacher")
                    .password(passwordEncoder.encode("teacher123"))
                    .fullName("Demo Teacher")
                    .email("teacher@attenda.edu")
                    .role(User.Role.TEACHER)
                    .active(true)
                    .build();
            userRepository.save(teacher);
            log.info("✅ Default teacher user created: teacher / teacher123");
        }

        seedDemoStudentData();
    }

    private final com.attenda.repository.StudentRepository studentRepository;
    private final com.attenda.repository.AttendanceRepository attendanceRepository;
    private final com.attenda.repository.MarkRepository markRepository;

    private void seedDemoStudentData() {
        if (!studentRepository.existsByStudentId("STU1001")) {
            com.attenda.model.Student student = com.attenda.model.Student.builder()
                    .studentId("STU1001")
                    .studentName("Aarav Sharma")
                    .rollNumber(1)
                    .standard(10)
                    .section("A")
                    .dateOfBirth(java.time.LocalDate.of(2008, 5, 15))
                    .gender("Male")
                    .parentName("Rajesh Sharma")
                    .mobileNumber("9876543210")
                    .bloodGroup("O+")
                    .admissionDate(java.time.LocalDate.of(2022, 6, 1))
                    .email("aarav.sharma@attenda.edu")
                    .address("42, Gandhi Nagar, Central Avenue")
                    .active(true)
                    .build();
            student = studentRepository.save(student);
            log.info("✅ Demo student created: Aarav Sharma (STU1001)");

            // Seed attendance records for past 30 days
            java.time.LocalDate today = java.time.LocalDate.now();
            for (int i = 1; i <= 25; i++) {
                java.time.LocalDate d = today.minusDays(i);
                if (d.getDayOfWeek() != java.time.DayOfWeek.SATURDAY && d.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
                    com.attenda.model.Attendance.AttendanceStatus st = (i == 3 || i == 14)
                            ? com.attenda.model.Attendance.AttendanceStatus.ABSENT
                            : com.attenda.model.Attendance.AttendanceStatus.PRESENT;
                    attendanceRepository.save(com.attenda.model.Attendance.builder()
                            .student(student)
                            .attendanceDate(d)
                            .status(st)
                            .standard(10)
                            .section("A")
                            .markedBy("teacher")
                            .build());
                }
            }

            // Seed published marks for Quarterly Examination
            String[] subjects = {"Mathematics", "Science", "English", "Social Science", "Tamil"};
            double[] marks = {95.0, 88.0, 90.0, 92.0, 85.0};
            for (int i = 0; i < subjects.length; i++) {
                markRepository.save(com.attenda.model.Mark.builder()
                        .student(student)
                        .subject(subjects[i])
                        .examType("Quarterly Examination")
                        .academicYear("2024-25")
                        .standard(10)
                        .section("A")
                        .maxMarks(100.0)
                        .marksObtained(marks[i])
                        .published(true)
                        .build());
            }

            // Seed Unit Test 1 marks
            double[] utMarks = {48.0, 44.0, 45.0, 47.0, 42.0};
            for (int i = 0; i < subjects.length; i++) {
                markRepository.save(com.attenda.model.Mark.builder()
                        .student(student)
                        .subject(subjects[i])
                        .examType("Unit Test 1")
                        .academicYear("2024-25")
                        .standard(10)
                        .section("A")
                        .maxMarks(50.0)
                        .marksObtained(utMarks[i])
                        .published(true)
                        .build());
            }
            log.info("✅ Demo student attendance & examination marks initialized");
        }
    }
}
