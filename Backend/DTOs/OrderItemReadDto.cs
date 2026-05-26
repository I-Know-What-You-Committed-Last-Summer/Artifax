namespace Backend.DTOs
{
    public class OrderItemReadDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } // The frontend needs this!
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Price at the time of purchase
    }
}