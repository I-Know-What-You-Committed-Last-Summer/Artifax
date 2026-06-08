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
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore.InMemory.Query.Internal;

namespace Backend.Tests
{
    public class UserControllerTests
    {
        #region classes
            class FakeSession : ISession {
                private readonly Dictionary<string, byte[]> _sessionStorage = new();
                public bool IsAvailable => true;
                public string Id => Guid.NewGuid().ToString();
                public IEnumerable<string> Keys => _sessionStorage.Keys;
                public void Set(string key, byte[] value) => _sessionStorage[key] = value;
                public bool TryGetValue(string key, out byte[] value) => _sessionStorage.TryGetValue(key, out value);
                public void Remove(string key) => _sessionStorage.Remove(key);
                public void Clear() => _sessionStorage.Clear();
                public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
                public Task LoadAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
            }
        #endregion

        Employee[] testEmployees = [
            new Employee {EmployeeEmail="employee1@artifax.com",EmployeeName="Emp1",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="employee2@artifax.com",EmployeeName="Emp2",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="employee3@artifax.com",EmployeeName="Emp3",EmployeePasswordHash="123", EmployeeLevel="Employee"}, 
            new Employee {EmployeeEmail="admin1@artifax.com",EmployeeName="Ad1",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
            new Employee {EmployeeEmail="admin2@artifax.com",EmployeeName="Ad2",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
            new Employee {EmployeeEmail="admin3@artifax.com",EmployeeName="Ad3",EmployeePasswordHash="123", EmployeeLevel="Admin"}, 
        ];

        Branch[] testBranches = [
            new Branch {BranchID=1,BranchName="Johannesburg" },
            new Branch {BranchID=2,BranchName="Centurion" },
            new Branch {BranchID=3,BranchName="Durban" },
            new Branch {BranchID=4,BranchName="Head Office" },
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
            var _context = new ArtifaxContext(_options);

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

            foreach (var testBranch in testBranches)
            {
                _context.Branches.Add(testBranch);
            }

            await _context.SaveChangesAsync();
            var _controller = new UserController(_context);

            return _controller;
        }  

        Mock<HttpContext> GetMockSession ()
        {
            var _fakeSession = new FakeSession();

            var _httpContextMock = new Mock<HttpContext>();
            _httpContextMock.Setup(c => c.Session).Returns(_fakeSession);
            return _httpContextMock;
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
        public async Task LoginEmployee_WhenEmployeeExist()
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

        [Fact]
        public async Task LoginEmployee_WhenEmployeeDoesNotExist()
        {
            // Given
            var _controller = await GetPopulatedDummyController();
            var httpContextMock = GetMockSession();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContextMock.Object
            };
        
            // When
            var _dto = await _controller.LoginEmployee(new (){Email="test@artifax.com", Password="testPass"});
        
            // Then
            var _actionResult = Assert.IsType<ActionResult<EmployeeReadDto>> (_dto);
            Assert.IsType<UnauthorizedObjectResult>(_actionResult.Result);
        }

        [Fact]
        public async Task ChangeExistingEmployeeBranch()
        {
            // Given
            var _controller = await GetPopulatedDummyController();
            var _httpContextMock = GetMockSession();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = _httpContextMock.Object
            };
            await _controller.LoginEmployee(new (){Email="admin1@artifax.com", Password="123"});
        
            // When
            var _response = await _controller.ChangeEmployeeBranch("employee1@artifax.com", 2);
        
            // Then
            var _baseResult = Assert.IsType<ActionResult<EmployeeReadDto>>(_response);
            var _returnedOk = Assert.IsType<OkObjectResult>(_baseResult.Result);
            var _result = Assert.IsType<EmployeeReadDto>(_returnedOk.Value);

            Assert.Equal(2, _result.BranchId);
            Assert.Equal("employee1@artifax.com", _result.EmployeeEmail);
            Assert.Equal("Emp1", _result.EmployeeName);
        }

        [Fact]
        public async Task DeleteNonExistingEmployee()
        {
            // Given
            var _controller = await GetPopulatedDummyController();
            var _httpContextMock = GetMockSession();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = _httpContextMock.Object
            };
            await _controller.LoginEmployee(new (){Email="admin1@artifax.com", Password="123"});
        
            // When
            var _response = await _controller.DeleteEmployee(100);
        
            // Then
            Assert.IsType<NotFoundObjectResult>(_response);
        }

        [Fact]
        public async Task Fetch_CorrectSessionDetails_WhenLoggingIn()
        {
            // Given
            var _controller = await GetPopulatedDummyController();
            var _httpContextMock = GetMockSession();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = _httpContextMock.Object
            };
            await _controller.LoginEmployee(new (){Email="admin1@artifax.com", Password="123"});
        
            // When
            var _response = _controller.GetCurrentUser();
        
            // Then
            var _returnedOk = Assert.IsType<OkObjectResult>(_response);
            var _result = Assert.IsType<CurrentUserDto>(_returnedOk.Value);

            Assert.Equal( "Admin", _result.UserLevel);
            Assert.Equal("admin1@artifax.com", _result.UserEmail);
            Assert.Equal("Ad1", _result.Username);
        }
    }
}