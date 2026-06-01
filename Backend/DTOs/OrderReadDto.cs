namespace Artifax.DTOs
{
    public class OrderReadDto
    {
        public int OrderID { get; set; }
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public DateTime OrderDateTime { get; set; }
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public bool OrderExpedite { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
