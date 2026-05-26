using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Artifax.Controllers;
using Artifax.Data;
using Artifax.Models;
using Artifax.DTOs;
using System;
using System.Threading.Tasks; 

namespace Backend.Tests
{
    public class UserControllerTests
    {

        Employee[] testEmployees = [
            new Employee {EmployeeEmail="employee1@artifax.com",EmployeeName="Emp1",EmployeePasswordHash="123"}, 
            new Employee {EmployeeEmail="employee2@artifax.com",EmployeeName="Emp2",EmployeePasswordHash="123"}, 
            new Employee {EmployeeEmail="employee3@artifax.com",EmployeeName="Emp3",EmployeePasswordHash="123"}, 
        ];
        Admin[] testAdmins = [
            new Admin {AdminEmail="admin1@artifax.com",AdminName="Ad1",AdminPasswordHash="123"}, 
            new Admin {AdminEmail="admin2@artifax.com",AdminName="Ad2",AdminPasswordHash="123"}, 
            new Admin {AdminEmail="admin3@artifax.com",AdminName="Ad3",AdminPasswordHash="123"}, 
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
                _context.Employees.Add(testEmployee);
            }

            foreach (var testAdmin in testAdmins)
            {
                _context.Admins.Add(testAdmin);
            }

            await _context.SaveChangesAsync();
            var _controller = new UserController(_context);

            return _controller;
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
            var _result = await _controller.GetEmployeeByEmail("employee1@artifax.com");

            //ASSERT
            var _actionResult = Assert.IsType<ActionResult<EmployeeReadDto>>(_result);
            var _returnedDto = Assert.IsType<EmployeeReadDto>(_actionResult.Value);
            Assert.Equal("Emp1", _returnedDto.EmployeeName);
        }
    }
}