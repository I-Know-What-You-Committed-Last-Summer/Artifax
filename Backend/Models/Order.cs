#nullable enable
namespace Artifax.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int ItemID { get; set; }
        public DateTime OrderDateTime { get; set; } = DateTime.UtcNow;
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public bool OrderExpedite { get; set; }
        public string Status { get; set; } = "Pending";

        public Branch? Branch { get; set; }
        public Item? Item { get; set; }
        public Employee? Employee { get; set; }
        public ICollection<OrderHistory> OrderHistories { get; set; } = new List<OrderHistory>();
    }
}