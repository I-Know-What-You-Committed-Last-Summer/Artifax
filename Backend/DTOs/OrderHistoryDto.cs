namespace Artifax.DTOs
{
    public class OrderHistoryReadDto
    {
        public int OrderHistoryID { get; set; }
        public int OrderID { get; set; }
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime ChangedDateTime { get; set; }
        public int? ChangedByEmployeeID { get; set; }
        public string? ChangedByEmployeeName { get; set; }
        public string? ChangeReason { get; set; }
    }

    public class OrderHistoryCreateDto
    {
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public int? ChangedByEmployeeID { get; set; }
        public string? ChangeReason { get; set; }
    }
}
