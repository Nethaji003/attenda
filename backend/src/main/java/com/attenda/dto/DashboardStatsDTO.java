package com.attenda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long totalStudents;
    private long presentToday;
    private long absentToday;
    private double attendancePercentage;
    private long totalClasses; // 48 (12 standards x 4 sections)
}
