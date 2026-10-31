package com.attenda.service;

import com.attenda.model.*;
import com.attenda.repository.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;

    public byte[] generateDailyAttendancePdf(LocalDate date) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // Title
        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
            com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD,
            new BaseColor(26, 86, 219));
        Paragraph title = new Paragraph("Daily Attendance Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(new Paragraph("Date: " + date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))));
        doc.add(Chunk.NEWLINE);

        List<Attendance> records = attendanceRepository.findByAttendanceDate(date);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        String[] headers = {"Student ID", "Name", "Standard", "Section", "Roll No", "Status"};
        com.itextpdf.text.Font hFont = new com.itextpdf.text.Font(
            com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD, BaseColor.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, hFont));
            cell.setBackgroundColor(new BaseColor(26, 86, 219));
            cell.setPadding(6);
            table.addCell(cell);
        }
        for (Attendance a : records) {
            table.addCell(a.getStudent().getStudentId());
            table.addCell(a.getStudent().getStudentName());
            table.addCell(String.valueOf(a.getStandard()));
            table.addCell(a.getSection());
            table.addCell(String.valueOf(a.getStudent().getRollNumber()));
            PdfPCell statusCell = new PdfPCell(new Phrase(a.getStatus().name()));
            statusCell.setBackgroundColor(a.getStatus() == Attendance.AttendanceStatus.PRESENT
                ? new BaseColor(220, 252, 231) : new BaseColor(254, 226, 226));
            table.addCell(statusCell);
        }
        doc.add(table);
        doc.close();
        return baos.toByteArray();
    }

    public byte[] generateDailyAttendanceExcel(LocalDate date) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Attendance " + date);
            CellStyle headerStyle = wb.createCellStyle();
            Font hFont = wb.createFont();
            hFont.setBold(true);
            hFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(hFont);
            headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            String[] cols = {"Student ID", "Name", "Standard", "Section", "Roll No", "Status", "Parent Mobile"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            List<Attendance> records = attendanceRepository.findByAttendanceDate(date);
            int rowNum = 1;
            for (Attendance a : records) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(a.getStudent().getStudentId());
                row.createCell(1).setCellValue(a.getStudent().getStudentName());
                row.createCell(2).setCellValue(a.getStandard());
                row.createCell(3).setCellValue(a.getSection());
                row.createCell(4).setCellValue(a.getStudent().getRollNumber());
                row.createCell(5).setCellValue(a.getStatus().name());
                row.createCell(6).setCellValue(a.getStudent().getMobileNumber());
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateStudentReportPdf(Long studentId) throws DocumentException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
            com.itextpdf.text.Font.FontFamily.HELVETICA, 16, com.itextpdf.text.Font.BOLD,
            new BaseColor(26, 86, 219));
        doc.add(new Paragraph("Student Report", titleFont));
        doc.add(new Paragraph("Name: " + student.getStudentName()));
        doc.add(new Paragraph("ID: " + student.getStudentId()));
        doc.add(new Paragraph("Class: " + student.getStandard() + "-" + student.getSection()));
        doc.add(Chunk.NEWLINE);

        long total = attendanceRepository.countTotalByStudentId(studentId);
        long present = attendanceRepository.countPresentByStudentId(studentId);
        double pct = total > 0 ? (present * 100.0 / total) : 0;

        doc.add(new Paragraph("--- Attendance Summary ---"));
        doc.add(new Paragraph("Total Days: " + total));
        doc.add(new Paragraph("Present: " + present));
        doc.add(new Paragraph("Absent: " + (total - present)));
        doc.add(new Paragraph(String.format("Percentage: %.1f%%", pct)));
        doc.add(Chunk.NEWLINE);

        List<Mark> marks = markRepository.findByStudentId(studentId);
        if (!marks.isEmpty()) {
            doc.add(new Paragraph("--- Academic Marks ---"));
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            for (String h : new String[]{"Subject", "Exam", "Marks", "Max"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h));
                cell.setBackgroundColor(new BaseColor(26, 86, 219));
                table.addCell(cell);
            }
            for (Mark m : marks) {
                table.addCell(m.getSubject());
                table.addCell(m.getExamType());
                table.addCell(String.valueOf(m.getMarksObtained()));
                table.addCell(String.valueOf(m.getMaxMarks()));
            }
            doc.add(table);
        }
        doc.close();
        return baos.toByteArray();
    }
}
