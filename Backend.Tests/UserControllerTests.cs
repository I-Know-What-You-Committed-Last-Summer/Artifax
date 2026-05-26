using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Artifax.Controllers;
using Artifax.Data;
using Artifax.Models;
using Artifax.DTOs;
using System;
using System.Threading.Tasks; 
using Moq;
using Microsoft.AspNetCore.Http;
using System.Text;

namespace Backend.Tests
{
    public class UserControllerTests
    {

        Employee[] testEmployees = [
            new Employee {EmployeeEmail="employee1@artifax.com",EmployeeName="Emp1",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="employee2@artifax.com",EmployeeName="Emp2",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="employee3@artifax.com",EmployeeName="Emp3",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="admin1@artifax.com",EmployeeName="Ad1",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
            new Employee {EmployeeEmail="admin2@artifax.com",EmployeeName="Ad2",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
            new Employee {EmployeeEmail="admin3@artifax.com",EmployeeName="Ad3",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
        ];

        // Helper method to build an isolated, clean in-memory database context for every test
        private DbContextOptions<ArtifaxContext> GetDbContextOptions()
        {
            return new DbContextOptionsBuilder<ArtifaxContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        async Task<UserController> GetEmptyDummyController ()
        {
            var _options = GetDbContextOptions();
            using var _context = new ArtifaxContext(_options);

            var _controller = new UserController(_context);

            return _controller;
        }

        async Task<UserController> GetPopulatedDummyController ()
        {
            var _options = GetDbContextOptions();
            var _context = new ArtifaxContext(_options);
            
            foreach (var testEmployee in testEmployees)
            {
                testEmployee.EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(testEmployee.EmployeePasswordHash);
                _context.Employees.Add(testEmployee);
            }

            await _context.SaveChangesAsync();
            var _controller = new UserController(_context);

            return _controller;
        }  

        Mock<HttpContext> GetMockSession ()
        {
            var sessionMock = new Mock<ISession>();
            var sessionKey = "UserSessionKey";
            byte[] sessionBytes = Encoding.UTF8.GetBytes("my-session-value");

            // Setup the TryGetValue function to return a specific byte array and return true
            sessionMock.Setup(s => s.TryGetValue(sessionKey, out sessionBytes))
                       .Returns(true);

            var httpContextMock = new Mock<HttpContext>();
            httpContextMock.Setup(c => c.Session).Returns(sessionMock.Object);
            return httpContextMock;
        }

        [Fact]
        public async Task GetEmployee_WhenEmployeeExists()
        {
            //ARRANGE
            var _controller = await GetPopulatedDummyController();

            //ACT
            var _result = await _controller.GetEmployeeByEmail("employee1@artifax.com");

            //ASSERT
            var _actionResult = Assert.IsType<ActionResult<EmployeeReadDto>>(_result);
            var _returnedDto = Assert.IsType<EmployeeReadDto>(_actionResult.Value);
            Assert.Equal("Emp1", _returnedDto.EmployeeName);
        }

        [Fact]
        public async Task GetAdmin_WhenNoAdmin()
        {
            //ARRANGE
            var _controller = await GetPopulatedDummyController();

            //ACT
            var _result = await _controller.GetEmployeeByEmail("admin5@artifax.com");

            //ASSERT
            var _actionResult = Assert.IsType<ActionResult<EmployeeReadDto>>(_result);
            Assert.IsNotType<EmployeeReadDto>(_actionResult.Value);
        }

        [Fact]
        public async Task TestName()
        {
            // Given
            var _controller = await GetPopulatedDummyController();
            var httpContextMock = GetMockSession();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContextMock.Object
            };
        
            // When
            var _dto = await _controller.LoginEmployee(new (){Email="employee1@artifax.com", Password="123"});
        
            // Then
            var _actionResult = Assert.IsType<ActionResult<EmployeeReadDto>> (_dto);
            var _returnedOk = Assert.IsType<OkObjectResult>(_actionResult.Result);
            var _returnedDto = Assert.IsType<EmployeeReadDto>(_returnedOk.Value);
            Assert.Equal("Emp1", _returnedDto.EmployeeName);
        }
    }
}