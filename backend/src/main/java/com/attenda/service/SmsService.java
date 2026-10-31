package com.attenda.service;

import com.attenda.model.SmsLog;
import com.attenda.model.Attendance;
import com.attenda.repository.SmsLogRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SmsLogRepository smsLogRepository;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhone;

    /**
     * Sends SMS for a given attendance record.
     * Prevents duplicates by checking existing logs.
     */
    public SmsLog sendAttendanceSms(Attendance attendance) {
        // Duplicate prevention
        if (smsLogRepository.existsByAttendanceId(attendance.getId())) {
            log.warn("SMS already sent for attendance ID: {}", attendance.getId());
            return smsLogRepository.findByAttendanceId(attendance.getId()).orElse(null);
        }

        String studentName = attendance.getStudent().getStudentName();
        String standard    = getOrdinal(attendance.getStandard());
        String section     = attendance.getSection();
        String status      = attendance.getStatus().name();
        String mobile      = "+91" + attendance.getStudent().getMobileNumber();

        String message = String.format(
            "Dear Parent, your child %s of Class %s-%s is %s today. - Attenda School",
            studentName, standard, section, status
        );

        SmsLog smsLog = SmsLog.builder()
                .attendance(attendance)
                .mobileNumber(attendance.getStudent().getMobileNumber())
                .message(message)
                .build();

        if (smsEnabled && !accountSid.isBlank() && !authToken.isBlank()) {
            try {
                Twilio.init(accountSid, authToken);
                Message twilioMsg = Message.creator(
                        new PhoneNumber(mobile),
                        new PhoneNumber(fromPhone),
                        message
                ).create();

                smsLog.setStatus(SmsLog.SmsStatus.SENT);
                smsLog.setTwilioSid(twilioMsg.getSid());
                smsLog.setSimulated(false);
                log.info("✅ SMS sent to {} for student {}", mobile, studentName);
            } catch (Exception e) {
                smsLog.setStatus(SmsLog.SmsStatus.FAILED);
                smsLog.setErrorMessage(e.getMessage());
                log.error("❌ SMS failed for {}: {}", mobile, e.getMessage());
            }
        } else {
            // Simulation mode
            smsLog.setStatus(SmsLog.SmsStatus.SIMULATED);
            smsLog.setSimulated(true);
            log.info("📱 [SIMULATED SMS] To: {} | Msg: {}", mobile, message);
        }

        return smsLogRepository.save(smsLog);
    }

    private String getOrdinal(int n) {
        return switch (n) {
            case 1 -> "1st";  case 2 -> "2nd";  case 3 -> "3rd";
            case 11 -> "11th"; case 12 -> "12th";
            default -> n + "th";
        };
    }
}
