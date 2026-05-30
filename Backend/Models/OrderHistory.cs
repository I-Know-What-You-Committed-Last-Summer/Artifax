#nullable enable
namespace Artifax.Models
{
    public class OrderHistory
    {
        public int OrderHistoryID { get; set; }
        public int OrderID { get; set; }
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime ChangedDateTime { get; set; } = DateTime.UtcNow;
        public int? ChangedByEmployeeID { get; set; }
        public string? ChangeReason { get; set; }

        public Order? Order { get; set; }
        public Employee? ChangedByEmployee { get; set; }
    }
}
