
public class OrderReadDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; }
    public decimal TotalAmount { get; set; }
    
    // This is key: We return a list of items with details
    public List<OrderItemReadDto> OrderItems { get; set; }
}

public class OrderItemReadDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

