
package com.attenda.controller;
import java.util.Map;
import com.attenda.dto.AuthRequest;
import com.attenda.dto.AuthResponse;
import com.attenda.model.User;
import com.attenda.repository.UserRepository;
import com.attenda.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid username or password"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build());
    }

    private final com.attenda.repository.StudentRepository studentRepository;

    /**
     * Pre-checks student registration number & DOB for Google Form verification stage.
     */
    @PostMapping("/student/verify-details")
    public ResponseEntity<?> verifyStudentDetails(@RequestBody Map<String, String> body) {
        String regNo = body.get("studentId");
        String dob = body.get("dateOfBirth");
        if (regNo == null || regNo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration Number is required"));
        }
        var studentOpt = studentRepository.findByStudentId(regNo.trim());
        if (studentOpt.isEmpty() || !Boolean.TRUE.equals(studentOpt.get().getActive())) {
            return ResponseEntity.status(404).body(Map.of("error", "No active student found with Registration Number: " + regNo));
        }

        var student = studentOpt.get();
        // If dateOfBirth is provided, verify it
        if (dob != null && !dob.trim().isEmpty()) {
            if (student.getDateOfBirth() == null || !student.getDateOfBirth().toString().equals(dob.trim())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Date of Birth does not match student records"));
            }
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "studentName", student.getStudentName(),
                "studentId", student.getStudentId(),
                "standard", student.getStandard(),
                "section", student.getSection()
        ));
    }

    /**
     * Authenticates student after Google Form verification confirmation.
     * Generates a signed JWT with ROLE_STUDENT.
     */
    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> body) {
        String regNo = body.get("studentId");
        String dob = body.get("dateOfBirth");
        boolean formConfirmed = Boolean.parseBoolean(body.getOrDefault("formConfirmed", "false"));

        if (regNo == null || regNo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student Registration Number is required"));
        }

        if (!formConfirmed) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google Form verification is required to complete authentication"));
        }

        var studentOpt = studentRepository.findByStudentId(regNo.trim());
        if (studentOpt.isEmpty() || !Boolean.TRUE.equals(studentOpt.get().getActive())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid student registration or inactive account"));
        }

        var student = studentOpt.get();
        if (dob != null && !dob.trim().isEmpty()) {
            if (student.getDateOfBirth() == null || !student.getDateOfBirth().toString().equals(dob.trim())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials. Date of Birth does not match."));
            }
        }

        String token = jwtUtil.generateToken(student.getStudentId(), "STUDENT");

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", student.getStudentId(),
                "fullName", student.getStudentName(),
                "role", "STUDENT",
                "userId", student.getId(),
                "studentId", student.getStudentId(),
                "standard", student.getStandard(),
                "section", student.getSection()
        ));
    }
}

