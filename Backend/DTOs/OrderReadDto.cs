namespace Artifax.DTOs
{
    public class OrderReadDto
    {
        public int OrderID { get; set; }
        public DateTime OrderDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<OrderItemReadDto> OrderItems { get; set; } = new List<OrderItemReadDto>();
    }

    public class OrderItemReadDto
    {
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
