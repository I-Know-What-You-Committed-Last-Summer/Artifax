public class OrderCreateDto
{
    public int CustomerId { get; set; }
    public List<OrderItemCreateDto> Items { get; set; }
}

public class OrderItemCreateDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}