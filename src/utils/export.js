import * as XLSX from 'xlsx';

export const exportToExcel = (participants, summaryData) => {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summarySheet = XLSX.utils.json_to_sheet([
    {
      "Tên báo cáo": "Giám sát Google Meet",
      "Tổng số người tham gia": summaryData.total,
      "Số người đỉnh điểm": summaryData.peak,
      "Tổng thời lượng (giây)": summaryData.duration,
      "Ngày xuất": new Date().toLocaleString('vi-VN')
    }
  ]);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Tóm tắt");

  // Participants Sheet
  const pData = participants.map(p => ({
    "Họ và tên": p.name,
    "Giờ tham gia": new Date(p.joinTime).toLocaleTimeString('vi-VN'),
    "Thời gian nói (giây)": p.talkTime,
    "Chỉ số tích cực (%)": Math.round(p.engagement),
    "Giơ tay": p.handRaised ? "Có" : "Không",
    "Chia sẻ màn hình": p.screenSharing ? "Có" : "Không"
  }));
  const pSheet = XLSX.utils.json_to_sheet(pData);
  XLSX.utils.book_append_sheet(wb, pSheet, "Danh sách người tham dự");

  // Write file
  XLSX.writeFile(wb, "BaoCao_GoogleMeet_Analytics.xlsx");
};

export const copyToClipboard = (participants, summaryData) => {
  const text = `📊 *Tóm tắt cuộc gọi Google Meet*
- *Thời gian:* ${summaryData.duration} giây
- *Số người đỉnh điểm:* ${summaryData.peak}
- *Đang có mặt:* ${summaryData.total}

*Phát biểu nhiều nhất:*
${participants.sort((a, b) => b.talkTime - a.talkTime).slice(0, 3).map(p => `- ${p.name}: ${p.talkTime} giây`).join('\n')}

*Tạo bởi hệ thống Giám sát & Phân tích*`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert("Đã sao chép báo cáo vào khay nhớ tạm! Bạn có thể dán vào Zalo hoặc Slack.");
  }).catch(err => {
    console.error("Lỗi khi sao chép", err);
    alert("Không thể sao chép báo cáo.");
  });
};
