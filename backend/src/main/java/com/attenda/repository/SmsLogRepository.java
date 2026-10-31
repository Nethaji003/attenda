package com.attenda.repository;

import com.attenda.model.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    Optional<SmsLog> findByAttendanceId(Long attendanceId);
    List<SmsLog> findByMobileNumber(String mobileNumber);
    boolean existsByAttendanceId(Long attendanceId);
}
