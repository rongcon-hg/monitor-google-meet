import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportMeetingsToExcel = (meetings) => {
  const wb = XLSX.utils.book_new();

  // Danh sách các cuộc họp
  const meetingsData = meetings.map(m => ({
    "Mã phòng": m.code,
    "Thời gian Bắt đầu": m.startTime ? format(new Date(m.startTime), 'dd/MM/yyyy HH:mm:ss') : 'N/A',
    "Thời gian Kết thúc": m.endTime ? format(new Date(m.endTime), 'dd/MM/yyyy HH:mm:ss') : 'N/A',
    "Tổng sự kiện": m.eventCount,
    "Số người tham gia": m.participants.length
  }));
  const meetingsSheet = XLSX.utils.json_to_sheet(meetingsData);
  XLSX.utils.book_append_sheet(wb, meetingsSheet, "Danh sách phòng họp");

  // Chi tiết người tham dự (tất cả các phòng)
  const participantsData = [];
  meetings.forEach(m => {
    m.participants.forEach(p => {
      participantsData.push({
        "Mã phòng": m.code,
        "Email": p.email,
        "Tên": p.name,
        "Thời gian gia nhập": format(new Date(p.joinTime), 'dd/MM/yyyy HH:mm:ss')
      });
    });
  });
  const pSheet = XLSX.utils.json_to_sheet(participantsData);
  XLSX.utils.book_append_sheet(wb, pSheet, "Chi tiết người tham dự");

  // Write file
  XLSX.writeFile(wb, `BaoCao_Domain_Meet_${format(new Date(), 'ddMMyyyy')}.xlsx`);
};
