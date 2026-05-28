using Xunit;
using Microsoft.AspNetCore.Mvc;
using Artifax.Controllers;
using Artifax.Data;
using Artifax.Models;
using Artifax.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Backend.Tests
{
    public class OrderControllerTests : IDisposable
    {
        private readonly ArtifaxContext _context;
        private readonly OrderController _controller;

        public OrderControllerTests()
        {
            // Create an in-memory database for testing
            var options = new DbContextOptionsBuilder<ArtifaxContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ArtifaxContext(options);
            _controller = new OrderController(_context);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Add test branch
            var branch = new Branch { BranchID = 1, BranchName = "Main Branch" };
            _context.Branches.Add(branch);

            // Add test employee
            var employee = new Employee
            {
                EmployeeId = 1,
                EmployeeName = "John Doe",
                EmployeeEmail = "john@example.com",
                EmployeePasswordHash = "hash",
                BranchId = 1
            };
            _context.Employees.Add(employee);

            // Add test item
            var item = new Item { ItemID = 1, ItemName = "Chair", ItemCategory = "Furniture" };
            _context.Items.Add(item);

            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        #region GetAllOrders Tests

        [Fact]
        public async Task GetAllOrders_ReturnsOkResult()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetAllOrders();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var orders = Assert.IsAssignableFrom<IEnumerable<OrderReadDto>>(okResult.Value);
            Assert.NotEmpty(orders);
        }

        [Fact]
        public async Task GetAllOrders_WithNoOrders_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.GetAllOrders();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var orders = Assert.IsAssignableFrom<IEnumerable<OrderReadDto>>(okResult.Value);
            Assert.Empty(orders);
        }

        #endregion

        #region GetOrderById Tests

        [Fact]
        public async Task GetOrderById_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetOrderById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedOrder = Assert.IsType<OrderReadDto>(okResult.Value);
            Assert.Equal(1, returnedOrder.OrderID);
        }

        [Fact]
        public async Task GetOrderById_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetOrderById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region CreateOrder Tests

        [Fact]
        public async Task CreateOrder_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var orderDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 1,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.CreateOrder(orderDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(OrderController.GetOrderById), createdResult.ActionName);
        }

        [Fact]
        public async Task CreateOrder_WithInvalidBranch_ReturnsBadRequest()
        {
            // Arrange
            var orderDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 999,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.CreateOrder(orderDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }

        [Fact]
        public async Task CreateOrder_WithInvalidItem_ReturnsBadRequest()
        {
            // Arrange
            var orderDto = new OrderCreateDto
            {
                ItemID = 999,
                BranchID = 1,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.CreateOrder(orderDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }

        [Fact]
        public async Task CreateOrder_WithInvalidEmployee_ReturnsBadRequest()
        {
            // Arrange
            var orderDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 1,
                EmployeeID = 999,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.CreateOrder(orderDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }

        #endregion

        #region UpdateOrder Tests

        [Fact]
        public async Task UpdateOrder_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            var updateDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 1,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.UpdateOrder(1, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UpdateOrder_WithCompletedOrder_ReturnsBadRequest()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Completed",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            var updateDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 1,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.UpdateOrder(1, updateDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }

        [Fact]
        public async Task UpdateOrder_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new OrderCreateDto
            {
                ItemID = 1,
                BranchID = 1,
                EmployeeID = 1,
                OrderExpedite = false
            };

            // Act
            var result = await _controller.UpdateOrder(999, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region UpdateOrderStatus Tests

        [Fact]
        public async Task UpdateOrderStatus_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            var statusDto = new OrderStatusUpdateDto { Status = "In Progress" };

            // Act
            var result = await _controller.UpdateOrderStatus(1, statusDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UpdateOrderStatus_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var statusDto = new OrderStatusUpdateDto { Status = "In Progress" };

            // Act
            var result = await _controller.UpdateOrderStatus(999, statusDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region DeleteOrder Tests

        [Fact]
        public async Task DeleteOrder_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            // Act
            var result = await _controller.DeleteOrder(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteOrder_WithCompletedOrder_ReturnsBadRequest()
        {
            // Arrange
            var order = new Order
            {
                OrderID = 1,
                ItemID = 1,
                Status = "Completed",
                OrderDateTime = DateTime.UtcNow,
                BranchID = 1,
                EmployeeID = 1
            };
            _context.Orders.Add(order);
            _context.SaveChanges();

            // Act
            var result = await _controller.DeleteOrder(1);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }

        [Fact]
        public async Task DeleteOrder_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteOrder(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion
    }

    // Helper classes for async LINQ operations
    public class TestAsyncQueryProvider<TEntity> : IQueryProvider
    {
        private readonly IQueryProvider _inner;

        internal TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression)
        {
            return new TestAsyncEnumerable<TEntity>(expression);
        }

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        {
            return new TestAsyncEnumerable<TElement>(expression);
        }

        public object Execute(Expression expression)
        {
            return _inner.Execute(expression);
        }

        public TResult Execute<TResult>(Expression expression)
        {
            return _inner.Execute<TResult>(expression);
        }
    }

    public class TestAsyncEnumerable<T> : EnumerableQuery<T>
    {
        public TestAsyncEnumerable(Expression expression) : base(expression) { }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        }
    }

    public class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;

        public TestAsyncEnumerator(IEnumerator<T> inner)
        {
            _inner = inner;
        }

        public T Current => _inner.Current;

        public ValueTask<bool> MoveNextAsync()
        {
            return new ValueTask<bool>(_inner.MoveNext());
        }

        public ValueTask DisposeAsync()
        {
            _inner.Dispose();
            return default;
        }
    }
}
