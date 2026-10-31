package com.attenda.service;

import com.attenda.model.Mark;
import com.attenda.model.Student;
import com.attenda.repository.AttendanceRepository;
import com.attenda.repository.MarkRepository;
import com.attenda.repository.StudentRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentPdfService {

    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;
    private final AttendanceRepository attendanceRepository;

    /**
     * Calculates Grade based on percentage
     */
    public String calculateGrade(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 35) return "D";
        return "F";
    }

    public byte[] generateStudentMarksheetPdf(Long studentId, String examType, String academicYear) throws DocumentException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Mark> marksList;
        if (examType != null && !examType.isBlank() && academicYear != null && !academicYear.isBlank()) {
            marksList = markRepository.findByStudentIdAndExamTypeAndAcademicYearAndPublishedTrue(studentId, examType, academicYear);
        } else {
            marksList = markRepository.findByStudentIdAndPublishedTrue(studentId);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 40, 40);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // Color Palette
        BaseColor primaryBlue = new BaseColor(26, 86, 219);
        BaseColor darkText = new BaseColor(30, 41, 59);
        BaseColor lightGray = new BaseColor(241, 245, 249);
        BaseColor tableBorder = new BaseColor(226, 232, 240);
        BaseColor passGreen = new BaseColor(16, 185, 129);
        BaseColor failRed = new BaseColor(239, 68, 68);

        Font headerSchoolFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, primaryBlue);
        Font subTitleFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, darkText);
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(100, 116, 139));
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, darkText);
        Font thFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
        Font tdFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, darkText);
        Font tdBold = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, darkText);

        // Header Title Box
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.BOTTOM);
        titleCell.setBorderColor(primaryBlue);
        titleCell.setBorderWidth(2f);
        titleCell.setPaddingBottom(12);

        Paragraph schoolName = new Paragraph("ATTENDA PUBLIC SCHOOL", headerSchoolFont);
        schoolName.setAlignment(Element.ALIGN_CENTER);
        titleCell.addElement(schoolName);

        Paragraph reportTitle = new Paragraph("OFFICIAL STUDENT ACADEMIC MARKSHEET", subTitleFont);
        reportTitle.setAlignment(Element.ALIGN_CENTER);
        titleCell.addElement(reportTitle);

        String examLabel = (examType != null && !examType.isBlank()) ? examType : "All Published Examinations";
        String yearLabel = (academicYear != null && !academicYear.isBlank()) ? academicYear : "Current Session";
        Paragraph sessionInfo = new Paragraph("Examination: " + examLabel + "  |  Academic Session: " + yearLabel,
                new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, darkText));
        sessionInfo.setAlignment(Element.ALIGN_CENTER);
        titleCell.addElement(sessionInfo);

        headerTable.addCell(titleCell);
        doc.add(headerTable);

        doc.add(new Paragraph(" "));

        // Student Info Box (2 Columns Grid)
        PdfPTable studentInfoTable = new PdfPTable(4);
        studentInfoTable.setWidthPercentage(100);
        studentInfoTable.setWidths(new float[]{22f, 28f, 22f, 28f});

        addInfoCell(studentInfoTable, "Student Name:", student.getStudentName(), labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Registration No:", student.getStudentId(), labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Standard / Section:", student.getStandard() + "th - " + student.getSection(), labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Roll Number:", String.valueOf(student.getRollNumber()), labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Date of Birth:", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "—", labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Parent / Guardian:", student.getParentName() != null ? student.getParentName() : "—", labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Contact No:", student.getMobileNumber() != null ? student.getMobileNumber() : "—", labelFont, valueFont, lightGray);
        addInfoCell(studentInfoTable, "Date of Issue:", LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")), labelFont, valueFont, lightGray);

        doc.add(studentInfoTable);
        doc.add(new Paragraph(" "));

        // Attendance Quick Summary
        long totalDays = attendanceRepository.countTotalByStudentId(studentId);
        long presentDays = attendanceRepository.countPresentByStudentId(studentId);
        double attPct = totalDays > 0 ? (presentDays * 100.0 / totalDays) : 0;

        PdfPTable attTable = new PdfPTable(3);
        attTable.setWidthPercentage(100);
        addStatCell(attTable, "Working Days Recorded", String.valueOf(totalDays), primaryBlue);
        addStatCell(attTable, "Days Present / Absent", presentDays + " / " + (totalDays - presentDays), primaryBlue);
        addStatCell(attTable, "Attendance Percentage", String.format("%.1f%%", attPct), attPct >= 75 ? passGreen : failRed);
        doc.add(attTable);

        doc.add(new Paragraph(" "));

        // Marks Table
        PdfPTable marksTable = new PdfPTable(6);
        marksTable.setWidthPercentage(100);
        marksTable.setWidths(new float[]{30f, 18f, 13f, 13f, 13f, 13f});

        String[] headers = {"Subject Name", "Exam Type", "Max Marks", "Obtained", "Percentage", "Grade"};
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, thFont));
            c.setBackgroundColor(primaryBlue);
            c.setPadding(7);
            c.setHorizontalAlignment(Element.ALIGN_CENTER);
            marksTable.addCell(c);
        }

        double totalMax = 0;
        double totalObt = 0;
        boolean allPass = true;

        if (marksList.isEmpty()) {
            PdfPCell emptyCell = new PdfPCell(new Phrase("No published marks recorded for this examination session.", tdFont));
            emptyCell.setColspan(6);
            emptyCell.setPadding(14);
            emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            marksTable.addCell(emptyCell);
        } else {
            for (Mark m : marksList) {
                totalMax += m.getMaxMarks() != null ? m.getMaxMarks() : 100;
                totalObt += m.getMarksObtained() != null ? m.getMarksObtained() : 0;
                double subPct = (m.getMaxMarks() != null && m.getMaxMarks() > 0)
                        ? (m.getMarksObtained() * 100.0 / m.getMaxMarks()) : 0;
                String grade = calculateGrade(subPct);
                if (subPct < 35) allPass = false;

                addTableRow(marksTable, m.getSubject(), Element.ALIGN_LEFT, tdFont);
                addTableRow(marksTable, m.getExamType(), Element.ALIGN_CENTER, tdFont);
                addTableRow(marksTable, String.format("%.0f", m.getMaxMarks()), Element.ALIGN_CENTER, tdFont);
                addTableRow(marksTable, String.format("%.1f", m.getMarksObtained()), Element.ALIGN_CENTER, tdFont);
                addTableRow(marksTable, String.format("%.1f%%", subPct), Element.ALIGN_CENTER, tdFont);
                addTableRow(marksTable, grade, Element.ALIGN_CENTER, tdBold);
            }

            // Total Row
            double overallPct = totalMax > 0 ? (totalObt * 100.0 / totalMax) : 0;
            String overallGrade = calculateGrade(overallPct);

            PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL", tdBold));
            totalLabelCell.setColspan(2);
            totalLabelCell.setBackgroundColor(lightGray);
            totalLabelCell.setPadding(7);
            marksTable.addCell(totalLabelCell);

            addTableRowBg(marksTable, String.format("%.0f", totalMax), lightGray, tdBold);
            addTableRowBg(marksTable, String.format("%.1f", totalObt), lightGray, tdBold);
            addTableRowBg(marksTable, String.format("%.1f%%", overallPct), lightGray, tdBold);
            addTableRowBg(marksTable, overallGrade, lightGray, tdBold);
        }

        doc.add(marksTable);

        doc.add(new Paragraph(" "));

        // Performance Summary Cards Box
        if (totalMax > 0) {
            double overallPct = (totalObt * 100.0 / totalMax);
            String overallGrade = calculateGrade(overallPct);
            String resultStatus = allPass && overallPct >= 35 ? "PASSED" : "FAILED / NEEDS IMPROVEMENT";

            PdfPTable summaryBox = new PdfPTable(3);
            summaryBox.setWidthPercentage(100);
            addStatCell(summaryBox, "Overall Percentage", String.format("%.2f%%", overallPct), primaryBlue);
            addStatCell(summaryBox, "Final Academic Grade", overallGrade, primaryBlue);
            addStatCell(summaryBox, "Final Examination Result", resultStatus, resultStatus.equals("PASSED") ? passGreen : failRed);
            doc.add(summaryBox);
        }

        // Signature footer
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph(" "));

        PdfPTable signTable = new PdfPTable(3);
        signTable.setWidthPercentage(100);
        addSignCell(signTable, "Class Teacher Signature");
        addSignCell(signTable, "Examination Incharge");
        addSignCell(signTable, "Principal / Headmaster");
        doc.add(signTable);

        // Watermark / Security disclaimer note
        Paragraph disclaimer = new Paragraph("This is an electronically generated official academic marksheet from Attenda Portal. Valid without physical stamp if verified with administration.",
                new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, new BaseColor(148, 163, 184)));
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        disclaimer.setSpacingBefore(18);
        doc.add(disclaimer);

        doc.close();
        return baos.toByteArray();
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font lFont, Font vFont, BaseColor bg) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(bg);
        c.setPadding(5);
        c.setBorder(Rectangle.BOX);
        c.setBorderColor(new BaseColor(226, 232, 240));
        c.addElement(new Phrase(label, lFont));
        c.addElement(new Phrase(value != null ? value : "—", vFont));
        table.addCell(c);
    }

    private void addStatCell(PdfPTable table, String title, String val, BaseColor color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBackgroundColor(new BaseColor(248, 250, 252));
        cell.setBorderColor(new BaseColor(226, 232, 240));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph pTitle = new Paragraph(title, new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(100, 116, 139)));
        pTitle.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pTitle);

        Paragraph pVal = new Paragraph(val, new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, color));
        pVal.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pVal);

        table.addCell(cell);
    }

    private void addTableRow(PdfPTable table, String text, int align, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setHorizontalAlignment(align);
        c.setPadding(6);
        c.setBorderColor(new BaseColor(226, 232, 240));
        table.addCell(c);
    }

    private void addTableRowBg(PdfPTable table, String text, BaseColor bg, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setBackgroundColor(bg);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setPadding(6);
        c.setBorderColor(new BaseColor(226, 232, 240));
        table.addCell(c);
    }

    private void addSignCell(PdfPTable table, String title) {
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.TOP);
        c.setBorderColor(new BaseColor(148, 163, 184));
        c.setPaddingTop(6);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph p = new Paragraph(title, new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(71, 85, 105)));
        p.setAlignment(Element.ALIGN_CENTER);
        c.addElement(p);
        table.addCell(c);
    }
}
