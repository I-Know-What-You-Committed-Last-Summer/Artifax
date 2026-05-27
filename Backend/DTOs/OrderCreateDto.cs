namespace Artifax.DTOs
{
    public class OrderCreateDto
    {
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public bool OrderExpedite { get; set; }
        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();
    }

    public class OrderItemCreateDto
    {
        public int ItemID { get; set; }
        public int Quantity { get; set; }
    }
}