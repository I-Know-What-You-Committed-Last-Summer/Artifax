namespace Artifax.DTOs
{
    public class OrderStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty; // e.g., "Pending", "In Progress", "Completed"
        public int? ChangedByEmployeeID { get; set; }
        public string? ChangeReason { get; set; }
    }
}