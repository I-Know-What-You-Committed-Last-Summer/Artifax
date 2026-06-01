namespace Artifax.DTOs
{
    public class OrderCreateDto
    {
        public int ItemID { get; set; }
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public bool OrderExpedite { get; set; }
    }
}